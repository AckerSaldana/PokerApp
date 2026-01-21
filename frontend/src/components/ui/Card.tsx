import { forwardRef, type HTMLAttributes } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outline' | 'glass' | 'premium';
  interactive?: boolean;
}

const variantStyles = {
  default: `
    bg-zinc-900/70 backdrop-blur-md
    border border-white/5
    shadow-xl shadow-black/20
  `,
  elevated: `
    bg-gradient-to-br from-zinc-900/90 to-zinc-800/70
    backdrop-blur-md
    border border-white/10
    shadow-2xl shadow-black/40
  `,
  outline: `
    bg-transparent backdrop-blur-sm
    border border-white/10
  `,
  glass: `
    bg-[var(--bg-surface)] backdrop-blur-xl
    border border-[var(--glass-border)]
    shadow-2xl shadow-black/20
  `,
  premium: `
    bg-gradient-to-br from-[var(--color-emerald-950)] via-[var(--color-emerald-900)] to-[var(--color-emerald-950)]
    border border-[var(--color-emerald-500)]/20
    shadow-2xl shadow-[var(--color-emerald-900)]/20
    hover:border-[var(--color-emerald-400)]/30
    transition-all duration-500
  `,
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', interactive = false, children, ...props }, ref) => {
    if (interactive) {
      return (
        <motion.div
          ref={ref}
          className={cn(
            'rounded-2xl p-4 relative overflow-hidden',
            variantStyles[variant],
            'cursor-pointer',
            className
          )}
          whileHover={{
            y: -4,
            scale: 1.01,
            transition: { type: 'spring', stiffness: 400, damping: 17 }
          }}
          whileTap={{ scale: 0.98 }}
          {...(props as HTMLMotionProps<'div'>)}
        >
          {children}
        </motion.div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl p-4 relative overflow-hidden',
          variantStyles[variant],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('mb-4', className)}
      {...props}
    />
  )
);

CardHeader.displayName = 'CardHeader';

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-lg font-semibold text-white', className)}
      {...props}
    />
  )
);

CardTitle.displayName = 'CardTitle';

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('', className)} {...props} />
  )
);

CardContent.displayName = 'CardContent';
