import { Sheet } from '@/components/ui/Sheet';
import { motion } from 'framer-motion';
import { Flame, Zap, X, Clock, Lightbulb, Check, Crown, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StreakDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStreak: number;
  nextBonusAmount: number;
  canClaim: boolean;
  nextClaimAt: string;
}

const MILESTONES = [
  { days: 3, name: 'Warming Up', tier: 'BRONZE', icon: 'flame' },
  { days: 7, name: 'Week Warrior', tier: 'BRONZE', icon: 'flame' },
  { days: 14, name: 'Fortnight Fighter', tier: 'SILVER', icon: 'flame' },
  { days: 30, name: 'Monthly Master', tier: 'GOLD', icon: 'flame' },
  { days: 60, name: 'Dedication Legend', tier: 'GOLD', icon: 'zap' },
  { days: 100, name: 'Unstoppable Force', tier: 'PLATINUM', icon: 'zap' },
  { days: 150, name: 'Streak Legend', tier: 'PLATINUM', icon: 'zap' },
  { days: 200, name: 'Eternal Flame', tier: 'PLATINUM', icon: 'zap' },
  { days: 365, name: 'Year Round Champion', tier: 'PLATINUM', icon: 'crown' },
  { days: 500, name: 'Half Millennia', tier: 'PLATINUM', icon: 'crown' },
  { days: 1000, name: 'Immortal Dedication', tier: 'PLATINUM', icon: 'crown' },
];

const DAILY_BASE_BONUS = 10;
const DAILY_STREAK_BONUS = 5;
const MAX_STREAK_BONUS = 50;

function getNextMilestone(currentStreak: number): number {
  return MILESTONES.find(m => m.days > currentStreak)?.days ?? 1000;
}

function getPreviousMilestone(currentStreak: number): number {
  const reversed = [...MILESTONES].reverse();
  return reversed.find(m => m.days <= currentStreak)?.days ?? 0;
}

function getMilestoneProgress(currentStreak: number): number {
  const next = getNextMilestone(currentStreak);
  const prev = getPreviousMilestone(currentStreak);
  if (currentStreak >= 1000) return 100;
  return Math.round(((currentStreak - prev) / (next - prev)) * 100);
}

function getTierColor(tier: string): string {
  switch (tier) {
    case 'BRONZE': return 'text-amber-600';
    case 'SILVER': return 'text-zinc-400';
    case 'GOLD': return 'text-[#f4d03f]';
    case 'PLATINUM': return 'text-cyan-400';
    default: return 'text-white';
  }
}

function formatRelativeTime(dateString: string): string {
  const target = new Date(dateString);
  const now = new Date();
  const diff = target.getTime() - now.getTime();

  if (diff <= 0) return 'now';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) return `in ${hours}h ${minutes}m`;
  return `in ${minutes}m`;
}

interface MilestoneItemProps {
  milestone: typeof MILESTONES[0];
  currentStreak: number;
  isLast: boolean;
}

function MilestoneItem({ milestone, currentStreak, isLast }: MilestoneItemProps) {
  const isReached = currentStreak >= milestone.days;
  const isCurrent = getNextMilestone(currentStreak) === milestone.days;
  const Icon = milestone.icon === 'flame' ? Flame : milestone.icon === 'crown' ? Crown : Zap;
  const isUltraRare = milestone.days >= 365;

  return (
    <div className="flex items-center gap-3 relative">
      {/* Timeline dot */}
      <div className={cn(
        "w-12 h-12 rounded-full flex items-center justify-center border-2 z-10 transition-all",
        isReached
          ? isUltraRare
            ? "bg-gradient-to-br from-[#f4d03f] via-[#d4af37] to-[#ffd700] border-[#ffd700] shadow-xl shadow-[#ffd700]/50"
            : "bg-[#d4af37] border-[#f4d03f] shadow-lg shadow-[#d4af37]/30"
          : isCurrent
          ? "bg-black border-[#d4af37] animate-pulse"
          : "bg-black/60 border-white/20"
      )}>
        {isReached ? (
          isUltraRare ? (
            <motion.div
              animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="w-6 h-6 text-black" />
            </motion.div>
          ) : (
            <Check className="w-6 h-6 text-black" />
          )
        ) : (
          <Icon className={cn(
            "w-6 h-6",
            isCurrent ? "text-[#d4af37]" : "text-zinc-600"
          )} />
        )}
      </div>

      {/* Milestone info */}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className={cn(
            "font-bold",
            isReached
              ? isUltraRare
                ? "text-[#ffd700] drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]"
                : "text-[#f4d03f]"
              : "text-white"
          )}>
            {milestone.days} Days
          </span>
          {isCurrent && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#f4d03f] font-semibold">
              NEXT
            </span>
          )}
          {isUltraRare && isReached && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-gradient-to-r from-[#ffd700]/20 to-[#f4d03f]/20 border border-[#ffd700]/40 text-[#ffd700] font-bold uppercase tracking-wider">
              LEGENDARY
            </span>
          )}
        </div>
        <p className={cn(
          "text-sm",
          isReached && isUltraRare ? "text-[#ffd700]/80" : "text-zinc-400"
        )}>
          {milestone.name}
        </p>

        {/* Progress bar for current milestone */}
        {isCurrent && currentStreak > 0 && (
          <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#d4af37] to-[#f4d03f]"
              initial={{ width: 0 }}
              animate={{ width: `${getMilestoneProgress(currentStreak)}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export function StreakDetailsModal({
  isOpen,
  onClose,
  currentStreak,
  nextBonusAmount,
  canClaim,
  nextClaimAt
}: StreakDetailsModalProps) {
  const streakBonus = Math.min(currentStreak * DAILY_STREAK_BONUS, MAX_STREAK_BONUS);
  const isUltraLong = currentStreak >= 100;
  const isLegendary = currentStreak >= 365;
  const isMaxed = currentStreak >= 1000;

  return (
    <Sheet isOpen={isOpen} onClose={onClose} className="bg-[#0a0a0a] border-t border-[#d4af37]/30">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
            {/* Header */}
            <motion.div variants={itemVariants} className="flex items-center justify-between">
              <div>
                <h2 className={cn(
                  "text-2xl font-bold",
                  isLegendary ? "text-[#ffd700]" : "text-white"
                )}>
                  Your Streak
                </h2>
                <p className={cn(
                  "text-sm",
                  isLegendary ? "text-[#ffd700]/70" : "text-zinc-400"
                )}>
                  {isMaxed
                    ? "You've reached the ultimate milestone!"
                    : isLegendary
                    ? "A legendary dedication!"
                    : isUltraLong
                    ? "An incredible achievement!"
                    : "Keep it going!"}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-white/5 hover:bg-[#d4af37]/20 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </motion.div>

            {/* Current Streak Display (Hero Section) */}
            <motion.div
              variants={itemVariants}
              className={cn(
                "text-center p-6 rounded-2xl border",
                isLegendary
                  ? "bg-gradient-to-br from-black/80 via-[#ffd700]/10 to-black/80 border-[#ffd700]/50"
                  : isUltraLong
                  ? "bg-gradient-to-br from-black/70 via-[#d4af37]/10 to-black/70 border-[#d4af37]/50"
                  : "bg-black/60 border-[#d4af37]/40"
              )}
            >
              <motion.div
                className="inline-block mb-3"
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: isLegendary ? [0, 5, -5, 0] : 0
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className={cn(
                  "w-20 h-20 rounded-full flex items-center justify-center shadow-lg relative",
                  isLegendary
                    ? "bg-gradient-to-br from-[#ffd700] via-[#d4af37] to-[#f4d03f] shadow-[#ffd700]/50"
                    : isUltraLong
                    ? "bg-gradient-to-br from-[#f4d03f] to-[#d4af37] shadow-[#d4af37]/40"
                    : "bg-[#d4af37] shadow-[#d4af37]/30"
                )}>
                  {isLegendary ? (
                    <Crown className="w-10 h-10 text-black" />
                  ) : (
                    <Flame className="w-10 h-10 text-black" />
                  )}
                  {isLegendary && (
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <div className="absolute inset-0 rounded-full bg-[#ffd700]/30 blur-xl" />
                    </motion.div>
                  )}
                </div>
              </motion.div>
              <h3 className={cn(
                "text-5xl font-bold mb-2 tabular-nums",
                isLegendary
                  ? "text-[#ffd700] drop-shadow-[0_0_12px_rgba(255,215,0,0.6)]"
                  : "text-[#f4d03f]"
              )}>
                {currentStreak}
              </h3>
              <p className={cn(
                "text-lg",
                isLegendary ? "text-[#ffd700]/80" : "text-zinc-300"
              )}>
                Day Streak
              </p>
              {isLegendary && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-[#ffd700]" />
                  <span className="text-sm font-semibold text-[#ffd700] uppercase tracking-wider">
                    Legendary Status
                  </span>
                  <Sparkles className="w-4 h-4 text-[#ffd700]" />
                </motion.div>
              )}
            </motion.div>

            {/* Milestone Progress Section */}
            {isMaxed ? (
              <motion.div
                variants={itemVariants}
                className="p-6 rounded-2xl bg-gradient-to-br from-[#ffd700]/10 via-black/60 to-[#d4af37]/10 border border-[#ffd700]/40 text-center"
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="inline-block mb-4"
                >
                  <Crown className="w-16 h-16 text-[#ffd700]" />
                </motion.div>
                <h3 className="text-2xl font-bold text-[#ffd700] mb-2">
                  Maximum Milestone Reached!
                </h3>
                <p className="text-sm text-[#ffd700]/70 mb-4">
                  You've conquered all {MILESTONES.length} milestones. Your dedication is truly immortal!
                </p>
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#ffd700]" />
                  <span className="text-lg font-bold text-[#ffd700]">
                    {currentStreak} Days & Counting
                  </span>
                  <Sparkles className="w-5 h-5 text-[#ffd700]" />
                </div>
              </motion.div>
            ) : (
              <motion.div variants={itemVariants}>
                <h3 className={cn(
                  "text-sm font-semibold uppercase tracking-wider mb-3",
                  isLegendary ? "text-[#ffd700]/70" : "text-zinc-400"
                )}>
                  Milestones
                </h3>
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-white/10" />

                  {/* Timeline progress */}
                  <motion.div
                    className={cn(
                      "absolute left-6 top-0 w-0.5",
                      isLegendary
                        ? "bg-gradient-to-b from-[#ffd700] via-[#d4af37] to-[#f4d03f]"
                        : "bg-gradient-to-b from-[#d4af37] to-[#f4d03f]"
                    )}
                    initial={{ height: 0 }}
                    animate={{ height: `${(currentStreak / 1000) * 100}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />

                  {/* Milestone items */}
                  <div className="space-y-4 relative max-h-[400px] overflow-y-auto pr-2">
                    {MILESTONES.map((milestone, index) => (
                      <MilestoneItem
                        key={milestone.days}
                        milestone={milestone}
                        currentStreak={currentStreak}
                        isLast={index === MILESTONES.length - 1}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Bonus Calculation Breakdown */}
            <motion.div
              variants={itemVariants}
              className="p-4 rounded-xl bg-black/60 border border-[#d4af37]/40"
            >
              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                Daily Bonus Calculation
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-300">Base reward:</span>
                  <span className="text-white font-medium">{DAILY_BASE_BONUS} chips</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-300">Streak bonus:</span>
                  <span className="text-[#f4d03f] font-medium">
                    +{streakBonus} chips
                  </span>
                </div>
                <div className="h-px bg-white/10 my-2" />
                <div className="flex justify-between">
                  <span className="text-white font-semibold">Total:</span>
                  <span className="text-[#f4d03f] font-bold text-lg">
                    {nextBonusAmount} chips
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Next Claim Info */}
            <motion.div
              variants={itemVariants}
              className="p-4 rounded-xl bg-gradient-to-r from-[#d4af37]/5 to-[#f4d03f]/5 border border-[#d4af37]/20"
            >
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-[#d4af37]" />
                <span className="text-sm font-semibold text-white">Next Claim</span>
              </div>
              <p className="text-xs text-zinc-400">
                {canClaim
                  ? "Available now!"
                  : `Available ${formatRelativeTime(nextClaimAt)}`}
              </p>
            </motion.div>

            {/* Tips Section */}
            <motion.div
              variants={itemVariants}
              className="p-4 rounded-xl bg-white/5 border border-white/10"
            >
              <div className="flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-[#f4d03f] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-white mb-1">Pro Tip</p>
                  <p className="text-xs text-zinc-400">
                    Log in daily to build your streak! Miss a day and it resets to 0.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
      </Sheet>
    );
  }
