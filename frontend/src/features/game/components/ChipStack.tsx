import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// Chip color palettes
const chipColors = {
  gold: { main: '#fbbf24', accent: '#ffffff', dark: '#92400e', highlight: '#fde68a' },
  red: { main: '#ef4444', accent: '#ffffff', dark: '#991b1b', highlight: '#fca5a5' },
  blue: { main: '#3b82f6', accent: '#ffffff', dark: '#1e40af', highlight: '#93c5fd' },
  green: { main: '#22c55e', accent: '#ffffff', dark: '#166534', highlight: '#86efac' },
  black: { main: '#374151', accent: '#fbbf24', dark: '#111827', highlight: '#6b7280' },
};

type ChipColor = keyof typeof chipColors;

interface ChipStackProps {
  amount: number;
  className?: string;
}

// Stack configuration based on amount
function getStackConfig(amount: number): { stacks: { chips: ChipColor[]; x: number; delay: number }[] } {
  if (amount <= 0) return { stacks: [] };

  // Define stack patterns for different amounts
  if (amount < 50) {
    // 1 small stack
    return {
      stacks: [
        { chips: ['gold', 'red'], x: 0, delay: 0 },
      ],
    };
  }

  if (amount < 100) {
    // 2 stacks
    return {
      stacks: [
        { chips: ['gold', 'red', 'gold'], x: -20, delay: 0 },
        { chips: ['blue', 'gold'], x: 20, delay: 0.1 },
      ],
    };
  }

  if (amount < 200) {
    // 3 stacks
    return {
      stacks: [
        { chips: ['gold', 'red', 'gold'], x: -35, delay: 0 },
        { chips: ['blue', 'green', 'gold', 'red'], x: 0, delay: 0.05 },
        { chips: ['gold', 'blue'], x: 35, delay: 0.1 },
      ],
    };
  }

  if (amount < 300) {
    // 4 stacks
    return {
      stacks: [
        { chips: ['red', 'gold', 'red'], x: -50, delay: 0 },
        { chips: ['gold', 'blue', 'gold', 'green'], x: -17, delay: 0.05 },
        { chips: ['blue', 'gold', 'red', 'gold'], x: 17, delay: 0.1 },
        { chips: ['green', 'gold'], x: 50, delay: 0.15 },
      ],
    };
  }

  // 300+ - 5 stacks (max)
  return {
    stacks: [
      { chips: ['red', 'gold', 'red'], x: -60, delay: 0 },
      { chips: ['gold', 'blue', 'gold', 'green'], x: -30, delay: 0.05 },
      { chips: ['black', 'gold', 'red', 'gold', 'blue'], x: 0, delay: 0.1 },
      { chips: ['blue', 'gold', 'red', 'gold'], x: 30, delay: 0.15 },
      { chips: ['green', 'gold', 'red'], x: 60, delay: 0.2 },
    ],
  };
}

// Single 3D chip with depth
function Chip3D({ color, size = 40 }: { color: ChipColor; size?: number }) {
  const colors = chipColors[color];
  const thickness = 6;

  return (
    <div className="relative" style={{ width: size, height: size + thickness }}>
      {/* Chip edge (3D depth) */}
      <div
        className="absolute"
        style={{
          width: size,
          height: thickness,
          bottom: 0,
          background: `linear-gradient(to bottom, ${colors.dark}, ${colors.dark})`,
          borderRadius: '50%/30%',
          transform: 'scaleY(0.5)',
        }}
      />

      {/* Main chip face */}
      <svg
        viewBox="0 0 40 40"
        width={size}
        height={size}
        className="absolute top-0"
        style={{ filter: 'drop-shadow(0 2px 2px rgba(0, 0, 0, 0.3))' }}
      >
        {/* Outer ring */}
        <circle cx="20" cy="20" r="19" fill={colors.main} />
        <circle cx="20" cy="20" r="19" fill="none" stroke={colors.dark} strokeWidth="2" />

        {/* Edge stripes */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <g key={angle} transform={`rotate(${angle} 20 20)`}>
            <rect x="18" y="2" width="4" height="5" rx="1" fill={colors.accent} />
          </g>
        ))}

        {/* Inner decorative ring */}
        <circle cx="20" cy="20" r="12" fill="none" stroke={colors.dark} strokeWidth="1.5" />

        {/* Center decoration */}
        <circle cx="20" cy="20" r="9" fill={colors.accent} />
        <circle cx="20" cy="20" r="6" fill={colors.main} />
        <circle cx="20" cy="20" r="2.5" fill={colors.dark} />

        {/* Highlight for 3D effect */}
        <ellipse cx="15" cy="14" rx="5" ry="3" fill={colors.highlight} opacity="0.3" />
      </svg>
    </div>
  );
}

// Single stack of chips
function SingleStack({
  chips,
  xOffset,
  stackDelay
}: {
  chips: ChipColor[];
  xOffset: number;
  stackDelay: number;
}) {
  return (
    <div
      className="absolute bottom-0 flex flex-col-reverse items-center"
      style={{ left: '50%', transform: `translateX(calc(-50% + ${xOffset}px))` }}
    >
      <AnimatePresence mode="popLayout">
        {chips.map((color, index) => (
          <motion.div
            key={`${color}-${index}`}
            className="relative"
            style={{ marginTop: index > 0 ? -4 : 0 }}
            initial={{
              y: -150,
              opacity: 0,
              scale: 0.8,
            }}
            animate={{
              y: 0,
              opacity: 1,
              scale: 1,
            }}
            exit={{
              y: -100,
              opacity: 0,
              scale: 0.5,
              transition: { duration: 0.2 }
            }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 15,
              mass: 0.8,
              delay: stackDelay + index * 0.08,
            }}
          >
            <Chip3D color={color} size={38} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function ChipStack({ amount, className }: ChipStackProps) {
  const config = useMemo(() => getStackConfig(amount), [amount]);

  return (
    <div className={cn('relative flex items-end justify-center', className)} style={{ height: '100px' }}>
      <AnimatePresence mode="wait">
        {config.stacks.length > 0 ? (
          <motion.div
            key={config.stacks.length}
            className="relative w-full h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {config.stacks.map((stack, stackIndex) => (
              <SingleStack
                key={`stack-${stackIndex}-${stack.chips.length}`}
                chips={stack.chips}
                xOffset={stack.x}
                stackDelay={stack.delay}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-zinc-600 text-sm"
          >
            Select an amount
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
