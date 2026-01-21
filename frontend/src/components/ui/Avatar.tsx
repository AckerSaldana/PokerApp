import { cn, getInitials } from '@/lib/utils';

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeStyles = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
};

const colorPalette = [
  'bg-green-600',
  'bg-blue-600',
  'bg-purple-600',
  'bg-pink-600',
  'bg-orange-600',
  'bg-teal-600',
  'bg-indigo-600',
  'bg-rose-600',
];

function getColorFromName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colorPalette[Math.abs(hash) % colorPalette.length];
}

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const initials = getInitials(name);
  const bgColor = getColorFromName(name);

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn(
          'rounded-full object-cover',
          sizeStyles[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-semibold text-white',
        sizeStyles[size],
        bgColor,
        className
      )}
    >
      {initials}
    </div>
  );
}
