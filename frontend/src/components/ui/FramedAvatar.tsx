import { Avatar } from './Avatar';
import { cn } from '@/lib/utils';

interface FramedAvatarProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  frameClass?: string; // Tailwind classes for frame (e.g., "ring-2 ring-zinc-600")
  className?: string;
}

export function FramedAvatar({
  src,
  name,
  size = 'md',
  frameClass,
  className,
}: FramedAvatarProps) {
  // If no frame, just render the Avatar normally
  if (!frameClass) {
    return <Avatar src={src} name={name} size={size} className={className} />;
  }

  // Wrap Avatar with frame container
  return (
    <div className={cn('relative inline-block', className)}>
      <Avatar
        src={src}
        name={name}
        size={size}
        className={cn(frameClass, 'ring-offset-2 ring-offset-zinc-900')}
      />
    </div>
  );
}
