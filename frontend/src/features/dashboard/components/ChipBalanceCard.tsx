import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, Clock, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { balanceApi } from '@/services/api/balance';
import { formatChips } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';
import { heroEntrance } from '@/components/animations/variants';

// Custom Poker Chip Icon
function PokerChipIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="3" fill="currentColor" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function ChipBalanceCard() {
  const { data, isLoading } = useQuery({
    queryKey: ['balance'],
    queryFn: balanceApi.getBalance,
    staleTime: 30_000,
  });

  if (isLoading) {
    return (
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-900/90 via-emerald-800/80 to-teal-900/90 p-8 h-[360px]">
        <Skeleton className="h-4 w-24 mb-4 bg-emerald-700/30" />
        <Skeleton className="h-14 w-48 mb-3 bg-emerald-700/30" />
        <Skeleton className="h-4 w-32 bg-emerald-700/30" />
      </div>
    );
  }

  // const nextBonus = data?.nextBonusAt ? new Date(data.nextBonusAt) : null;
  // const daysUntilBonus = nextBonus
  //   ? Math.ceil((nextBonus.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  //   : 7;

  return (
    <motion.div
      className="relative overflow-hidden rounded-[2rem] shadow-2xl shadow-emerald-900/50"
      variants={heroEntrance}
      initial="initial"
      animate="animate"
    >
      {/* Premium Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-emerald-950)] via-[var(--color-emerald-900)] to-[var(--color-emerald-950)]" />

      {/* Subtle Noise Texture */}
      <div className="absolute inset-0 felt-texture opacity-30" />

      {/* Gold Rim Effect */}
      <div className="absolute inset-0 rounded-[2rem] border border-[var(--color-gold-500)]/20 pointer-events-none" />
      <div className="absolute -inset-1 rounded-[2.2rem] bg-gradient-to-b from-[var(--color-gold-400)]/10 to-transparent blur-md pointer-events-none" />

      {/* Background Animated Chips */}
      <motion.div
        className="absolute -right-8 -top-8 w-40 h-40 text-[var(--color-emerald-800)]/20"
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
      >
        <PokerChipIcon className="w-full h-full" />
      </motion.div>

      {/* Content */}
      <div className="relative p-8 z-10">
        <div className="flex justify-between items-start mb-6">
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[var(--color-gold-600)] to-[var(--color-gold-300)] p-0.5 shadow-lg shadow-amber-900/20">
              <div className="w-full h-full rounded-full bg-[var(--color-emerald-950)] flex items-center justify-center">
                <PokerChipIcon className="w-6 h-6 text-[var(--color-gold-400)]" />
              </div>
            </div>
            <div>
              <p className="text-[var(--text-secondary)] text-xs uppercase tracking-widest font-semibold">Total Balance</p>
              <p className="text-[var(--color-gold-500)] text-xs font-medium">Digital Wallet</p>
            </div>
          </motion.div>

          {data?.weeksAdded && data.weeksAdded > 0 && (
            <motion.div
              className="px-3 py-1 rounded-full bg-[var(--color-gold-500)]/10 border border-[var(--color-gold-500)]/20 flex items-center gap-1.5"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Sparkles className="w-3 h-3 text-[var(--color-gold-400)]" />
              <span className="text-[var(--color-gold-300)] text-xs font-bold">+{data.bonusChips} Bonus</span>
            </motion.div>
          )}
        </div>

        {/* Main Balance */}
        <div className="mb-8 text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={data?.balance}
              initial={{ scale: 0.9, opacity: 0, filter: 'blur(10px)' }}
              animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
              exit={{ scale: 1.1, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="flex flex-col items-center"
            >
              <span className="text-6xl font-display font-bold text-white tracking-tight drop-shadow-xl">
                {formatChips(data?.balance || 0)}
              </span>
              <span className="text-sm font-medium text-[var(--color-gold-400)] uppercase tracking-widest mt-1">chips</span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-2 gap-3">
          <Link to="/transfer">
            <motion.div
              className="group relative overflow-hidden rounded-xl bg-gradient-to-b from-[var(--color-gold-500)] to-[var(--color-gold-600)] p-px shadow-lg shadow-amber-900/20"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="relative h-full bg-[var(--color-emerald-900)] rounded-[11px] p-3 flex items-center justify-center gap-2 group-hover:bg-opacity-90 transition-colors">
                <ArrowUpRight className="w-4 h-4 text-[var(--color-gold-400)]" />
                <span className="font-semibold text-[var(--color-gold-100)] text-sm">Transfer</span>
              </div>
            </motion.div>
          </Link>
          
          <Link to="/history">
            <motion.div
              className="group relative overflow-hidden rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--glass-border)] p-3 flex items-center justify-center gap-2 shadow-sm"
              whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.08)' }}
              whileTap={{ scale: 0.98 }}
            >
              <Clock className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-white transition-colors" />
              <span className="font-semibold text-[var(--text-secondary)] group-hover:text-white transition-colors text-sm">History</span>
            </motion.div>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
