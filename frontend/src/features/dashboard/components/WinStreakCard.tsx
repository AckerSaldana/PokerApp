import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Target, Trophy } from 'lucide-react';
import { authApi } from '@/services/api/auth';
import { cn } from '@/lib/utils';

export function WinStreakCard() {
  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: authApi.getMe,
    staleTime: 30_000,
  });

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-black/40 border border-[#d4af37]/20 p-4 h-24 animate-pulse" />
    );
  }

  if (!user) return null;

  const streak = user.consecutiveWins || 0;
  const multiplier = 1.0 + Math.min(streak, 10) * 0.1;
  const nextMultiplier = 1.0 + Math.min(streak + 1, 10) * 0.1;

  const isOnFire = streak >= 3;
  const isLegendary = streak >= 10;

  return (
    <motion.div
      className={cn(
        "relative overflow-hidden rounded-2xl p-4 border",
        isLegendary
          ? "bg-gradient-to-br from-black/70 via-purple-500/10 to-black/70 border-purple-500/40"
          : isOnFire
          ? "bg-gradient-to-br from-black/60 via-orange-500/10 to-black/60 border-orange-500/40"
          : "bg-black/60 border-[#d4af37]/40"
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Glow effect when streak active */}
      {isOnFire && (
        <motion.div
          className={cn(
            "absolute inset-0",
            isLegendary ? "bg-purple-500/10" : "bg-orange-500/10"
          )}
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      <div className="relative flex items-center justify-between">
        {/* Streak Display */}
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center",
            isLegendary
              ? "bg-gradient-to-br from-purple-500 to-pink-500 shadow-xl"
              : isOnFire
              ? "bg-gradient-to-br from-orange-500 to-red-500 shadow-lg"
              : "bg-white/10"
          )}>
            <motion.div
              animate={isOnFire ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {isLegendary ? (
                <Trophy className="w-6 h-6 text-white" />
              ) : (
                <Target className={cn(
                  "w-6 h-6",
                  isOnFire ? "text-white" : "text-zinc-500"
                )} />
              )}
            </motion.div>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={cn(
                "text-2xl font-bold tabular-nums",
                isLegendary
                  ? "text-purple-400"
                  : isOnFire
                  ? "text-orange-400"
                  : "text-white"
              )}>
                {streak}
              </span>
              <span className="text-sm text-zinc-400">win streak</span>

              {isLegendary && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-400 font-bold">
                  LEGENDARY
                </span>
              )}
              {isOnFire && !isLegendary && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-400 font-bold">
                  ON FIRE
                </span>
              )}
            </div>

            {streak > 0 ? (
              <p className="text-xs text-zinc-400">
                Current multiplier: {multiplier.toFixed(1)}x
              </p>
            ) : (
              <p className="text-xs text-zinc-400">
                Win a game to start your streak!
              </p>
            )}
          </div>
        </div>

        {/* Next Multiplier Badge */}
        {streak < 10 && (
          <div className="text-right">
            <p className="text-xs text-zinc-500 uppercase tracking-wider">Next</p>
            <p className="text-lg font-bold text-[#d4af37]">
              {nextMultiplier.toFixed(1)}x
            </p>
          </div>
        )}
        {streak >= 10 && (
          <div className="text-right">
            <p className="text-xs text-purple-400 uppercase tracking-wider">Max</p>
            <p className="text-lg font-bold text-purple-400">
              2.0x
            </p>
          </div>
        )}
      </div>

      {/* Personal Best */}
      {(user.maxWinStreak || 0) > streak && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <p className="text-xs text-zinc-500">
            Personal best: <span className="text-zinc-400 font-semibold">{user.maxWinStreak} wins</span>
          </p>
        </div>
      )}
    </motion.div>
  );
}
