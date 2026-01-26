import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { CalendarDays } from 'lucide-react';
import { Sheet } from '@/components/ui/Sheet';
import { FramedAvatar } from '@/components/ui/FramedAvatar';
import { TitleBadge } from '@/components/ui/TitleBadge';
import { SkeletonListItem } from '@/components/ui/Skeleton';
import { usersApi } from '@/services/api/users';
import { transferApi } from '@/services/api/transfer';
import { formatDate, formatChips } from '@/lib/utils';
import { PlayerStatsSection } from './PlayerStatsSection';
import { HeadToHeadSection } from './HeadToHeadSection';
import { AchievementsSection } from '@/features/achievements/components/AchievementsSection';

interface PlayerProfileSheetProps {
  isOpen: boolean;
  onClose: () => void;
  playerId: string | null;
  playerName?: string;
}

export function PlayerProfileSheet({ isOpen, onClose, playerId, playerName }: PlayerProfileSheetProps) {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['userStats', playerId],
    queryFn: () => usersApi.getStats(playerId!),
    enabled: !!playerId && isOpen,
  });

  const { data: h2hData, isLoading: h2hLoading } = useQuery({
    queryKey: ['transfersBetween', playerId],
    queryFn: () => transferApi.getBetweenUsers(playerId!),
    enabled: !!playerId && isOpen,
  });

  const isLoading = statsLoading || h2hLoading;
  const user = stats?.user;

  return (
    <Sheet isOpen={isOpen} onClose={onClose}>
      <div className="space-y-6 pb-4">
        {/* Header */}
        <motion.div
          className="flex items-center gap-4 pb-4 border-b border-zinc-800"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <FramedAvatar
            src={user?.avatarData || undefined}
            name={user?.username || playerName || 'Player'}
            size="xl"
            frameClass={user?.equippedFrameCss || undefined}
            className="w-16 h-16 text-xl"
          />
          <div className="flex-1 min-w-0 space-y-1">
            <h2 className="text-xl font-bold text-white truncate">
              {user?.username || playerName || 'Loading...'}
            </h2>
            {user?.equippedTitleName && (
              <div>
                <TitleBadge
                  title={user.equippedTitleName}
                  color={user.equippedTitleColor || 'text-zinc-400'}
                  size="sm"
                />
              </div>
            )}
            {user && (
              <>
                <p className="text-zinc-400 text-sm">{user.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <CalendarDays className="w-3.5 h-3.5 text-zinc-500" />
                  <p className="text-zinc-500 text-xs">
                    Joined {formatDate(user.createdAt)}
                  </p>
                </div>
              </>
            )}
          </div>
          {user && (
            <div className="text-right">
              <p className="text-2xl font-display font-bold text-emerald-400 tabular-nums">
                {formatChips(user.chipBalance)}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-zinc-500">balance</p>
            </div>
          )}
        </motion.div>

        {/* Loading state */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonListItem key={i} />
            ))}
          </div>
        ) : stats ? (
          <div className="space-y-6">
            {/* Player Stats */}
            <PlayerStatsSection stats={stats} showTransferStats={true} />

            {/* Head to Head */}
            {h2hData && h2hData.total > 0 && (
              <HeadToHeadSection
                data={h2hData}
                otherUsername={user?.username || playerName || 'Player'}
              />
            )}

            {/* Achievements */}
            {playerId && <AchievementsSection userId={playerId} />}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-zinc-400">Unable to load player stats</p>
          </div>
        )}
      </div>
    </Sheet>
  );
}
