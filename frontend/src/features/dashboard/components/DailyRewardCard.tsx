import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Flame, Gift, Check, Zap, Crown, Sparkles } from 'lucide-react';
import { balanceApi } from '@/services/api/balance';
import { eventsApi } from '@/services/api/events';
import { cn } from '@/lib/utils';
import { StreakDetailsModal } from './StreakDetailsModal';

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

const MILESTONES = [3, 7, 14, 30, 60, 100, 150, 200, 365, 500, 1000];

function getNextMilestone(currentStreak: number): number {
  return MILESTONES.find(m => m > currentStreak) ?? 1000;
}

function getPreviousMilestone(currentStreak: number): number {
  const reversed = [...MILESTONES].reverse();
  return reversed.find(m => m <= currentStreak) ?? 0;
}

function getMilestoneProgress(currentStreak: number): number {
  const next = getNextMilestone(currentStreak);
  const prev = getPreviousMilestone(currentStreak);
  if (currentStreak >= 1000) return 100;
  return Math.round(((currentStreak - prev) / (next - prev)) * 100);
}

function isMilestoneStreak(streak: number): boolean {
  return MILESTONES.includes(streak);
}

export function DailyRewardCard() {
  const queryClient = useQueryClient();
  const [timeRemaining, setTimeRemaining] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrateMilestone, setCelebrateMilestone] = useState(false);
  const [previousStreak, setPreviousStreak] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['dailyBonusStatus'],
    queryFn: balanceApi.getDailyBonusStatus,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  const { data: activeEvents } = useQuery({
    queryKey: ['activeEvents'],
    queryFn: eventsApi.getActiveEvents,
    refetchInterval: 60000, // Refresh every minute
  });

  const activeEvent = activeEvents?.[0]; // Highest priority event

  // Initialize previous streak when data loads
  useEffect(() => {
    if (data && previousStreak === 0) {
      setPreviousStreak(data.currentStreak);
    }
  }, [data, previousStreak]);

  const claimMutation = useMutation({
    mutationFn: balanceApi.claimDailyBonus,
    onSuccess: (result) => {
      if (result.claimed) {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 2000);

        // Check if milestone was reached
        const newStreak = result.currentStreak;
        if (isMilestoneStreak(newStreak) && newStreak > previousStreak) {
          setCelebrateMilestone(true);
          setTimeout(() => setCelebrateMilestone(false), 3000);
        }
        setPreviousStreak(newStreak);
      }
      queryClient.invalidateQueries({ queryKey: ['dailyBonusStatus'] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
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
      <div className="rounded-2xl bg-black/40 border border-[#d4af37]/20 p-4 h-24 animate-pulse" />
    );
  }

  if (!data) return null;

  const isUltraLong = data.currentStreak >= 100;
  const isLegendary = data.currentStreak >= 365;

  return (
    <motion.div
      className={cn(
        "relative overflow-hidden rounded-2xl p-4 border",
        isLegendary
          ? "bg-gradient-to-br from-black/70 via-[#ffd700]/10 to-black/70 border-[#ffd700]/40"
          : isUltraLong
          ? "bg-gradient-to-br from-black/60 via-[#d4af37]/10 to-black/60 border-[#d4af37]/50"
          : "bg-black/60 border-[#d4af37]/40"
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Glow effect when can claim */}
      {data.canClaim && (
        <motion.div
          className={cn(
            "absolute inset-0",
            isLegendary ? "bg-[#ffd700]/10" : "bg-[#d4af37]/10"
          )}
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      <div className="relative flex items-center justify-between gap-4">
        {/* Streak Info */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center transition-all relative",
            data.currentStreak > 0
              ? isLegendary
                ? "bg-gradient-to-br from-[#ffd700] via-[#d4af37] to-[#f4d03f] shadow-xl shadow-[#ffd700]/40"
                : isUltraLong
                ? "bg-gradient-to-br from-[#f4d03f] to-[#d4af37] shadow-xl shadow-[#d4af37]/40"
                : "bg-[#d4af37] shadow-lg shadow-[#d4af37]/30"
              : "bg-white/10"
          )}>
            <motion.div
              animate={
                data.currentStreak >= 7
                  ? {
                      scale: [1, 1.1, 1],
                      rotate: isLegendary ? [0, 5, -5, 0] : 0
                    }
                  : {}
              }
              transition={{ duration: 2, repeat: Infinity }}
            >
              {isLegendary ? (
                <Crown className="w-6 h-6 text-black" />
              ) : (
                <Flame className={cn(
                  "w-6 h-6",
                  data.currentStreak > 0 ? "text-black" : "text-zinc-400"
                )} />
              )}
            </motion.div>
            {isLegendary && (
              <motion.div
                className="absolute inset-0 rounded-xl"
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="absolute inset-0 rounded-xl bg-[#ffd700]/20 blur-md" />
              </motion.div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={cn(
                "text-2xl font-bold tabular-nums transition-all",
                isLegendary
                  ? "text-[#ffd700] drop-shadow-[0_0_12px_rgba(255,215,0,0.6)]"
                  : data.currentStreak >= 7
                  ? "text-[#f4d03f] drop-shadow-[0_0_8px_rgba(244,208,63,0.5)]"
                  : "text-white"
              )}>
                {data.currentStreak}
              </span>
              <span className={cn(
                "text-sm",
                isLegendary ? "text-[#ffd700]" : "text-[#f4d03f]"
              )}>
                day streak
              </span>
              {isLegendary ? (
                <motion.div
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-[#ffd700]/20 to-[#f4d03f]/20 border border-[#ffd700]/40"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                >
                  <Sparkles className="w-3 h-3 text-[#ffd700]" />
                  <span className="text-[10px] font-bold text-[#ffd700] uppercase tracking-wider">
                    Legendary
                  </span>
                </motion.div>
              ) : data.currentStreak >= 7 ? (
                <motion.div
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                >
                  <Zap className="w-3 h-3 text-[#f4d03f]" />
                  <span className="text-[10px] font-bold text-[#f4d03f] uppercase tracking-wider">
                    On Fire
                  </span>
                </motion.div>
              ) : null}
              {activeEvent && activeEvent.multiplier > 1 && (
                <motion.div
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full animate-pulse"
                  style={{
                    backgroundColor: `${activeEvent.bannerColor}30`,
                    borderWidth: '1px',
                    borderColor: activeEvent.bannerColor,
                  }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: activeEvent.bannerColor }}>
                    {activeEvent.multiplier}x EVENT
                  </span>
                </motion.div>
              )}
            </div>
            <p className="text-xs text-zinc-400">
              {data.canClaim
                ? `+${data.nextBonusAmount} chips waiting!`
                : `Next: ${timeRemaining}`
              }
            </p>
          </div>
        </button>

        {/* Claim Button */}
        <motion.button
          onClick={() => claimMutation.mutate()}
          disabled={!data.canClaim || claimMutation.isPending}
          className={cn(
            "relative px-5 py-2.5 rounded-xl font-semibold text-sm transition-all border",
            data.canClaim
              ? "bg-[#d4af37] text-black border-[#f4d03f] shadow-lg shadow-[#d4af37]/20 hover:bg-[#f4d03f]"
              : "bg-white/5 text-zinc-500 border-white/10 cursor-not-allowed"
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

      {/* Milestone Progress */}
      {data.currentStreak > 0 && (
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className={cn(
              "text-xs",
              isLegendary ? "text-[#ffd700]/70" : "text-zinc-400"
            )}>
              {data.currentStreak >= 1000
                ? 'All milestones conquered!'
                : getNextMilestone(data.currentStreak) > data.currentStreak
                ? `Next milestone: ${getNextMilestone(data.currentStreak)} days`
                : 'Milestone reached!'}
            </span>
            <span className={cn(
              "text-xs font-medium",
              isLegendary ? "text-[#ffd700]" : "text-[#d4af37]"
            )}>
              {getMilestoneProgress(data.currentStreak)}%
            </span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className={cn(
                "h-full",
                isLegendary
                  ? "bg-gradient-to-r from-[#ffd700] via-[#d4af37] to-[#f4d03f]"
                  : "bg-gradient-to-r from-[#d4af37] to-[#f4d03f]"
              )}
              initial={{ width: 0 }}
              animate={{ width: `${getMilestoneProgress(data.currentStreak)}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>
      )}

      {/* Milestone Celebration Overlay */}
      <AnimatePresence>
        {celebrateMilestone && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm rounded-2xl z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="text-center"
              initial={{ scale: 0.5, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.5, y: 20 }}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: 2 }}
              >
                <Flame className="w-16 h-16 text-[#f4d03f] mx-auto mb-3" />
              </motion.div>
              <h3 className="text-2xl font-bold text-[#f4d03f] mb-1">
                Milestone Reached!
              </h3>
              <p className="text-sm text-zinc-300">
                {data.currentStreak} day streak 🔥
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Streak Details Modal */}
      <StreakDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentStreak={data.currentStreak}
        nextBonusAmount={data.nextBonusAmount}
        canClaim={data.canClaim}
        nextClaimAt={data.nextClaimAt}
      />
    </motion.div>
  );
}
