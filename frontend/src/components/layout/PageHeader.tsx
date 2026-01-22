import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
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
        <motion.h1
          className="text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-gold-100)] via-[var(--color-gold-300)] to-[var(--color-gold-100)] drop-shadow-sm"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            className="text-sm text-zinc-400 mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            {subtitle}
          </motion.p>
        )}
      </div>
      {rightElement && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.25 }}
        >
          {rightElement}
        </motion.div>
      )}
    </div>
  );
}
