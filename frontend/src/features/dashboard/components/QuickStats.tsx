import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Trophy, Gamepad2, TrendingUp } from 'lucide-react';
import { usersApi } from '@/services/api/users';
import { useAuthStore } from '@/stores/authStore';
import { Skeleton } from '@/components/ui/Skeleton';
import { CountingNumber } from '@/components/ui/AnimatedNumber';

export function QuickStats() {
  const user = useAuthStore((state) => state.user);

  const { data: stats, isLoading } = useQuery({
    queryKey: ['userStats', user?.id],
    queryFn: () => usersApi.getStats(user!.id),
    enabled: !!user?.id,
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-8 w-12" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const totalGames = stats?.gameStats.totalGames || 0;
  const wins = stats?.gameStats.wins || 0;
  const winRate = Math.round((stats?.gameStats.winRate || 0) * 100);

  const statsItems = [
    {
      icon: Gamepad2,
      label: 'Games Played',
      value: totalGames,
      color: 'blue' as const,
      suit: '\u2660',
      isRed: false,
    },
    {
      icon: Trophy,
      label: 'Total Wins',
      value: wins,
      color: 'amber' as const,
      suit: '\u2665',
      isRed: true,
    },
    {
      icon: TrendingUp,
      label: 'Win Rate',
      value: winRate,
      color: 'emerald' as const,
      suit: '\u2666',
      isRed: true,
      suffix: '%',
    },
  ];

  const colorStyles = {
    blue: {
      accent: 'from-blue-500 to-blue-400',
      iconBg: 'bg-blue-500/10',
      iconText: 'text-blue-400',
    },
    amber: {
      accent: 'from-amber-500 to-amber-400',
      iconBg: 'bg-amber-500/10',
      iconText: 'text-amber-400',
    },
    emerald: {
      accent: 'from-emerald-500 to-emerald-400',
      iconBg: 'bg-emerald-500/10',
      iconText: 'text-emerald-400',
    },
  };

  return (
    <div className="space-y-3">
      {statsItems.map((item, index) => {
        const colors = colorStyles[item.color];
        const Icon = item.icon;

        return (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.3, ease: 'easeOut' }}
          >
            <motion.div
              className="relative rounded-xl bg-white/5 border border-white/10 p-4 overflow-hidden"
              whileHover={{ scale: 1.01, borderColor: 'rgba(255, 255, 255, 0.15)' }}
              transition={{ duration: 0.2 }}
            >
              {/* Content: horizontal layout */}
              <div className="flex items-center justify-between">
                {/* Left: Icon + Label */}
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${colors.iconBg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${colors.iconText}`} />
                  </div>
                  <span className="text-zinc-400 text-sm font-medium">{item.label}</span>
                </div>

                {/* Right: Value */}
                <span className="text-white text-3xl font-display font-bold tabular-nums">
                  <CountingNumber
                    value={item.value}
                    duration={0.8}
                    suffix={item.suffix}
                  />
                </span>
              </div>

              {/* Suit watermark */}
              <div
                className={`absolute -bottom-2 -right-1 text-4xl font-serif opacity-[0.03] select-none ${item.isRed ? 'text-red-500' : 'text-white'}`}
              >
                {item.suit}
              </div>
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}
