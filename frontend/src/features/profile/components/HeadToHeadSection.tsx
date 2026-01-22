import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownLeft, Scale } from 'lucide-react';
import { formatChips, cn } from '@/lib/utils';
import type { TransfersBetweenUsers } from '@/lib/types';

interface HeadToHeadSectionProps {
  data: TransfersBetweenUsers;
  otherUsername: string;
}

export function HeadToHeadSection({ data, otherUsername }: HeadToHeadSectionProps) {
  const { summary } = data;
  const netPositive = summary.netBalance >= 0;

  return (
    <div>
      <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-widest pl-1 mb-3">
        Head to Head with {otherUsername}
      </h3>

      <div className="space-y-2">
        {/* You sent to them */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="rounded-xl bg-white/5 border border-white/10 p-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-red-500/10">
                <ArrowUpRight className="w-4 h-4 text-red-400" />
              </div>
              <span className="text-zinc-400 text-sm">You sent</span>
            </div>
            <span className="text-lg font-display font-bold text-red-400 tabular-nums">
              -{formatChips(summary.user1TotalSent)}
            </span>
          </div>
        </motion.div>

        {/* They sent to you */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.05 }}
          className="rounded-xl bg-white/5 border border-white/10 p-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-emerald-500/10">
                <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="text-zinc-400 text-sm">You received</span>
            </div>
            <span className="text-lg font-display font-bold text-emerald-400 tabular-nums">
              +{formatChips(summary.user2TotalSent)}
            </span>
          </div>
        </motion.div>

        {/* Net balance */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.1 }}
          className={cn(
            'rounded-xl border p-3',
            netPositive
              ? 'bg-emerald-500/5 border-emerald-500/20'
              : 'bg-red-500/5 border-red-500/20'
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                'w-9 h-9 rounded-lg flex items-center justify-center',
                netPositive ? 'bg-emerald-500/10' : 'bg-red-500/10'
              )}>
                <Scale className={cn('w-4 h-4', netPositive ? 'text-emerald-400' : 'text-red-400')} />
              </div>
              <span className="text-zinc-300 text-sm font-medium">Net Balance</span>
            </div>
            <span className={cn(
              'text-xl font-display font-bold tabular-nums',
              netPositive ? 'text-emerald-400' : 'text-red-400'
            )}>
              {netPositive ? '+' : ''}{formatChips(summary.netBalance)}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Total transfers count */}
      <p className="text-xs text-zinc-500 text-center mt-3">
        {data.total} total transfers between you
      </p>
    </div>
  );
}
