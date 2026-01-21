import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-zinc-800 rounded-lg',
        className
      )}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
      <Skeleton className="h-4 w-24 mb-3" />
      <Skeleton className="h-8 w-32 mb-2" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

export function SkeletonListItem() {
  return (
    <div className="flex items-center gap-4 p-4 bg-zinc-900 rounded-xl">
      <Skeleton className="w-10 h-10 rounded-full" />
      <div className="flex-1">
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-3 w-16" />
      </div>
      <Skeleton className="h-6 w-16" />
    </div>
  );
}
