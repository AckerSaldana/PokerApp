import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { balanceApi } from '@/services/api/balance';
import { formatChips } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';
import { ChipBackground3D } from '@/components/effects/ChipBackground3D';
import { CountingNumber } from '@/components/ui/AnimatedNumber';

export function ChipBalanceCard() {
  const { data, isLoading } = useQuery({
    queryKey: ['balance'],
    queryFn: balanceApi.getBalance,
    staleTime: 30_000,
  });

  if (isLoading) {
    return (
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900/90 via-emerald-800/80 to-teal-900/90 p-8 h-[360px]">
        <Skeleton className="h-4 w-24 mb-4 bg-emerald-700/30" />
        <Skeleton className="h-14 w-48 mb-3 bg-emerald-700/30" />
        <Skeleton className="h-4 w-32 bg-emerald-700/30" />
      </div>
    );
  }

  return (
    <motion.div
      className="relative overflow-hidden rounded-3xl border border-white/10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {/* Clean gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#021a12] via-[var(--color-emerald-950)] to-[#051f1a]" />

      {/* Subtle felt texture */}
      <div className="absolute inset-0 felt-texture opacity-15" />

      {/* 3D Chip Background - casino table aesthetic */}
      <ChipBackground3D opacity={0.2} />

      {/* Content */}
      <div className="relative p-8 z-10 min-h-[360px] flex flex-col">
        {/* Main Balance Display */}
        <div className="flex-1 flex flex-col items-center justify-center">
          {/* Balance number */}
          <AnimatePresence mode="wait">
            <motion.div
              key={data?.balance}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="flex flex-col items-center"
            >
              <span className="text-6xl font-display font-bold text-white tracking-tight">
                <CountingNumber
                  value={data?.balance || 0}
                  duration={0.8}
                  formatFn={(v) => formatChips(v)}
                />
              </span>

              <span className="text-sm font-medium text-[var(--color-gold-400)] uppercase tracking-[0.2em] mt-2">
                balance
              </span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Action Buttons */}
        <motion.div
          className="grid grid-cols-2 gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          {/* Transfer Button */}
          <Link to="/transfer">
            <motion.div
              className="group relative rounded-xl bg-gradient-to-r from-[var(--color-gold-500)] to-[var(--color-gold-400)] p-[1px]"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.15 }}
            >
              <div className="h-full bg-[#1a1207] rounded-[11px] px-5 py-3.5 flex items-center justify-center gap-2">
                <ArrowUpRight className="w-4 h-4 text-[var(--color-gold-400)]" />
                <span className="font-semibold text-[var(--color-gold-100)] text-sm">Transfer</span>
              </div>
            </motion.div>
          </Link>

          {/* History Button */}
          <Link to="/history">
            <motion.div
              className="group rounded-xl bg-white/5 border border-white/10 px-5 py-3.5 flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.08)' }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.15 }}
            >
              <Clock className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors duration-200" />
              <span className="font-semibold text-zinc-400 group-hover:text-white transition-colors duration-200 text-sm">History</span>
            </motion.div>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}
