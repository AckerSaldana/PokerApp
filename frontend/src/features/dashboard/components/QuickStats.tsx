import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Trophy, Gamepad2, TrendingUp } from 'lucide-react';
import { usersApi } from '@/services/api/users';
import { useAuthStore } from '@/stores/authStore';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { staggerDepth, staggerDepthItem } from '@/components/animations/variants';

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
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-zinc-900/70 backdrop-blur-md rounded-2xl p-4 border border-zinc-800/50">
            <Skeleton className="h-10 w-10 rounded-xl mb-3" />
            <Skeleton className="h-3 w-12 mb-2" />
            <Skeleton className="h-6 w-10" />
          </div>
        ))}
      </div>
    );
  }

  const statsItems = [
    {
      icon: Gamepad2,
      label: 'Games',
      value: stats?.gameStats.totalGames || 0,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      glowColor: 'group-hover:shadow-blue-500/20',
      gradient: 'from-blue-500/20 to-transparent',
    },
    {
      icon: Trophy,
      label: 'Wins',
      value: stats?.gameStats.wins || 0,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      glowColor: 'group-hover:shadow-amber-500/20',
      gradient: 'from-amber-500/20 to-transparent',
    },
    {
      icon: TrendingUp,
      label: 'Win Rate',
      value: `${Math.round((stats?.gameStats.winRate || 0) * 100)}%`,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      glowColor: 'group-hover:shadow-emerald-500/20',
      gradient: 'from-emerald-500/20 to-transparent',
    },
  ];

  return (
    <motion.div
      className="grid grid-cols-3 gap-4"
      variants={staggerDepth}
      initial="initial"
      animate="animate"
    >
      {statsItems.map((item, index) => {
        // Assign a suit to each card based on index
        const suit = index === 0 ? '\u2660' : index === 1 ? '\u2665' : '\u2666'; // Spade, Heart, Diamond
        const isRed = index === 1 || index === 2;

        return (
          <motion.div key={item.label} variants={staggerDepthItem}>
            <div className="relative group h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/0 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <Card 
                variant="glass" 
                className="relative p-3 h-full overflow-hidden border-zinc-800/50 group-hover:border-[var(--color-gold-500)]/30 transition-all duration-300 rounded-[2rem]"
              >
                {/* Poker Card Background Texture */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                     style={{ backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`, backgroundSize: '16px 16px' }} 
                />
                
                {/* Giant Watermark Suit */}
                <div className={`absolute -bottom-4 -right-4 text-6xl font-serif opacity-[0.05] group-hover:opacity-[0.1] transition-opacity duration-300 select-none ${isRed ? 'text-red-500' : 'text-white'}`}>
                  {suit}
                </div>

                {/* Top Corner Suit (Playing Card Style) */}
                <div className={`absolute top-2 left-3 text-xs font-serif opacity-40 ${isRed ? 'text-red-400' : 'text-zinc-400'}`}>
                  {suit}
                </div>

                <div className="flex flex-col items-center justify-center text-center h-full pt-2 relative z-10">
                  {/* Icon Container with Glow */}
                  <motion.div
                    className={`w-10 h-10 rounded-xl ${item.bgColor} 
                               flex items-center justify-center mb-2 relative
                               border border-white/5 shadow-lg ${item.glowColor}`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className={`absolute inset-0 ${item.bgColor} blur-md opacity-50`} />
                    <item.icon className={`w-5 h-5 ${item.color} relative z-10`} />
                  </motion.div>

                  {/* Value */}
                  <motion.p
                    className="text-white text-xl font-display font-bold tabular-nums leading-tight tracking-tight mt-1"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                  >
                    {item.value}
                  </motion.p>

                  {/* Label */}
                  <p className="text-[var(--color-gold-400)] text-[9px] uppercase tracking-widest font-semibold mt-1 opacity-80">
                    {item.label}
                  </p>
                </div>
              </Card>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
