import { motion } from 'framer-motion';
import { Avatar } from '@/components/ui/Avatar';
import { formatChips } from '@/lib/utils';
import type { LeaderboardEntry } from '@/lib/types';
import { cn } from '@/lib/utils';

interface LeaderboardItemProps {
  player: LeaderboardEntry;
  index: number;
  onPlayerTap?: (playerId: string, playerName: string) => void;
}

export function LeaderboardItem({ player, onPlayerTap }: LeaderboardItemProps) {
  const positive = player.totalWinnings >= 0;

  return (
    <motion.div
      className={cn(
        'relative flex items-center gap-4 p-4',
        'bg-white/5 rounded-xl',
        'border border-white/10',
        'transition-colors duration-200',
        onPlayerTap && 'cursor-pointer'
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.01, borderColor: 'rgba(255, 255, 255, 0.15)' }}
      whileTap={onPlayerTap ? { scale: 0.98 } : undefined}
      onClick={() => onPlayerTap?.(player.userId, player.username)}
    >
      {/* Rank badge */}
      <div
        className={cn(
          'w-10 h-10 rounded-lg flex items-center justify-center font-bold',
          'bg-zinc-800/80 text-zinc-400'
        )}
      >
        <span className="text-sm">{player.rank}</span>
      </div>

      {/* Avatar */}
      <Avatar
        name={player.username}
        size="md"
      />

      {/* Player info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-white truncate">{player.username}</p>
        <p className="text-sm text-zinc-500">
          {player.gamesPlayed} games · {Math.round(player.winRate * 100)}% wins
        </p>
      </div>

      {/* Winnings */}
      <div className="text-right">
        <p
          className={cn(
            'font-bold text-lg tabular-nums',
            positive ? 'text-emerald-400' : 'text-red-400'
          )}
        >
          {positive ? '+' : ''}{formatChips(player.totalWinnings)}
        </p>
      </div>
    </motion.div>
  );
}
