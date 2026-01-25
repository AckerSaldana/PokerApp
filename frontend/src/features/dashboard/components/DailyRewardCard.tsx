import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Flame, Gift, Check } from 'lucide-react';
import { balanceApi } from '@/services/api/balance';
import { cn } from '@/lib/utils';

function formatTimeRemaining(targetDate: Date): string {
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();

  if (diff <= 0) return 'Now!';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m ${seconds}s`;
}

export function DailyRewardCard() {
  const queryClient = useQueryClient();
  const [timeRemaining, setTimeRemaining] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['dailyBonusStatus'],
    queryFn: balanceApi.getDailyBonusStatus,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  const claimMutation = useMutation({
    mutationFn: balanceApi.claimDailyBonus,
    onSuccess: (result) => {
      if (result.claimed) {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 2000);
      }
      queryClient.invalidateQueries({ queryKey: ['dailyBonusStatus'] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
    },
  });

  // Update countdown timer
  useEffect(() => {
    if (!data || data.canClaim) return;

    const targetDate = new Date(data.nextClaimAt);
    const updateTimer = () => {
      setTimeRemaining(formatTimeRemaining(targetDate));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [data]);

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-gradient-to-r from-amber-900/30 to-orange-900/30 border border-amber-500/20 p-4 h-24 animate-pulse" />
    );
  }

  if (!data) return null;

  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-900/40 to-orange-900/40 border border-amber-500/30 p-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Glow effect when can claim */}
      {data.canClaim && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      <div className="relative flex items-center justify-between gap-4">
        {/* Streak Info */}
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center",
            data.currentStreak > 0
              ? "bg-gradient-to-br from-orange-500 to-amber-600"
              : "bg-white/10"
          )}>
            <Flame className={cn(
              "w-6 h-6",
              data.currentStreak > 0 ? "text-white" : "text-zinc-400"
            )} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white">{data.currentStreak}</span>
              <span className="text-sm text-amber-300/80">day streak</span>
            </div>
            <p className="text-xs text-zinc-400">
              {data.canClaim
                ? `+${data.nextBonusAmount} chips waiting!`
                : `Next: ${timeRemaining}`
              }
            </p>
          </div>
        </div>

        {/* Claim Button */}
        <motion.button
          onClick={() => claimMutation.mutate()}
          disabled={!data.canClaim || claimMutation.isPending}
          className={cn(
            "relative px-5 py-2.5 rounded-xl font-semibold text-sm transition-all",
            data.canClaim
              ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25"
              : "bg-white/5 text-zinc-500 cursor-not-allowed"
          )}
          whileHover={data.canClaim ? { scale: 1.05 } : {}}
          whileTap={data.canClaim ? { scale: 0.95 } : {}}
        >
          <AnimatePresence mode="wait">
            {showCelebration ? (
              <motion.span
                key="check"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="flex items-center gap-1"
              >
                <Check className="w-4 h-4" />
                Claimed!
              </motion.span>
            ) : (
              <motion.span
                key="claim"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1"
              >
                <Gift className="w-4 h-4" />
                {data.canClaim ? 'Claim' : 'Claimed'}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.div>
  );
}
