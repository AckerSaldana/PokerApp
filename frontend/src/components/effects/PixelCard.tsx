import { useRef, useEffect, memo } from 'react';
import { renderCleanCard, type Suit, type Value } from './pixelCardTexture';

interface PixelCardProps {
  suit: Suit;
  value: Value;
  rotateZ?: number;
  size?: number;
}

export const PixelCard = memo(function PixelCard({ suit, value, rotateZ = 0, size = 44 }: PixelCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const canvas = renderCleanCard(suit, value);
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    canvas.style.borderRadius = '4px';

    container.innerHTML = '';
    container.appendChild(canvas);
  }, [suit, value]);

  const height = size * 1.5;

  return (
    <div
      ref={containerRef}
      style={{
        width: size,
        height,
        transform: `perspective(200px) rotateZ(${rotateZ}deg) rotateY(-5deg)`,
        transformOrigin: 'bottom center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
        borderRadius: 4,
        flexShrink: 0,
      }}
    />
  );
});
