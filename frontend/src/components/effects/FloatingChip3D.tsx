import { cn } from '@/lib/utils';

// 8-bit poker chip color palettes (matching user's Three.js code)
const chipColors = {
  red: { main: '#ff0000', accent: '#ffffff', dark: '#880000' },
  blue: { main: '#0088ff', accent: '#ffffff', dark: '#004488' },
  green: { main: '#00cc44', accent: '#ffffff', dark: '#006622' },
  black: { main: '#222222', accent: '#ffff00', dark: '#000000' },
  gold: { main: '#fbbf24', accent: '#ffffff', dark: '#92400e' },
};

interface FloatingChip3DProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: keyof typeof chipColors;
}

export function FloatingChip3D({
  className,
  size = 'lg',
  color = 'gold'
}: FloatingChip3DProps) {
  const sizeMap = {
    sm: 64,
    md: 96,
    lg: 128,
    xl: 160
  };

  const pixelSize = sizeMap[size];
  const colors = chipColors[color];
  const center = pixelSize / 2;

  // 8 edge stripes at 45° intervals
  const stripes = Array.from({ length: 8 }, (_, i) => {
    const angle = (i * 45 - 90) * (Math.PI / 180); // Start from top
    const radius = pixelSize * 0.38;
    return {
      x: center + Math.cos(angle) * radius,
      y: center + Math.sin(angle) * radius,
      rotation: i * 45,
    };
  });

  return (
    <div
      className={cn("relative animate-[spin_30s_linear_infinite]", className)}
      style={{ width: pixelSize, height: pixelSize }}
    >
      <svg
        viewBox={`0 0 ${pixelSize} ${pixelSize}`}
        width={pixelSize}
        height={pixelSize}
        style={{ filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))' }}
      >
        {/* Main chip body */}
        <circle
          cx={center}
          cy={center}
          r={pixelSize * 0.44}
          fill={colors.main}
        />

        {/* Outer dark edge */}
        <circle
          cx={center}
          cy={center}
          r={pixelSize * 0.44}
          fill="none"
          stroke={colors.dark}
          strokeWidth={pixelSize * 0.05}
        />

        {/* 8 Edge stripes (white rectangles) */}
        {stripes.map((stripe, i) => (
          <g key={i} transform={`rotate(${stripe.rotation} ${center} ${center})`}>
            <rect
              x={center - pixelSize * 0.035}
              y={pixelSize * 0.08}
              width={pixelSize * 0.07}
              height={pixelSize * 0.14}
              fill={colors.accent}
              rx={pixelSize * 0.01}
            />
          </g>
        ))}

        {/* Inner dark ring */}
        <circle
          cx={center}
          cy={center}
          r={pixelSize * 0.26}
          fill="none"
          stroke={colors.dark}
          strokeWidth={pixelSize * 0.025}
        />

        {/* Center accent circle */}
        <circle
          cx={center}
          cy={center}
          r={pixelSize * 0.18}
          fill={colors.accent}
        />

        {/* Center main color circle */}
        <circle
          cx={center}
          cy={center}
          r={pixelSize * 0.12}
          fill={colors.main}
        />

        {/* Center dark dot */}
        <circle
          cx={center}
          cy={center}
          r={pixelSize * 0.05}
          fill={colors.dark}
        />
      </svg>
    </div>
  );
}
