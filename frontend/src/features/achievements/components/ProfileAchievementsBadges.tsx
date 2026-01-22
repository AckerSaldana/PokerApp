import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Trophy, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { achievementsApi } from '@/services/api/achievements';
import { AchievementBadge } from './AchievementBadge';
import { SkeletonListItem } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';

interface ProfileAchievementsBadgesProps {
  className?: string;
}

export function ProfileAchievementsBadges({ className }: ProfileAchievementsBadgesProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['myAchievements'],
    queryFn: achievementsApi.getMyAchievements,
  });

  if (isLoading) {
    return (
      <div className={cn('space-y-3', className)}>
        <SkeletonListItem />
      </div>
    );
  }

  if (error) {
    return null;
  }

  const achievements = data?.achievements || [];
  const unlockedAchievements = achievements.filter((a) => a.isUnlocked);
  const totalCount = achievements.length;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header with link */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-widest">
          Achievements
        </h3>
        <Link
          to="/achievements"
          className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          View All
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Unlocked badges display */}
      {unlockedAchievements.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-white/5 border border-white/10 p-6 text-center"
        >
          <Trophy className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
          <p className="text-zinc-400 text-sm">No achievements unlocked yet</p>
          <Link
            to="/achievements"
            className="text-emerald-400 text-xs hover:text-emerald-300 transition-colors mt-2 inline-block"
          >
            View all {totalCount} achievements
          </Link>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-white/5 border border-white/10 p-4"
        >
          {/* Badge grid */}
          <div className="flex flex-wrap gap-3 justify-center">
            {unlockedAchievements.slice(0, 8).map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                title={achievement.name}
              >
                <AchievementBadge achievement={achievement} size="md" />
              </motion.div>
            ))}
          </div>

          {/* Count summary */}
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
            <span className="text-xs text-zinc-500">
              {unlockedAchievements.length} of {totalCount} unlocked
            </span>
            {unlockedAchievements.length > 8 && (
              <span className="text-xs text-zinc-500">
                +{unlockedAchievements.length - 8} more
              </span>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
