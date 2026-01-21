import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  rightElement?: ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, rightElement, className }: PageHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between px-6 py-6', className)}>
      <div>
        <h1 className="text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-gold-100)] via-[var(--color-gold-300)] to-[var(--color-gold-100)] drop-shadow-sm">{title}</h1>
        {subtitle && (
          <p className="text-sm text-zinc-400 mt-0.5">{subtitle}</p>
        )}
      </div>
      {rightElement && <div>{rightElement}</div>}
    </div>
  );
}
