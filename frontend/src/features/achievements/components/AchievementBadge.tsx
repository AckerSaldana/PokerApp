import { motion } from 'framer-motion';
import {
  Trophy,
  Gamepad2,
  TrendingUp,
  Send,
  Star,
  Crown,
  Gem,
  Flame,
  Coins,
  Landmark,
  Medal,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Achievement, AchievementTier, UnlockedAchievement } from '@/lib/types';

// Icon mapping - use typeof to infer the icon component type
type IconComponent = typeof Trophy;
const iconMap: Record<string, IconComponent> = {
  'gamepad-2': Gamepad2,
  trophy: Trophy,
  'trending-up': TrendingUp,
  send: Send,
  star: Star,
  crown: Crown,
  gem: Gem,
  flame: Flame,
  coins: Coins,
  landmark: Landmark,
  medal: Medal,
};

// Tier colors and styles
const tierStyles: Record<AchievementTier, { bg: string; border: string; icon: string; glow: string }> = {
  BRONZE: {
    bg: 'bg-gradient-to-br from-amber-700 to-amber-900',
    border: 'border-amber-600',
    icon: 'text-amber-200',
    glow: 'shadow-amber-500/30',
  },
  SILVER: {
    bg: 'bg-gradient-to-br from-zinc-300 to-zinc-500',
    border: 'border-zinc-300',
    icon: 'text-zinc-800',
    glow: 'shadow-zinc-300/30',
  },
  GOLD: {
    bg: 'bg-gradient-to-br from-amber-400 to-amber-600',
    border: 'border-amber-400',
    icon: 'text-amber-900',
    glow: 'shadow-amber-400/40',
  },
  PLATINUM: {
    bg: 'bg-gradient-to-br from-cyan-300 to-cyan-500',
    border: 'border-cyan-300',
    icon: 'text-cyan-900',
    glow: 'shadow-cyan-400/40',
  },
};

interface AchievementBadgeProps {
  achievement: Achievement | UnlockedAchievement;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
  className?: string;
}

export function AchievementBadge({
  achievement,
  size = 'md',
  showProgress = false,
  className,
}: AchievementBadgeProps) {
  const IconComponent = iconMap[achievement.icon] || Trophy;
  const tier = achievement.tier;
  const styles = tierStyles[tier];
  const isUnlocked = 'isUnlocked' in achievement ? achievement.isUnlocked : true;

  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
  };

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-7 h-7',
    lg: 'w-10 h-10',
  };

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <motion.div
        className={cn(
          sizeClasses[size],
          'rounded-full flex items-center justify-center border-2 relative overflow-hidden',
          isUnlocked ? [styles.bg, styles.border, 'shadow-lg', styles.glow] : 'bg-zinc-800 border-zinc-700'
        )}
        initial={isUnlocked ? { scale: 0, rotate: -180 } : undefined}
        animate={isUnlocked ? { scale: 1, rotate: 0 } : undefined}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      >
        {/* Shine effect for unlocked badges */}
        {isUnlocked && (
          <div className="absolute inset-0 bg-gradient-to-tr from-white/30 via-transparent to-transparent" />
        )}

        <IconComponent
          className={cn(iconSizes[size], isUnlocked ? styles.icon : 'text-zinc-600')}
        />
      </motion.div>

      {/* Progress bar for locked achievements */}
      {showProgress && !isUnlocked && 'progress' in achievement && (
        <div className="w-full max-w-[60px]">
          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-zinc-500"
              initial={{ width: 0 }}
              animate={{ width: `${achievement.progressPercent}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-[10px] text-zinc-500 text-center mt-1">
            {achievement.progress}/{achievement.threshold}
          </p>
        </div>
      )}
    </div>
  );
}
