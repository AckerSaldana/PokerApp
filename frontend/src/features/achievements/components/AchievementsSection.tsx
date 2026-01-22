import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Trophy } from 'lucide-react';
import { achievementsApi } from '@/services/api/achievements';
import { AchievementBadge } from './AchievementBadge';
import { SkeletonListItem } from '@/components/ui/Skeleton';
import { cn, formatRelativeTime } from '@/lib/utils';
import type { Achievement, AchievementCategory } from '@/lib/types';

const categoryLabels: Record<AchievementCategory, string> = {
  GAMES: 'Games',
  WINNINGS: 'Winnings',
  TRANSFERS: 'Transfers',
  SPECIAL: 'Special',
};

interface AchievementsSectionProps {
  userId?: string; // If provided, shows another user's achievements
  className?: string;
}

export function AchievementsSection({ userId, className }: AchievementsSectionProps) {
  // Use different query based on whether viewing own or other user's achievements
  const { data, isLoading, error } = useQuery({
    queryKey: userId ? ['userAchievements', userId] : ['myAchievements'],
    queryFn: userId ? () => achievementsApi.getUserAchievements(userId) : achievementsApi.getMyAchievements,
  });

  if (isLoading) {
    return (
      <div className={cn('space-y-3', className)}>
        {[1, 2, 3].map((i) => (
          <SkeletonListItem key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('space-y-4', className)}>
        <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-widest">
          Achievements
        </h3>
        <div className="text-center py-4">
          <p className="text-red-400 text-sm">Failed to load achievements</p>
          <p className="text-zinc-500 text-xs mt-1">{(error as Error)?.message}</p>
        </div>
      </div>
    );
  }

  const achievements = data?.achievements || [];

  // For own profile, show all achievements grouped by category
  // For other users, just show unlocked ones
  if (!userId) {
    // Group by category
    const grouped = achievements.reduce(
      (acc, achievement) => {
        const category = achievement.category;
        if (!acc[category]) acc[category] = [];
        acc[category].push(achievement);
        return acc;
      },
      {} as Record<AchievementCategory, Achievement[]>
    );

    const unlockedCount = achievements.filter((a) => a.isUnlocked).length;
    const categoryOrder: AchievementCategory[] = ['GAMES', 'WINNINGS', 'TRANSFERS', 'SPECIAL'];

    return (
      <div className={cn('space-y-6', className)}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-widest">
            Achievements
          </h3>
          <span className="text-xs text-zinc-500">
            {unlockedCount}/{achievements.length} unlocked
          </span>
        </div>

        {/* Empty state */}
        {achievements.length === 0 && (
          <div className="text-center py-8">
            <Trophy className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
            <p className="text-zinc-500 text-sm">No achievements available</p>
          </div>
        )}

        {/* Categories - sorted in consistent order */}
        {categoryOrder.map((category) => {
          const categoryAchievements = grouped[category];
          if (!categoryAchievements || categoryAchievements.length === 0) return null;
          return (
            <div key={category}>
              <p className="text-xs text-zinc-500 mb-3">{categoryLabels[category]}</p>
              <div className="grid grid-cols-4 gap-4">
                {categoryAchievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    className="flex flex-col items-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <AchievementBadge achievement={achievement} size="md" showProgress />
                    <p
                      className={cn(
                        'text-xs text-center mt-1 leading-tight',
                        achievement.isUnlocked ? 'text-white' : 'text-zinc-500'
                      )}
                    >
                      {achievement.name}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // For other user's profile, just show unlocked achievements
  if (achievements.length === 0) {
    return (
      <div className={cn('text-center py-8', className)}>
        <Trophy className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
        <p className="text-zinc-500 text-sm">No achievements yet</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-widest">
        Achievements ({achievements.length})
      </h3>
      <div className="grid grid-cols-4 gap-4">
        {achievements.map((achievement, index) => (
          <motion.div
            key={achievement.id}
            className="flex flex-col items-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <AchievementBadge achievement={achievement} size="md" />
            <p className="text-xs text-white text-center mt-1 leading-tight">{achievement.name}</p>
            <p className="text-[10px] text-zinc-500">{formatRelativeTime(achievement.unlockedAt)}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
