import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Trophy } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { achievementsApi } from '@/services/api/achievements';
import { AchievementBadge } from '../components/AchievementBadge';
import { SkeletonListItem } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';
import { pageTransition } from '@/components/animations/variants';
import type { Achievement, AchievementCategory } from '@/lib/types';

const categoryLabels: Record<AchievementCategory, string> = {
  GAMES: 'Games',
  WINNINGS: 'Winnings',
  TRANSFERS: 'Transfers',
  SPECIAL: 'Special',
};

export function AchievementsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['myAchievements'],
    queryFn: achievementsApi.getMyAchievements,
  });

  const achievements: Achievement[] = data?.achievements || [];
  const unlockedCount = achievements.filter((a: Achievement) => a.isUnlocked).length;

  // Group by category
  const grouped = achievements.reduce<Record<AchievementCategory, Achievement[]>>(
    (acc, achievement) => {
      const category = achievement.category;
      if (!acc[category]) acc[category] = [];
      acc[category].push(achievement);
      return acc;
    },
    {} as Record<AchievementCategory, Achievement[]>
  );

  const categoryOrder: AchievementCategory[] = ['GAMES', 'WINNINGS', 'TRANSFERS', 'SPECIAL'];

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <PageHeader title="Achievements" />

      <div className="px-6 pb-32">
        {/* Stats Header */}
        <motion.div
          className="rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/20 p-6 mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Trophy className="w-7 h-7 text-amber-400" />
            </div>
            <div>
              <p className="text-3xl font-display font-bold text-white">
                {unlockedCount}/{achievements.length}
              </p>
              <p className="text-amber-400/80 text-sm">Achievements Unlocked</p>
            </div>
          </div>
        </motion.div>

        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonListItem key={i} />
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <p className="text-red-400 text-sm">Failed to load achievements</p>
            <p className="text-zinc-500 text-xs mt-1">{(error as Error)?.message}</p>
          </div>
        )}

        {!isLoading && !error && achievements.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-400 text-lg font-medium">No achievements available</p>
            <p className="text-zinc-500 text-sm mt-1">Check back later!</p>
          </div>
        )}

        {/* Categories */}
        {!isLoading && !error && (
          <div className="space-y-8">
            {categoryOrder.map((category) => {
              const categoryAchievements = grouped[category];
              if (!categoryAchievements || categoryAchievements.length === 0) return null;

              const categoryUnlocked = categoryAchievements.filter((a: Achievement) => a.isUnlocked).length;

              return (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-widest">
                      {categoryLabels[category]}
                    </h3>
                    <span className="text-xs text-zinc-500">
                      {categoryUnlocked}/{categoryAchievements.length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {categoryAchievements.map((achievement: Achievement, index: number) => (
                      <motion.div
                        key={achievement.id}
                        className={cn(
                          'rounded-xl border p-4 flex items-center gap-4',
                          achievement.isUnlocked
                            ? 'bg-white/5 border-white/10'
                            : 'bg-zinc-900/50 border-zinc-800/50'
                        )}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <AchievementBadge achievement={achievement} size="lg" showProgress />

                        <div className="flex-1 min-w-0">
                          <p
                            className={cn(
                              'font-semibold truncate',
                              achievement.isUnlocked ? 'text-white' : 'text-zinc-500'
                            )}
                          >
                            {achievement.name}
                          </p>
                          <p
                            className={cn(
                              'text-sm truncate',
                              achievement.isUnlocked ? 'text-zinc-400' : 'text-zinc-600'
                            )}
                          >
                            {achievement.description}
                          </p>

                          {/* Progress bar for locked achievements */}
                          {!achievement.isUnlocked && achievement.progress !== undefined && (
                            <div className="mt-2">
                              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-amber-500/50 rounded-full transition-all"
                                  style={{ width: `${Math.min(achievement.progress, 100)}%` }}
                                />
                              </div>
                              <p className="text-[10px] text-zinc-600 mt-1">
                                {achievement.progress}% complete
                              </p>
                            </div>
                          )}
                        </div>

                        {achievement.isUnlocked && (
                          <div className="text-right">
                            <span className="text-xs text-emerald-400 font-medium">Unlocked</span>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
