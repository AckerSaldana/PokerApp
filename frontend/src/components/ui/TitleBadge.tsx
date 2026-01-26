import { cn } from '@/lib/utils';

interface TitleBadgeProps {
  title: string;
  color: string; // Tailwind classes for text color/gradient
  size?: 'sm' | 'md';
  className?: string;
}

const sizeStyles = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-3 py-1',
};

export function TitleBadge({ title, color, size = 'sm', className }: TitleBadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full font-semibold',
        'bg-white/5 border border-white/10',
        sizeStyles[size],
        className
      )}
    >
      <span className={cn(color, 'font-bold')}>{title}</span>
    </div>
  );
}
