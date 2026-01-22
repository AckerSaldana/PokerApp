import { motion } from 'framer-motion';
import { Gamepad2, TrendingUp, TrendingDown, Send, Download } from 'lucide-react';
import { formatChips, cn } from '@/lib/utils';
import type { UserStats } from '@/lib/types';

interface PlayerStatsSectionProps {
  stats: UserStats;
  showTransferStats?: boolean;
}

export function PlayerStatsSection({ stats, showTransferStats = true }: PlayerStatsSectionProps) {
  const gameStats = [
    {
      icon: Gamepad2,
      label: 'Games Played',
      value: stats.gameStats.totalGames,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      icon: TrendingUp,
      label: 'Total Winnings',
      value: formatChips(stats.gameStats.totalWinnings),
      prefix: stats.gameStats.totalWinnings >= 0 ? '+' : '',
      color: stats.gameStats.totalWinnings >= 0 ? 'text-emerald-400' : 'text-red-400',
      bgColor: stats.gameStats.totalWinnings >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10',
    },
    {
      icon: TrendingUp,
      label: 'Biggest Win',
      value: formatChips(stats.gameStats.biggestWin),
      prefix: '+',
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
    },
    {
      icon: TrendingDown,
      label: 'Biggest Loss',
      value: formatChips(stats.gameStats.biggestLoss),
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
    },
  ];

  const transferStats = [
    {
      icon: Send,
      label: 'Total Sent',
      value: formatChips(stats.transferStats.totalSent),
      subtext: `${stats.transferStats.transfersSentCount} transfers`,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
    },
    {
      icon: Download,
      label: 'Total Received',
      value: formatChips(stats.transferStats.totalReceived),
      subtext: `${stats.transferStats.transfersReceivedCount} transfers`,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Game Stats */}
      <div>
        <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-widest pl-1 mb-3">
          Game Statistics
        </h3>
        <div className="space-y-2">
          {gameStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className="rounded-xl bg-white/5 border border-white/10 p-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', stat.bgColor)}>
                    <stat.icon className={cn('w-4 h-4', stat.color)} />
                  </div>
                  <span className="text-zinc-400 text-sm">{stat.label}</span>
                </div>
                <span className={cn('text-lg font-display font-bold tabular-nums', stat.color)}>
                  {stat.prefix}{stat.value}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Transfer Stats */}
      {showTransferStats && (
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-widest pl-1 mb-3">
            Transfer Activity
          </h3>
          <div className="space-y-2">
            {transferStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: (gameStats.length + index) * 0.05 }}
                className="rounded-xl bg-white/5 border border-white/10 p-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', stat.bgColor)}>
                      <stat.icon className={cn('w-4 h-4', stat.color)} />
                    </div>
                    <div>
                      <span className="text-zinc-400 text-sm block">{stat.label}</span>
                      <span className="text-zinc-500 text-xs">{stat.subtext}</span>
                    </div>
                  </div>
                  <span className="text-lg font-display font-bold text-white tabular-nums">
                    {stat.value}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
