import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// 16-bit color palette
const palette = {
  white: '#f8f8f8',
  cream: '#f0e0c0',
  black: '#181818',
  red: '#e83030',
  darkRed: '#a01010',
  gold: '#f8d830',
  darkGold: '#b89820',
  cardBack1: '#602080',
  cardBack2: '#401060',
};

type Suit = 'hearts' | 'diamonds' | 'spades' | 'clubs';
type Value = 'A' | 'K' | 'Q' | 'J' | '10' | '9' | '8' | '7' | '6' | '5' | '4' | '3' | '2';

const suits: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];
const values: Value[] = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'];

// Pixel font for card values
const pixelChars: Record<string, string[]> = {
  'A': ['  #  ', ' # # ', '#   #', '#####', '#   #', '#   #', '#   #'],
  'K': ['#  # ', '# #  ', '##   ', '##   ', '# #  ', '#  # ', '#   #'],
  'Q': [' ### ', '#   #', '#   #', '#   #', '# # #', '#  # ', ' ## #'],
  'J': ['  ###', '   # ', '   # ', '   # ', '#  # ', '#  # ', ' ##  '],
  '10': ['# ###', '##  #', '# # #', '# # #', '# # #', '# # #', '# ###'],
  '9': [' ### ', '#   #', '#   #', ' ####', '    #', '#   #', ' ### '],
  '8': [' ### ', '#   #', '#   #', ' ### ', '#   #', '#   #', ' ### '],
  '7': ['#####', '    #', '   # ', '  #  ', '  #  ', '  #  ', '  #  '],
  '6': [' ### ', '#    ', '#    ', '#### ', '#   #', '#   #', ' ### '],
  '5': ['#####', '#    ', '#### ', '    #', '    #', '#   #', ' ### '],
  '4': ['#   #', '#   #', '#   #', '#####', '    #', '    #', '    #'],
  '3': ['#### ', '    #', '    #', ' ### ', '    #', '    #', '#### '],
  '2': [' ### ', '#   #', '    #', '  ## ', ' #   ', '#    ', '#####'],
};

// Create pixel art card face texture
function createPixelCardTexture(suit: Suit, value: Value): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  const scale = 8;
  canvas.width = 64 * scale;
  canvas.height = 96 * scale;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;

  const isRed = suit === 'hearts' || suit === 'diamonds';
  const mainColor = isRed ? palette.red : palette.black;

  function drawPixel(x: number, y: number, w: number, h: number, color: string) {
    ctx.fillStyle = color;
    ctx.fillRect(x * scale, y * scale, w * scale, h * scale);
  }

  // Card background
  drawPixel(0, 0, 64, 96, palette.cream);

  // Border
  drawPixel(0, 0, 64, 3, palette.black);
  drawPixel(0, 93, 64, 3, palette.black);
  drawPixel(0, 0, 3, 96, palette.black);
  drawPixel(61, 0, 3, 96, palette.black);

  // Inner highlight
  drawPixel(3, 3, 58, 2, palette.white);
  drawPixel(3, 3, 2, 90, palette.white);

  // Inner shadow
  drawPixel(3, 91, 58, 2, '#c0b090');
  drawPixel(59, 3, 2, 90, '#c0b090');

  // Draw suit symbol
  function drawHeart(cx: number, cy: number, size: number) {
    const s = size;
    drawPixel(cx - s, cy - s / 2, s, s, mainColor);
    drawPixel(cx, cy - s / 2, s, s, mainColor);
    drawPixel(cx - s / 2, cy, s, s, mainColor);
    drawPixel(cx - s / 2, cy + s / 2, s / 2, s / 2, mainColor);
  }

  function drawDiamond(cx: number, cy: number, size: number) {
    const s = size;
    drawPixel(cx - s / 2, cy - s, s, s, mainColor);
    drawPixel(cx - s, cy - s / 2, s * 2, s, mainColor);
    drawPixel(cx - s / 2, cy, s, s, mainColor);
  }

  function drawSpade(cx: number, cy: number, size: number) {
    const s = size;
    drawPixel(cx - s / 2, cy - s, s, s, mainColor);
    drawPixel(cx - s, cy - s / 2, s * 2, s, mainColor);
    drawPixel(cx - s / 2, cy, s, s / 2, mainColor);
    drawPixel(cx - s / 4, cy + s / 2, s / 2, s / 2, mainColor);
  }

  function drawClub(cx: number, cy: number, size: number) {
    const s = size;
    drawPixel(cx - s / 2, cy - s, s, s, mainColor);
    drawPixel(cx - s, cy - s / 2, s, s, mainColor);
    drawPixel(cx, cy - s / 2, s, s, mainColor);
    drawPixel(cx - s / 2, cy, s, s / 2, mainColor);
    drawPixel(cx - s / 4, cy + s / 2, s / 2, s / 2, mainColor);
  }

  function drawSuit(cx: number, cy: number, size: number) {
    switch (suit) {
      case 'hearts': drawHeart(cx, cy, size); break;
      case 'diamonds': drawDiamond(cx, cy, size); break;
      case 'spades': drawSpade(cx, cy, size); break;
      case 'clubs': drawClub(cx, cy, size); break;
    }
  }

  // Draw value
  function drawValue(x: number, y: number, val: Value, color: string) {
    const charData = pixelChars[val];
    if (charData) {
      charData.forEach((row, rowIndex) => {
        for (let col = 0; col < row.length; col++) {
          if (row[col] === '#') {
            drawPixel(x + col, y + rowIndex, 1, 1, color);
          }
        }
      });
    }
  }

  // Top-left corner
  drawValue(6, 8, value, mainColor);
  drawSuit(9, 20, 3);

  // Bottom-right corner
  drawValue(52, 81, value, mainColor);
  drawSuit(55, 69, 3);

  // Center suit
  drawSuit(32, 48, 8);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  return texture;
}

// Create pixel art card back texture
function createPixelCardBackTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  const scale = 8;
  canvas.width = 64 * scale;
  canvas.height = 96 * scale;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;

  function drawPixel(x: number, y: number, w: number, h: number, color: string) {
    ctx.fillStyle = color;
    ctx.fillRect(x * scale, y * scale, w * scale, h * scale);
  }

  // Dithered background
  for (let y = 0; y < 96; y++) {
    for (let x = 0; x < 64; x++) {
      const dither = (x + y) % 2 === 0;
      drawPixel(x, y, 1, 1, dither ? palette.cardBack1 : palette.cardBack2);
    }
  }

  // Border
  drawPixel(0, 0, 64, 3, palette.gold);
  drawPixel(0, 93, 64, 3, palette.gold);
  drawPixel(0, 0, 3, 96, palette.gold);
  drawPixel(61, 0, 3, 96, palette.gold);

  // Inner border
  drawPixel(5, 5, 54, 2, palette.darkGold);
  drawPixel(5, 89, 54, 2, palette.darkGold);
  drawPixel(5, 5, 2, 86, palette.darkGold);
  drawPixel(57, 5, 2, 86, palette.darkGold);

  // Diamond pattern
  for (let y = 10; y < 86; y += 8) {
    for (let x = 10; x < 54; x += 8) {
      drawPixel(x + 3, y, 2, 2, palette.gold);
      drawPixel(x + 2, y + 1, 1, 2, palette.gold);
      drawPixel(x + 5, y + 1, 1, 2, palette.gold);
      drawPixel(x + 3, y + 3, 2, 1, palette.gold);
    }
  }

  // Center emblem
  drawPixel(26, 40, 12, 16, palette.gold);
  drawPixel(28, 42, 8, 12, palette.cardBack1);
  drawPixel(31, 44, 2, 2, palette.gold);
  drawPixel(29, 46, 6, 4, palette.gold);
  drawPixel(31, 50, 2, 2, palette.gold);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  return texture;
}

interface FallingCardProps {
  frontTexture: THREE.CanvasTexture;
  backTexture: THREE.CanvasTexture;
  startPosition: [number, number, number];
  rotationSpeed: [number, number, number];
  spreadX: number;
  gravity: number;
  respawnThreshold: number;
  initialVelocity: number;
}

function FallingCard({
  frontTexture,
  backTexture,
  startPosition,
  rotationSpeed,
  spreadX,
  gravity,
  respawnThreshold,
  initialVelocity,
}: FallingCardProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const velocityRef = useRef({
    y: initialVelocity,
    rotX: rotationSpeed[0],
    rotY: rotationSpeed[1],
    rotZ: rotationSpeed[2],
  });
  const positionRef = useRef({ x: startPosition[0], y: startPosition[1], z: startPosition[2] });

  // Create materials for box faces
  const materials = useMemo(() => {
    const edgeColor = 0xf0e0c0; // Cream edge
    return [
      new THREE.MeshLambertMaterial({ color: edgeColor }), // right
      new THREE.MeshLambertMaterial({ color: 0xd0c0a0 }), // left (shadow)
      new THREE.MeshLambertMaterial({ color: 0xf8f0e0 }), // top (highlight)
      new THREE.MeshLambertMaterial({ color: 0xc0b090 }), // bottom (shadow)
      new THREE.MeshLambertMaterial({ map: frontTexture }), // front
      new THREE.MeshLambertMaterial({ map: backTexture }), // back
    ];
  }, [frontTexture, backTexture]);

  // Cleanup materials on unmount
  useEffect(() => {
    return () => {
      materials.forEach((mat) => mat.dispose());
    };
  }, [materials]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    // Normalize delta to 60fps (delta ~0.016 at 60fps)
    // This makes animation speed consistent across different refresh rates
    const normalizedDelta = delta * 60;

    // Apply gravity (each card has unique gravity for desync)
    velocityRef.current.y -= gravity * normalizedDelta;
    positionRef.current.y += velocityRef.current.y * normalizedDelta;

    // Apply gentle rotation (frame-rate independent)
    meshRef.current.rotation.x += velocityRef.current.rotX * normalizedDelta;
    meshRef.current.rotation.y += velocityRef.current.rotY * normalizedDelta;
    meshRef.current.rotation.z += velocityRef.current.rotZ * normalizedDelta * 0.7;

    // Respawn at top when fallen below view (each card has unique threshold)
    if (positionRef.current.y < respawnThreshold) {
      positionRef.current.y = 12 + Math.random() * 8; // Wide spread respawn
      positionRef.current.x = (Math.random() - 0.5) * spreadX;
      positionRef.current.z = (Math.random() - 0.5) * 2;
      velocityRef.current.y = initialVelocity * (0.8 + Math.random() * 0.4); // Vary around initial
      // Randomize rotation speeds for variety
      velocityRef.current.rotX = (Math.random() - 0.5) * 0.012;
      velocityRef.current.rotY = (Math.random() - 0.5) * 0.015;
      velocityRef.current.rotZ = (Math.random() - 0.5) * 0.01;
    }

    meshRef.current.position.set(
      positionRef.current.x,
      positionRef.current.y,
      positionRef.current.z
    );
  });

  return (
    <mesh ref={meshRef} visible={true} material={materials}>
      <boxGeometry args={[1.4, 2.1, 0.06]} />
    </mesh>
  );
}

// Responsive camera - closer on mobile for better visibility
function ResponsiveCamera() {
  const { camera, size } = useThree();

  useEffect(() => {
    const aspect = size.width / size.height;
    if (aspect < 1) {
      // Mobile: closer camera, cards fill more of the view
      camera.position.z = 6;
    } else {
      camera.position.z = 10;
    }
    camera.updateProjectionMatrix();
  }, [camera, size]);

  return null;
}

interface FallingCardsSceneProps {
  cardCount: number;
  spreadX: number;
}

function FallingCardsScene({ cardCount, spreadX }: FallingCardsSceneProps) {
  // Generate card textures and data
  const { cards, backTexture } = useMemo(() => {
    const back = createPixelCardBackTexture();

    const cardsList = Array.from({ length: cardCount }).map((_, i) => {
      const suit = suits[Math.floor(Math.random() * suits.length)];
      const value = values[Math.floor(Math.random() * values.length)];
      const frontTexture = createPixelCardTexture(suit, value);

      return {
        id: i,
        frontTexture,
        startPosition: [
          (Math.random() - 0.5) * spreadX,
          -10 + Math.random() * 25, // Wide spread: -10 to +15
          (Math.random() - 0.5) * 2,
        ] as [number, number, number],
        rotationSpeed: [
          (Math.random() - 0.5) * 0.01,
          (Math.random() - 0.5) * 0.015,
          (Math.random() - 0.5) * 0.008,
        ] as [number, number, number],
        // Pre-computed random values for each card
        gravity: 0.00004 + Math.random() * 0.00008, // 0.00004 to 0.00012 - wide range
        respawnThreshold: -6 - Math.random() * 8, // -6 to -14 - wide range
        initialVelocity: -0.008 - Math.random() * 0.016, // -0.008 to -0.024 - wide range
      };
    });

    return { cards: cardsList, backTexture: back };
  }, [cardCount, spreadX]);

  // Cleanup textures on unmount to prevent WebGL context loss
  useEffect(() => {
    return () => {
      backTexture.dispose();
      cards.forEach((card) => {
        card.frontTexture.dispose();
      });
    };
  }, [cards, backTexture]);

  return (
    <>
      <ResponsiveCamera />
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 10, 5]} intensity={0.8} />
      <directionalLight position={[-5, 5, -5]} intensity={0.3} />

      {cards.map((card) => (
        <FallingCard
          key={card.id}
          frontTexture={card.frontTexture}
          backTexture={backTexture}
          startPosition={card.startPosition}
          rotationSpeed={card.rotationSpeed}
          spreadX={spreadX}
          gravity={card.gravity}
          respawnThreshold={card.respawnThreshold}
          initialVelocity={card.initialVelocity}
        />
      ))}
    </>
  );
}

interface FallingCards3DProps {
  className?: string;
  cardCount?: number;
}

export function FallingCards3D({ className, cardCount = 12 }: FallingCards3DProps) {
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

  // Much narrower spread on mobile to keep cards in view
  const spreadX = isMobile ? 5 : 14;

  return (
    <div className={className} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <Canvas
        key={canvasKey} // Force remount on context restore
        camera={{ position: [0, 0, 12], fov: 50 }}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: 'low-power',
          failIfMajorPerformanceCaveat: false,
          preserveDrawingBuffer: false,
        }}
        dpr={[0.5, 1]}
        onCreated={({ gl }) => {
          gl.capabilities.maxTextureSize = Math.min(gl.capabilities.maxTextureSize, 2048);

          const canvas = gl.domElement;
          canvas.addEventListener('webglcontextlost', (e) => {
            e.preventDefault();
            console.warn('WebGL context lost in FallingCards3D - will restore');
          });
          canvas.addEventListener('webglcontextrestored', () => {
            console.log('WebGL context restored in FallingCards3D');
            setCanvasKey((k) => k + 1); // Remount canvas to reinitialize
          });
        }}
      >
        <FallingCardsScene cardCount={isMobile ? 8 : cardCount} spreadX={spreadX} />
      </Canvas>
    </div>
  );
}
