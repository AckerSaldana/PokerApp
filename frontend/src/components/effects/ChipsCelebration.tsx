import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
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

const CHIP_RADIUS = 0.5;
const CHIP_HEIGHT = 0.1;

interface FallingChipProps {
  colorData: ChipColorData;
  startPosition: [number, number, number];
  delay: number;
  rotationSpeed: [number, number, number];
}

function FallingChip({ colorData, startPosition, delay, rotationSpeed }: FallingChipProps) {
  const groupRef = useRef<THREE.Group>(null);
  const velocityRef = useRef({ y: 0, rotX: rotationSpeed[0], rotY: rotationSpeed[1], rotZ: rotationSpeed[2] });
  const delayCounterRef = useRef(0);
  const startedRef = useRef(false);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // Wait for delay
    if (delayCounterRef.current < delay) {
      delayCounterRef.current += delta;
      groupRef.current.visible = false;
      return;
    }

    if (!startedRef.current) {
      startedRef.current = true;
      groupRef.current.position.set(...startPosition);
    }

    groupRef.current.visible = true;

    // Apply slower gravity for longer fall
    velocityRef.current.y -= 0.006;
    groupRef.current.position.y += velocityRef.current.y;

    // Apply slower rotation
    groupRef.current.rotation.x += velocityRef.current.rotX * 0.7;
    groupRef.current.rotation.y += velocityRef.current.rotY * 0.7;
    groupRef.current.rotation.z += velocityRef.current.rotZ * 0.7;

    // Fade out when below view
    if (groupRef.current.position.y < -15) {
      groupRef.current.visible = false;
    }
  });

  const segments = 12;

  return (
    <group ref={groupRef} visible={false}>
      {/* Main chip body */}
      <mesh>
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
              Math.cos(angle) * (CHIP_RADIUS - 0.04),
              0,
              Math.sin(angle) * (CHIP_RADIUS - 0.04),
            ]}
            rotation={[0, -angle, 0]}
          >
            <boxGeometry args={[0.08, CHIP_HEIGHT + 0.01, 0.15]} />
            <meshLambertMaterial color={colorData.accent} flatShading />
          </mesh>
        );
      })}

      {/* Top circle decoration */}
      <mesh position={[0, CHIP_HEIGHT / 2 + 0.01, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 0.02, 8]} />
        <meshLambertMaterial color={colorData.accent} flatShading />
      </mesh>

      {/* Inner dark circle */}
      <mesh position={[0, CHIP_HEIGHT / 2 + 0.015, 0]}>
        <cylinderGeometry args={[0.13, 0.13, 0.025, 6]} />
        <meshLambertMaterial color={colorData.dark} flatShading />
      </mesh>

      {/* Bottom decoration */}
      <mesh position={[0, -CHIP_HEIGHT / 2 - 0.01, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 0.02, 8]} />
        <meshLambertMaterial color={colorData.accent} flatShading />
      </mesh>
    </group>
  );
}

// Responsive camera that adjusts based on aspect ratio
function ResponsiveCamera() {
  const { camera, size } = useThree();

  useEffect(() => {
    const aspect = size.width / size.height;
    // On mobile (portrait), move camera closer to see chips better
    if (aspect < 1) {
      camera.position.z = 7;
    } else {
      camera.position.z = 10;
    }
    camera.updateProjectionMatrix();
  }, [camera, size]);

  return null;
}

function FallingChipsScene({ chipCount = 20, spreadX = 12 }: { chipCount?: number; spreadX?: number }) {
  const chips = useMemo(() => {
    return Array.from({ length: chipCount }).map((_, i) => ({
      id: i,
      colorData: chipColors[Math.floor(Math.random() * chipColors.length)],
      startPosition: [
        (Math.random() - 0.5) * spreadX,  // x: spread based on screen width
        10 + Math.random() * 6,            // y: start higher for longer fall
        (Math.random() - 0.5) * 3,         // z: some depth variation
      ] as [number, number, number],
      delay: Math.random() * 1.2,          // longer stagger for more spread out effect
      rotationSpeed: [
        (Math.random() - 0.5) * 0.12,
        (Math.random() - 0.5) * 0.15,
        (Math.random() - 0.5) * 0.12,
      ] as [number, number, number],
    }));
  }, [chipCount, spreadX]);

  return (
    <>
      <ResponsiveCamera />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 5]} intensity={1} />
      <directionalLight position={[-5, 5, -5]} intensity={0.5} />

      {chips.map((chip) => (
        <FallingChip
          key={chip.id}
          colorData={chip.colorData}
          startPosition={chip.startPosition}
          delay={chip.delay}
          rotationSpeed={chip.rotationSpeed}
        />
      ))}
    </>
  );
}

interface ChipsCelebrationProps {
  className?: string;
  chipCount?: number;
}

export function ChipsCelebration({ className, chipCount = 25 }: ChipsCelebrationProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [canvasKey, setCanvasKey] = useState(0);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // On mobile: narrower spread and fewer chips for performance
  const spreadX = isMobile ? 6 : 14;
  const actualChipCount = isMobile ? Math.min(chipCount, 15) : chipCount;

  return (
    <div className={className} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <Canvas
        key={canvasKey}
        camera={{ position: [0, 0, 10], fov: 50 }}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: 'low-power',
          failIfMajorPerformanceCaveat: false,
          preserveDrawingBuffer: false,
        }}
        dpr={[0.5, 1]}
        onCreated={({ gl }) => {
          const canvas = gl.domElement;
          canvas.addEventListener('webglcontextlost', (e) => {
            e.preventDefault();
            console.warn('WebGL context lost in ChipsCelebration - will restore');
          });
          canvas.addEventListener('webglcontextrestored', () => {
            console.log('WebGL context restored in ChipsCelebration');
            setCanvasKey((k) => k + 1);
          });
        }}
      >
        <FallingChipsScene chipCount={actualChipCount} spreadX={spreadX} />
      </Canvas>
    </div>
  );
}
