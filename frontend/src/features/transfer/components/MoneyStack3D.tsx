import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const FLOOR_Y = -1.2;
const STACK_HEIGHT = 0.5;

// Create bill face texture (top of stack) - matches original HTML
function createBillFaceTexture(): THREE.CanvasTexture {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size / 2;
  const ctx = canvas.getContext('2d')!;

  // Green Base
  ctx.fillStyle = '#4b6f44';
  ctx.fillRect(0, 0, size, size / 2);

  // Detail inner area
  ctx.fillStyle = '#6a9e62';
  ctx.fillRect(4, 4, size - 8, size / 2 - 8);

  // Border
  ctx.strokeStyle = '#2a3d26';
  ctx.lineWidth = 2;
  ctx.strokeRect(2, 2, size - 4, size / 2 - 4);

  // Strap/Band across middle
  ctx.fillStyle = '#e6d8ad';
  ctx.fillRect(16, 0, 32, 32);

  // $ Sign on strap
  ctx.fillStyle = '#2f4f2f';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('$', 32, 16);

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  return texture;
}

// Create bill side texture (edges showing stacked bills)
function createBillSideTexture(): THREE.CanvasTexture {
  const w = 64;
  const h = 16;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  // Paper edges - white/grey
  ctx.fillStyle = '#dddddd';
  ctx.fillRect(0, 0, w, h);

  // Layer lines
  ctx.fillStyle = '#aaaaaa';
  for (let i = 0; i < h; i += 3) {
    ctx.fillRect(0, i, w, 1);
  }

  // Strap side visible
  ctx.fillStyle = '#e6d8ad';
  ctx.fillRect(16, 0, 32, h);

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  return texture;
}

// Shared textures (created once)
let sharedBillTexture: THREE.CanvasTexture | null = null;
let sharedSideTexture: THREE.CanvasTexture | null = null;

function getTextures() {
  if (!sharedBillTexture) sharedBillTexture = createBillFaceTexture();
  if (!sharedSideTexture) sharedSideTexture = createBillSideTexture();
  return { billTexture: sharedBillTexture, sideTexture: sharedSideTexture };
}

interface BillStackProps {
  position: [number, number, number];
  delay: number;
}

// Single falling bill stack - matching original proportions
function BillStack({ position, delay }: BillStackProps) {
  const groupRef = useRef<THREE.Group>(null);
  const targetY = position[1];
  const startY = 6;
  const velocityRef = useRef(0);
  const currentYRef = useRef(startY);
  const hasLandedRef = useRef(false);
  const delayCounterRef = useRef(0);

  const { billTexture, sideTexture } = getTextures();

  // Create materials for box faces
  const materials = useMemo(() => [
    new THREE.MeshStandardMaterial({ map: sideTexture, roughness: 0.8 }), // Right
    new THREE.MeshStandardMaterial({ map: sideTexture, roughness: 0.8 }), // Left
    new THREE.MeshStandardMaterial({ map: billTexture, roughness: 0.8 }), // Top
    new THREE.MeshStandardMaterial({ map: billTexture, roughness: 0.8 }), // Bottom
    new THREE.MeshStandardMaterial({ map: sideTexture, roughness: 0.8 }), // Front
    new THREE.MeshStandardMaterial({ map: sideTexture, roughness: 0.8 }), // Back
  ], [billTexture, sideTexture]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // Wait for delay
    if (delayCounterRef.current < delay) {
      delayCounterRef.current += delta;
      groupRef.current.position.y = startY;
      groupRef.current.visible = false;
      return;
    }

    groupRef.current.visible = true;

    if (!hasLandedRef.current) {
      // Apply gravity
      velocityRef.current -= 0.018;
      currentYRef.current += velocityRef.current;

      // Check for landing
      if (currentYRef.current <= targetY) {
        currentYRef.current = targetY;
        velocityRef.current *= -0.3; // Bounce

        if (Math.abs(velocityRef.current) < 0.01) {
          hasLandedRef.current = true;
          velocityRef.current = 0;
        }
      }

      groupRef.current.position.y = currentYRef.current;
    }
  });

  // Box dimensions: width 2.2, height 0.5, depth 1.0 (matching original)
  return (
    <group ref={groupRef} position={[position[0], startY, position[2]]}>
      <mesh castShadow receiveShadow material={materials}>
        <boxGeometry args={[2.2, STACK_HEIGHT, 1.0]} />
      </mesh>
    </group>
  );
}

// Scene with all stacks
function MoneyScene({ stacks }: { stacks: ReturnType<typeof getStackConfig> }) {
  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={1.2}
        color={0xffd700}
        castShadow
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
      />

      {stacks.map((stack, stackIndex) =>
        Array.from({ length: stack.count }).map((_, i) => (
          <BillStack
            key={`${stackIndex}-${i}`}
            position={[stack.x, FLOOR_Y + i * STACK_HEIGHT, stack.z]}
            delay={stack.delay + i * 0.06}
          />
        ))
      )}
    </>
  );
}

// Stack configuration based on amount
function getStackConfig(amount: number): { count: number; x: number; z: number; delay: number }[] {
  if (amount <= 0) return [];

  // $1-10: Single small stack
  if (amount < 11) {
    return [
      { count: 2, x: 0, z: 0, delay: 0 },
    ];
  }

  // $11-25: Two stacks
  if (amount < 26) {
    return [
      { count: 2, x: -1.2, z: 0, delay: 0 },
      { count: 3, x: 1.2, z: 0, delay: 0.08 },
    ];
  }

  // $26-50: Three stacks
  if (amount < 51) {
    return [
      { count: 2, x: -1.8, z: 0, delay: 0 },
      { count: 4, x: 0, z: 0, delay: 0.05 },
      { count: 2, x: 1.8, z: 0, delay: 0.1 },
    ];
  }

  // $51-75: Four stacks
  if (amount < 76) {
    return [
      { count: 3, x: -2.6, z: 0, delay: 0 },
      { count: 4, x: -0.9, z: 0, delay: 0.04 },
      { count: 4, x: 0.9, z: 0, delay: 0.08 },
      { count: 3, x: 2.6, z: 0, delay: 0.12 },
    ];
  }

  // $76-100: Five stacks (full display)
  return [
    { count: 3, x: -3.4, z: 0, delay: 0 },
    { count: 5, x: -1.7, z: 0, delay: 0.04 },
    { count: 6, x: 0, z: 0, delay: 0.08 },
    { count: 5, x: 1.7, z: 0, delay: 0.12 },
    { count: 3, x: 3.4, z: 0, delay: 0.16 },
  ];
}

// Get tier for remounting
function getAmountTier(amount: number): number {
  if (amount <= 0) return 0;
  if (amount < 11) return 1;
  if (amount < 26) return 2;
  if (amount < 51) return 3;
  if (amount < 76) return 4;
  return 5;
}

interface MoneyStack3DProps {
  amount: number;
  className?: string;
}

export function MoneyStack3D({ amount, className }: MoneyStack3DProps) {
  const tier = getAmountTier(amount);
  const stacks = useMemo(() => getStackConfig(amount), [amount]);
  const [restoreKey, setRestoreKey] = useState(0);

  return (
    <div className={className} style={{ height: '140px', width: '100%' }}>
      {amount > 0 ? (
        <Canvas
          key={`${tier}-${restoreKey}`}
          camera={{ position: [0, 5, 9], fov: 40 }}
          gl={{
            antialias: false,
            pixelRatio: 1,
            powerPreference: 'low-power',
            failIfMajorPerformanceCaveat: false,
          }}
          shadows
          onCreated={({ gl }) => {
            const canvas = gl.domElement;
            canvas.addEventListener('webglcontextlost', (e) => {
              e.preventDefault();
              console.warn('WebGL context lost in MoneyStack3D - will restore');
            });
            canvas.addEventListener('webglcontextrestored', () => {
              console.log('WebGL context restored in MoneyStack3D');
              setRestoreKey((k) => k + 1);
            });
          }}
        >
          <MoneyScene stacks={stacks} />
        </Canvas>
      ) : (
        <div className="h-full flex items-center justify-center text-zinc-600 text-sm">
          Select an amount
        </div>
      )}
    </div>
  );
}
