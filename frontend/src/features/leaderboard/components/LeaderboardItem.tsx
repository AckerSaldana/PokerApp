import { motion } from 'framer-motion';
import { Avatar } from '@/components/ui/Avatar';
import { formatChips } from '@/lib/utils';
import type { LeaderboardEntry } from '@/lib/types';
import { cn } from '@/lib/utils';
import { staggerDepthItem } from '@/components/animations/variants';

interface LeaderboardItemProps {
  player: LeaderboardEntry;
  index: number;
}

export function LeaderboardItem({ player, index }: LeaderboardItemProps) {
  const isTopTen = player.rank <= 10;
  const positive = player.totalWinnings >= 0;

  return (
    <motion.div
      className={cn(
        'relative overflow-hidden flex items-center gap-4 p-4',
        'bg-gradient-to-r from-zinc-900/80 to-zinc-900/60',
        'backdrop-blur-sm rounded-2xl',
        'border border-zinc-800/50',
        'hover:border-zinc-700/50',
        'transition-all duration-300 group'
      )}
      variants={staggerDepthItem}
      whileHover={{ x: 4, backgroundColor: 'rgba(39, 39, 42, 0.5)' }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Left accent bar for top 10 */}
      {isTopTen && (
        <div className={cn(
          'absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl',
          positive
            ? 'bg-gradient-to-b from-emerald-500 to-emerald-600'
            : 'bg-gradient-to-b from-red-500 to-red-600',
          'opacity-50 group-hover:opacity-80 transition-opacity'
        )} />
      )}

      {/* Rank badge */}
      <motion.div
        className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center font-bold',
          'bg-zinc-800/80 text-zinc-400',
          'border border-zinc-700/50'
        )}
        whileHover={{ scale: 1.1 }}
        transition={{ type: 'spring', stiffness: 400 }}
      >
        <span className="text-lg">{player.rank}</span>
      </motion.div>

      {/* Avatar with ring */}
      <Avatar
        name={player.username}
        size="md"
        className="ring-2 ring-zinc-700/50 ring-offset-2 ring-offset-zinc-900"
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
        <motion.p
          className={cn(
            'font-bold text-lg tabular-nums',
            positive ? 'text-emerald-400' : 'text-red-400'
          )}
          initial={{ x: 10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: index * 0.05 }}
        >
          {positive ? '+' : ''}{formatChips(player.totalWinnings)}
        </motion.p>
        <p className="text-xs text-zinc-500">chips</p>
      </div>
    </motion.div>
  );
}
