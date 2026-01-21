import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gold' | 'glass';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: `
    bg-emerald-600 text-white font-semibold
    shadow-lg shadow-emerald-900/20
    border border-emerald-500/30
    hover:bg-emerald-500
  `,
  secondary: `
    bg-zinc-800/80 backdrop-blur-sm
    border border-zinc-700/50
    text-white hover:bg-zinc-700/80
    shadow-lg shadow-black/20
  `,
  outline: `
    border-2 border-emerald-500/30 text-emerald-100
    hover:bg-emerald-500/10 hover:border-emerald-500/50
    backdrop-blur-sm
  `,
  ghost: `
    text-emerald-100/70 hover:text-white
    hover:bg-white/5
    backdrop-blur-sm
  `,
  danger: `
    bg-red-900/80 text-red-100
    border border-red-500/30
    hover:bg-red-800/80
  `,
  gold: `
      bg-gradient-to-b from-[var(--color-gold-400)] to-[var(--color-gold-600)]
      text-amber-950 font-bold tracking-wide
      shadow-[0_4px_12px_rgba(245,158,11,0.3)]
      border-t border-[var(--color-gold-300)]
      border-b border-[var(--color-gold-700)]
      hover:brightness-110
  `,
  glass: `
      bg-[var(--bg-surface-elevated)] backdrop-blur-md
      border border-[var(--glass-border)]
      text-white
      shadow-sm
      hover:bg-[rgba(255,255,255,0.1)]
  `
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-sm rounded-lg',
  md: 'h-11 px-4 text-base rounded-xl',
  lg: 'h-14 px-6 text-lg rounded-2xl',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const MotionButton = motion.button as React.ComponentType<HTMLMotionProps<'button'> & ButtonHTMLAttributes<HTMLButtonElement>>;

    return (
      <MotionButton
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-semibold',
          'transition-colors duration-200',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'select-none touch-manipulation',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        disabled={disabled || isLoading}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98, y: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            {leftIcon}
            {children}
            {rightIcon}
          </>
        )}
      </MotionButton>
    );
  }
);

Button.displayName = 'Button';
