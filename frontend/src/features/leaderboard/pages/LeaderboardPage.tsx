import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Crown } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { LeaderboardItem } from '../components/LeaderboardItem';
import { PlayerProfileSheet } from '@/features/profile/components/PlayerProfileSheet';
import { leaderboardApi } from '@/services/api/leaderboard';
import { SkeletonListItem } from '@/components/ui/Skeleton';
import { Avatar } from '@/components/ui/Avatar';
import { useAuthStore } from '@/stores/authStore';
import { pageTransition } from '@/components/animations/variants';
import { cn, formatChips } from '@/lib/utils';
import type { LeaderboardEntry } from '@/lib/types';

type TimeFilter = 'all-time' | 'monthly' | 'weekly';

const filters: { label: string; value: TimeFilter }[] = [
  { label: 'All Time', value: 'all-time' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Weekly', value: 'weekly' },
];

// Podium component for top 3
interface PodiumProps {
  players: LeaderboardEntry[];
  onPlayerTap?: (playerId: string, playerName: string) => void;
}

function Podium({ players, onPlayerTap }: PodiumProps) {
  const first = players[0];
  const second = players[1];
  const third = players[2];

  if (!first) return null;

  const podiumData = [
    { player: second, position: 2, height: 'h-20', ringColor: 'ring-zinc-400', bgGradient: 'from-zinc-600 to-zinc-700', delay: 0.2 },
    { player: first, position: 1, height: 'h-28', ringColor: 'ring-amber-400', bgGradient: 'from-amber-500 to-amber-600', delay: 0.1, isFirst: true },
    { player: third, position: 3, height: 'h-16', ringColor: 'ring-amber-700', bgGradient: 'from-amber-800 to-amber-900', delay: 0.3 },
  ];

  return (
    <div className="flex items-end justify-center gap-3 mb-8 px-4 pt-8">
      {podiumData.map(({ player, position, height, ringColor, bgGradient, delay, isFirst }) => {
        if (!player) return <div key={position} className="w-24" />;

        return (
          <motion.div
            key={player.userId}
            className={cn('flex flex-col items-center cursor-pointer', isFirst && '-mt-8')}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.3, ease: 'easeOut' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onPlayerTap?.(player.userId, player.username)}
          >
            {/* Crown for first place */}
            {isFirst && (
              <div className="mb-2">
                <Crown className="w-8 h-8 text-amber-400" />
              </div>
            )}

            {/* Avatar with ring */}
            <div className="relative mb-3">
              <div className={cn(
                'rounded-full ring-4',
                ringColor,
                isFirst ? 'w-20 h-20' : 'w-16 h-16',
                'overflow-hidden'
              )}>
                <Avatar
                  name={player.username}
                  size={isFirst ? 'xl' : 'lg'}
                  className="w-full h-full"
                />
              </div>

              {/* Position badge */}
              <div className={cn(
                'absolute -bottom-1 -right-1',
                isFirst ? 'w-8 h-8' : 'w-6 h-6',
                `bg-gradient-to-br ${bgGradient}`,
                'rounded-full flex items-center justify-center',
                'font-bold',
                isFirst ? 'text-amber-900 text-sm' : 'text-white text-xs'
              )}>
                {position}
              </div>
            </div>

            {/* Username */}
            <p className="text-white font-semibold text-sm text-center truncate w-20 mb-2">
              {player.username}
            </p>

            {/* Podium block */}
            <div className={cn(
              height,
              'w-24 rounded-t-xl',
              `bg-gradient-to-t ${bgGradient}`,
              'flex items-end justify-center pb-2'
            )}>
              <span className={cn(
                'font-bold tabular-nums',
                isFirst ? 'text-amber-900' : position === 2 ? 'text-zinc-900' : 'text-amber-100'
              )}>
                {player.totalWinnings >= 0 ? '+' : ''}{formatChips(player.totalWinnings)}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export function LeaderboardPage() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all-time');
  const [selectedPlayer, setSelectedPlayer] = useState<{ id: string; name: string } | null>(null);
  const currentUser = useAuthStore((state) => state.user);

  const handlePlayerTap = (playerId: string, playerName: string) => {
    // Don't open sheet for own profile
    if (playerId === currentUser?.id) return;
    setSelectedPlayer({ id: playerId, name: playerName });
  };

  const { data, isLoading } = useQuery({
    queryKey: ['leaderboard', timeFilter],
    queryFn: () => {
      switch (timeFilter) {
        case 'weekly':
          return leaderboardApi.getWeekly();
        case 'monthly':
          return leaderboardApi.getMonthly();
        default:
          return leaderboardApi.getAllTime();
      }
    },
    staleTime: 60_000,
  });

  const hasTopThree = (data?.leaderboard?.length || 0) >= 3;
  const topThree = data?.leaderboard?.slice(0, 3) || [];
  const restOfLeaderboard = hasTopThree ? data?.leaderboard?.slice(3) : data?.leaderboard;

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <PageHeader title="Leaderboard" subtitle="See who's on top" />

      <div className="px-6">
        {/* Time filters with animated pill */}
        <div className="relative flex gap-1 p-1.5 bg-zinc-900/80 backdrop-blur-sm rounded-2xl border border-zinc-800/50 mb-6">
          {filters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setTimeFilter(filter.value)}
              className={cn(
                'relative z-10 flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-colors duration-200',
                timeFilter === filter.value
                  ? 'text-white'
                  : 'text-zinc-400 hover:text-zinc-200'
              )}
            >
              {timeFilter === filter.value && (
                <motion.div
                  layoutId="activeFilter"
                  className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-xl"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{filter.label}</span>
            </button>
          ))}
        </div>

        {/* Leaderboard content */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {[1, 2, 3, 4, 5].map((i) => (
                <SkeletonListItem key={i} />
              ))}
            </motion.div>
          ) : data?.leaderboard.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center py-16"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-zinc-800/50 flex items-center justify-center">
                <Crown className="w-8 h-8 text-zinc-600" />
              </div>
              <p className="text-zinc-400 font-medium">No games played yet</p>
              <p className="text-zinc-600 text-sm mt-1">
                Start a poker night to see the rankings!
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={timeFilter}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Podium for top 3 */}
              {hasTopThree && <Podium players={topThree} onPlayerTap={handlePlayerTap} />}

              {/* Rest of leaderboard (positions 4+) */}
              {hasTopThree && restOfLeaderboard && restOfLeaderboard.length > 0 && (
                <div className="space-y-4">
                  {restOfLeaderboard.map((player, index) => (
                    <LeaderboardItem
                      key={player.userId}
                      player={player}
                      index={index + 3}
                      onPlayerTap={handlePlayerTap}
                    />
                  ))}
                </div>
              )}

              {/* Show all items as list if less than 3 players (no podium) */}
              {!hasTopThree && data?.leaderboard && (
                <div className="space-y-4">
                  {data.leaderboard.map((player, index) => (
                    <LeaderboardItem
                      key={player.userId}
                      player={player}
                      index={index}
                      onPlayerTap={handlePlayerTap}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Player Profile Sheet */}
      <PlayerProfileSheet
        isOpen={!!selectedPlayer}
        onClose={() => setSelectedPlayer(null)}
        playerId={selectedPlayer?.id || null}
        playerName={selectedPlayer?.name}
      />
    </motion.div>
  );
}
