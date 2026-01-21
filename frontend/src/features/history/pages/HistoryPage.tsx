import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, ArrowDownLeft, History, Sparkles } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { balanceApi } from '@/services/api/balance';
import { formatChips, formatRelativeTime, cn } from '@/lib/utils';
import { SkeletonListItem } from '@/components/ui/Skeleton';
import { pageTransition, staggerDepth, staggerDepthItem } from '@/components/animations/variants';

export function HistoryPage() {

  const { data, isLoading } = useQuery({
    queryKey: ['history'],
    queryFn: () => balanceApi.getHistory(1, 50),
  });

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <PageHeader title="History" subtitle="Your chip transactions" />

      <div className="px-6">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <SkeletonListItem key={i} />
            ))}
          </div>
        ) : !data?.data || data.data.length === 0 ? (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <motion.div
              className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-zinc-800/50 flex items-center justify-center"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              <History className="w-8 h-8 text-zinc-600" />
            </motion.div>
            <p className="text-zinc-400 font-medium">No transactions yet</p>
            <p className="text-zinc-600 text-sm mt-1">
              Send or receive chips to see your history
            </p>
          </motion.div>
        ) : (
          <motion.div
            className="space-y-4"
            variants={staggerDepth}
            initial="initial"
            animate="animate"
          >
            {data.data.map((item) => {
              const isSent = item.type === 'sent';
              const otherUsername = item.otherUser.username;

              return (
                <motion.div key={item.id} variants={staggerDepthItem}>
                  <Card variant="glass" className="p-4 group hover:border-zinc-700/50 transition-all duration-300">
                    {/* Hover glow effect */}
                    <div className={cn(
                      'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl',
                      isSent
                        ? 'bg-gradient-to-br from-red-500/10 to-transparent'
                        : 'bg-gradient-to-br from-emerald-500/10 to-transparent'
                    )} />

                    <div className="relative flex items-center gap-4">
                      {/* Direction icon with animation */}
                      <motion.div
                        className={cn(
                          'w-11 h-11 rounded-xl flex items-center justify-center',
                          isSent ? 'bg-red-500/10' : 'bg-emerald-500/10'
                        )}
                        whileHover={{ scale: 1.1, rotate: isSent ? 45 : -45 }}
                        transition={{ type: 'spring', stiffness: 400 }}
                      >
                        {isSent ? (
                          <ArrowUpRight className="w-5 h-5 text-red-400" />
                        ) : (
                          <ArrowDownLeft className="w-5 h-5 text-emerald-400" />
                        )}
                      </motion.div>

                      {/* Avatar with ring */}
                      <div className="relative">
                        <Avatar
                          name={otherUsername}
                          size="md"
                          className={cn(
                            'ring-2 ring-offset-2 ring-offset-zinc-900',
                            isSent ? 'ring-red-500/30' : 'ring-emerald-500/30'
                          )}
                        />
                      </div>

                      {/* Transaction details */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white">
                          {isSent ? `Sent to ` : `Received from `}
                          <span className={cn(
                            'font-semibold',
                            isSent ? 'text-red-300' : 'text-emerald-300'
                          )}>
                            {otherUsername}
                          </span>
                        </p>
                        {item.note && (
                          <p className="text-sm text-zinc-400 truncate flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            {item.note}
                          </p>
                        )}
                        <p className="text-xs text-zinc-500 mt-0.5">
                          {formatRelativeTime(item.createdAt)}
                        </p>
                      </div>

                      {/* Amount with animation */}
                      <div className="text-right">
                        <motion.p
                          className={cn(
                            'text-lg font-bold tabular-nums',
                            isSent ? 'text-red-400' : 'text-emerald-400'
                          )}
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ type: 'spring', delay: 0.1 }}
                        >
                          {isSent ? '-' : '+'}{formatChips(item.amount)}
                        </motion.p>
                        <p className="text-xs text-zinc-500 uppercase tracking-wider">chips</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
