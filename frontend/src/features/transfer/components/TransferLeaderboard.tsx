import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Trophy, ArrowUpRight, ArrowDownLeft, ArrowLeftRight } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { SkeletonListItem } from '@/components/ui/Skeleton';
import { formatChips, cn } from '@/lib/utils';
import { transferApi } from '@/services/api/transfer';
import type { TransferLeaderboardEntry } from '@/lib/types';

type LeaderboardMode = 'volume' | 'received' | 'sent';

const modeConfig: Record<LeaderboardMode, { label: string; icon: React.ReactNode; getValue: (e: TransferLeaderboardEntry) => number; sublabel: string }> = {
  volume: {
    label: 'Volume',
    icon: <ArrowLeftRight className="w-4 h-4" />,
    getValue: (e) => e.totalTransferred,
    sublabel: 'volume',
  },
  received: {
    label: 'Received',
    icon: <ArrowDownLeft className="w-4 h-4" />,
    getValue: (e) => e.totalReceived,
    sublabel: 'received',
  },
  sent: {
    label: 'Sent',
    icon: <ArrowUpRight className="w-4 h-4" />,
    getValue: (e) => e.totalSent,
    sublabel: 'sent',
  },
};

// Premium Rank Types
const rankStyles: Record<number, string> = {
  1: 'bg-gradient-to-b from-[var(--color-gold-300)] to-[var(--color-gold-600)] text-amber-950 shadow-[0_0_15px_rgba(251,191,36,0.5)] border border-[var(--color-gold-300)]',
  2: 'bg-gradient-to-b from-zinc-100 to-zinc-400 text-zinc-900 shadow-[0_0_15px_rgba(228,228,231,0.3)] border border-zinc-200',
  3: 'bg-gradient-to-b from-amber-600 to-amber-800 text-amber-100 shadow-[0_0_15px_rgba(180,83,9,0.3)] border border-amber-600',
};

function TransferLeaderboardItem({
  entry,
  index,
  rank,
  mode
}: {
  entry: TransferLeaderboardEntry;
  index: number;
  rank: number;
  mode: LeaderboardMode;
}) {
  const isTopThree = rank <= 3;
  const config = modeConfig[mode];
  const value = config.getValue(entry);

  return (
    <motion.div
      className={cn(
        "flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300",
        isTopThree
          ? "bg-[var(--bg-surface-elevated)] border-[var(--color-gold-500)]/20"
          : "bg-[var(--bg-surface)] border-[var(--glass-border)]"
      )}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      whileTap={{ scale: 0.98 }}
    >
      <motion.div
        className={cn(
          'w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-lg relative overflow-hidden',
          isTopThree ? rankStyles[rank] : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
        )}
        initial={isTopThree ? { scale: 0, rotate: -180 } : {}}
        animate={isTopThree ? { scale: 1, rotate: 0 } : {}}
        transition={{ type: 'spring', delay: index * 0.05 + 0.2 }}
      >
        {isTopThree && <div className="absolute inset-0 bg-white/20 skew-x-12 animate-shimmer" />}
        {isTopThree ? <Trophy className="w-6 h-6 drop-shadow-sm" /> : rank}
      </motion.div>

      <Avatar name={entry.username} size="md" className={cn(isTopThree && "ring-2 ring-[var(--color-gold-400)]/50 ring-offset-2 ring-offset-black")} />

      <div className="flex-1 min-w-0">
        <p className={cn("font-bold truncate text-base", isTopThree ? "text-[var(--color-gold-100)]" : "text-white")}>
          {entry.username}
        </p>
        <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)] mt-1">
          <span className="flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3 text-red-400" />
            {entry.transfersSentCount}
          </span>
          <span className="flex items-center gap-1">
            <ArrowDownLeft className="w-3 h-3 text-[var(--color-emerald-400)]" />
            {entry.transfersReceivedCount}
          </span>
        </div>
      </div>

      <div className="text-right">
        <p className={cn(
          "font-display font-bold text-xl tabular-nums drop-shadow-sm",
          mode === 'sent' ? 'text-red-400' : 'text-[var(--color-emerald-400)]'
        )}>
          {formatChips(value)}
        </p>
        <p className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">{config.sublabel}</p>
      </div>
    </motion.div>
  );
}

export function TransferLeaderboard() {
  const [mode, setMode] = useState<LeaderboardMode>('volume');

  const { data, isLoading } = useQuery({
    queryKey: ['transfer-leaderboard'],
    queryFn: () => transferApi.getLeaderboard(20),
    staleTime: 60_000,
  });

  // Sort entries based on current mode
  const sortedEntries = useMemo(() => {
    if (!data?.leaderboard) return [];
    const config = modeConfig[mode];
    return [...data.leaderboard].sort((a, b) => config.getValue(b) - config.getValue(a));
  }, [data?.leaderboard, mode]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <SkeletonListItem key={i} />
        ))}
      </div>
    );
  }

  if (!data?.leaderboard.length) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-500">No transfers yet</p>
        <p className="text-zinc-600 text-sm mt-1">
          Be the first to send some chips!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      <div className="flex gap-1 p-1 bg-zinc-900/80 rounded-xl border border-zinc-800">
        {(Object.keys(modeConfig) as LeaderboardMode[]).map((modeKey) => {
          const config = modeConfig[modeKey];
          const isActive = mode === modeKey;
          return (
            <button
              key={modeKey}
              onClick={() => setMode(modeKey)}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all',
                isActive
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              )}
            >
              {config.icon}
              <span>{config.label}</span>
            </button>
          );
        })}
      </div>

      {/* Leaderboard list */}
      <div className="space-y-3">
        {sortedEntries.map((entry, index) => (
          <TransferLeaderboardItem
            key={entry.userId}
            entry={entry}
            index={index}
            rank={index + 1}
            mode={mode}
          />
        ))}
      </div>
    </div>
  );
}
