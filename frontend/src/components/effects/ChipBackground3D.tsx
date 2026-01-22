import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Chip color palette (matching ChipStack3D)
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
  rotationSpeed: [number, number, number];
  spreadX: number;
  gravity: number;
  respawnThreshold: number;
  initialVelocity: number;
  segments: number;
}

function FallingChip({
  colorData,
  startPosition,
  rotationSpeed,
  spreadX,
  gravity,
  respawnThreshold,
  initialVelocity,
  segments,
}: FallingChipProps) {
  const groupRef = useRef<THREE.Group>(null);
  const velocityRef = useRef({
    y: initialVelocity,
    rotX: rotationSpeed[0],
    rotY: rotationSpeed[1],
    rotZ: rotationSpeed[2],
  });
  const positionRef = useRef({ x: startPosition[0], y: startPosition[1], z: startPosition[2] });

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // Normalize delta to 60fps for consistent speed
    const normalizedDelta = delta * 60;

    // Apply gravity
    velocityRef.current.y -= gravity * normalizedDelta;
    positionRef.current.y += velocityRef.current.y * normalizedDelta;

    // Apply rotation
    groupRef.current.rotation.x += velocityRef.current.rotX * normalizedDelta;
    groupRef.current.rotation.y += velocityRef.current.rotY * normalizedDelta;
    groupRef.current.rotation.z += velocityRef.current.rotZ * normalizedDelta * 0.7;

    // Respawn at top when fallen below view
    if (positionRef.current.y < respawnThreshold) {
      positionRef.current.y = 8 + Math.random() * 4;
      positionRef.current.x = (Math.random() - 0.5) * spreadX;
      positionRef.current.z = (Math.random() - 0.5) * 2;
      velocityRef.current.y = initialVelocity * (0.8 + Math.random() * 0.4);
      velocityRef.current.rotX = (Math.random() - 0.5) * 0.012;
      velocityRef.current.rotY = (Math.random() - 0.5) * 0.015;
      velocityRef.current.rotZ = (Math.random() - 0.5) * 0.01;
    }

    groupRef.current.position.set(
      positionRef.current.x,
      positionRef.current.y,
      positionRef.current.z
    );
  });

  return (
    <group ref={groupRef} position={startPosition}>
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

function FallingChipsScene({ chipCount, spreadX, isMobile }: { chipCount: number; spreadX: number; isMobile: boolean }) {
  const segments = isMobile ? 8 : 12;

  const chips = useMemo(() => {
    return Array.from({ length: chipCount }).map((_, i) => ({
      id: i,
      colorData: chipColors[Math.floor(Math.random() * chipColors.length)],
      startPosition: [
        (Math.random() - 0.5) * spreadX,
        -6 + Math.random() * 16, // Wide spread: -6 to +10
        (Math.random() - 0.5) * 2,
      ] as [number, number, number],
      rotationSpeed: [
        (Math.random() - 0.5) * 0.01,
        (Math.random() - 0.5) * 0.015,
        (Math.random() - 0.5) * 0.008,
      ] as [number, number, number],
      // Pre-computed random values for each chip to prevent sync
      gravity: 0.00004 + Math.random() * 0.00008,
      respawnThreshold: -5 - Math.random() * 4,
      initialVelocity: -0.008 - Math.random() * 0.016,
    }));
  }, [chipCount, spreadX]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 8, 3]} intensity={0.8} />
      <directionalLight position={[-3, 3, -3]} intensity={0.4} />

      {chips.map((chip) => (
        <FallingChip
          key={chip.id}
          colorData={chip.colorData}
          startPosition={chip.startPosition}
          rotationSpeed={chip.rotationSpeed}
          spreadX={spreadX}
          gravity={chip.gravity}
          respawnThreshold={chip.respawnThreshold}
          initialVelocity={chip.initialVelocity}
          segments={segments}
        />
      ))}
    </>
  );
}

interface ChipBackground3DProps {
  className?: string;
  opacity?: number;
  chipCount?: number;
}

export function ChipBackground3D({ className, opacity = 0.2, chipCount = 10 }: ChipBackground3DProps) {
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

  const spreadX = isMobile ? 8 : 14;
  const actualChipCount = isMobile ? Math.min(chipCount, 8) : chipCount;

  return (
    <div
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        opacity,
        overflow: 'hidden',
        borderRadius: 'inherit',
      }}
    >
      <Canvas
        key={canvasKey}
        camera={{ position: [0, 0, 8], fov: 65 }}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: 'low-power',
          failIfMajorPerformanceCaveat: false,
          preserveDrawingBuffer: false,
        }}
        dpr={isMobile ? [0.5, 1] : [0.75, 1.5]}
        onCreated={({ gl }) => {
          const canvas = gl.domElement;
          canvas.addEventListener('webglcontextlost', (e) => {
            e.preventDefault();
            console.warn('WebGL context lost in ChipBackground3D - will restore');
          });
          canvas.addEventListener('webglcontextrestored', () => {
            console.log('WebGL context restored in ChipBackground3D');
            setCanvasKey((k) => k + 1);
          });
        }}
      >
        <FallingChipsScene chipCount={actualChipCount} spreadX={spreadX} isMobile={isMobile} />
      </Canvas>
    </div>
  );
}
