import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Chip color palette
const chipColors = [
  { main: 0xff0000, accent: 0xffffff, dark: 0x880000 },  // Red
  { main: 0x0088ff, accent: 0xffffff, dark: 0x004488 },  // Blue
  { main: 0x00ff00, accent: 0xffffff, dark: 0x008800 },  // Green
  { main: 0x222222, accent: 0xffff00, dark: 0x000000 },  // Black
  { main: 0xfbbf24, accent: 0xffffff, dark: 0x92400e },  // Gold
];

type ChipColorData = typeof chipColors[number];

// Bigger chips!
const CHIP_RADIUS = 0.7;
const CHIP_HEIGHT = 0.14;
const FLOOR_Y = 0;

interface ChipProps {
  colorData: ChipColorData;
  position: [number, number, number];
  delay: number;
}

// Single 3D Chip component
function Chip({ colorData, position, delay }: ChipProps) {
  const groupRef = useRef<THREE.Group>(null);
  const targetY = position[1];
  const startY = 5;
  const velocityRef = useRef(0);
  const currentYRef = useRef(startY);
  const hasLandedRef = useRef(false);
  const delayCounterRef = useRef(0);

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
        velocityRef.current *= -0.35; // Bounce

        if (Math.abs(velocityRef.current) < 0.01) {
          hasLandedRef.current = true;
          velocityRef.current = 0;
        }
      }

      groupRef.current.position.y = currentYRef.current;
    }
  });

  const segments = 16;

  return (
    <group ref={groupRef} position={[position[0], startY, position[2]]}>
      {/* Main chip body */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[CHIP_RADIUS, CHIP_RADIUS, CHIP_HEIGHT, segments]} />
        <meshLambertMaterial color={colorData.main} flatShading />
      </mesh>

      {/* Dark edge ring */}
      <mesh>
        <cylinderGeometry args={[CHIP_RADIUS + 0.01, CHIP_RADIUS + 0.01, CHIP_HEIGHT * 0.6, segments]} />
        <meshLambertMaterial color={colorData.dark} flatShading />
      </mesh>

      {/* 8 Edge stripes */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle) * (CHIP_RADIUS - 0.05),
              0,
              Math.sin(angle) * (CHIP_RADIUS - 0.05),
            ]}
            rotation={[0, -angle, 0]}
          >
            <boxGeometry args={[0.11, CHIP_HEIGHT + 0.01, 0.22]} />
            <meshLambertMaterial color={colorData.accent} flatShading />
          </mesh>
        );
      })}

      {/* Top circle decoration */}
      <mesh position={[0, CHIP_HEIGHT / 2 + 0.01, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 0.02, 8]} />
        <meshLambertMaterial color={colorData.accent} flatShading />
      </mesh>

      {/* Inner dark circle */}
      <mesh position={[0, CHIP_HEIGHT / 2 + 0.015, 0]}>
        <cylinderGeometry args={[0.19, 0.19, 0.025, 6]} />
        <meshLambertMaterial color={colorData.dark} flatShading />
      </mesh>

      {/* Bottom circle decoration */}
      <mesh position={[0, -CHIP_HEIGHT / 2 - 0.01, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 0.02, 8]} />
        <meshLambertMaterial color={colorData.accent} flatShading />
      </mesh>

      {/* Decorative ring on top */}
      <mesh position={[0, CHIP_HEIGHT / 2 + 0.005, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.45, 0.035, 4, 12]} />
        <meshLambertMaterial color={colorData.dark} flatShading />
      </mesh>
    </group>
  );
}

// Scene with all chips
function ChipScene({ stacks }: { stacks: ReturnType<typeof getStackConfig> }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[3, 8, 3]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={256}
        shadow-mapSize-height={256}
      />

      {stacks.map((stack, stackIndex) =>
        stack.chips.map((colorIndex, chipIndex) => (
          <Chip
            key={`${stackIndex}-${chipIndex}`}
            colorData={chipColors[colorIndex]}
            position={[stack.x, FLOOR_Y + chipIndex * CHIP_HEIGHT, stack.z]}
            delay={stack.delay + chipIndex * 0.06}
          />
        ))
      )}
    </>
  );
}

// Get stack configuration based on amount - matches rebuy buttons: $10, $25, $50, $100, $300+
function getStackConfig(amount: number): { chips: number[]; x: number; z: number; delay: number }[] {
  if (amount <= 0) return [];

  // $10 tier (1-24)
  if (amount < 25) {
    return [
      { chips: [4, 0], x: 0, z: 0, delay: 0 },
    ];
  }

  // $25 tier (25-49)
  if (amount < 50) {
    return [
      { chips: [4, 0, 4], x: -0.8, z: 0, delay: 0 },
      { chips: [1, 4], x: 0.8, z: 0, delay: 0.08 },
    ];
  }

  // $50 tier (50-99)
  if (amount < 100) {
    return [
      { chips: [4, 0, 4], x: -1.2, z: 0, delay: 0 },
      { chips: [1, 2, 4, 0], x: 0, z: 0, delay: 0.05 },
      { chips: [4, 1, 4], x: 1.2, z: 0, delay: 0.1 },
    ];
  }

  // $100 tier (100-299)
  if (amount < 300) {
    return [
      { chips: [0, 4, 0, 4], x: -1.8, z: 0, delay: 0 },
      { chips: [4, 1, 4, 2, 4], x: -0.6, z: 0, delay: 0.04 },
      { chips: [1, 4, 0, 4, 1], x: 0.6, z: 0, delay: 0.08 },
      { chips: [2, 4, 2, 4], x: 1.8, z: 0, delay: 0.12 },
    ];
  }

  // $300+ tier - Maximum wow!
  return [
    { chips: [0, 4, 0, 4], x: -2.8, z: 0, delay: 0 },
    { chips: [4, 1, 4, 2, 4], x: -1.4, z: 0, delay: 0.04 },
    { chips: [3, 4, 0, 4, 1, 4], x: 0, z: 0, delay: 0.08 },
    { chips: [1, 4, 0, 4, 2], x: 1.4, z: 0, delay: 0.12 },
    { chips: [2, 4, 0, 4], x: 2.8, z: 0, delay: 0.16 },
  ];
}

// Get tier to use as key for remounting - matches rebuy buttons
function getAmountTier(amount: number): number {
  if (amount <= 0) return 0;
  if (amount < 25) return 1;   // $10
  if (amount < 50) return 2;   // $25
  if (amount < 100) return 3;  // $50
  if (amount < 300) return 4;  // $100
  return 5;                    // $300+
}

interface ChipStack3DProps {
  amount: number;
  className?: string;
}

export function ChipStack3D({ amount, className }: ChipStack3DProps) {
  const tier = getAmountTier(amount);
  const stacks = useMemo(() => getStackConfig(amount), [amount]);

  return (
    <div className={className} style={{ height: '140px', width: '100%' }}>
      {amount > 0 ? (
        <Canvas
          key={tier} // Force remount when tier changes
          camera={{ position: [0, 3.5, 6], fov: 38 }}
          gl={{ antialias: false, pixelRatio: 1 }}
          shadows
        >
          <ChipScene stacks={stacks} />
        </Canvas>
      ) : (
        <div className="h-full flex items-center justify-center text-zinc-600 text-sm">
          Select an amount
        </div>
      )}
    </div>
  );
}
