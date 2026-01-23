import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, ArrowDownLeft, X } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { SkeletonListItem } from '@/components/ui/Skeleton';
import { formatChips, cn } from '@/lib/utils';
import { usersApi } from '@/services/api/users';
import { transferApi } from '@/services/api/transfer';
import { useAuthStore } from '@/stores/authStore';
import type { User, Transfer } from '@/lib/types';

function TransferItem({ transfer, currentUserId }: { transfer: Transfer; currentUserId: string }) {
  const isSender = transfer.senderId === currentUserId;
  const otherUser = isSender ? transfer.receiver : transfer.sender;

  return (
    <motion.div
      className="flex items-center gap-3 p-3 bg-[var(--bg-surface)] border border-[var(--glass-border)] rounded-xl group hover:bg-[var(--bg-surface-elevated)] transition-colors"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className={cn(
        'w-10 h-10 rounded-full flex items-center justify-center border',
        isSender 
          ? 'bg-red-500/10 border-red-500/20 text-red-400' 
          : 'bg-[var(--color-emerald-500)]/10 border-[var(--color-emerald-500)]/20 text-[var(--color-emerald-400)]'
      )}>
        {isSender ? (
          <ArrowUpRight className="w-5 h-5" />
        ) : (
          <ArrowDownLeft className="w-5 h-5" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm text-white">
          {isSender ? 'Sent to' : 'Received from'} <span className="font-semibold text-[var(--color-gold-100)]">{otherUser.username}</span>
        </p>
        {transfer.note && (
          <p className="text-xs text-[var(--text-secondary)] truncate italic">"{transfer.note}"</p>
        )}
        <p className="text-[10px] text-[var(--text-muted)] mt-0.5 uppercase tracking-wide">
          {new Date(transfer.createdAt).toLocaleDateString()}
        </p>
      </div>

      <div className="text-right">
        <p className={cn(
          'font-bold tabular-nums text-base font-display',
          isSender ? 'text-red-400' : 'text-[var(--color-emerald-400)]'
        )}>
          {isSender ? '-' : '+'}{formatChips(transfer.amount)}
        </p>
      </div>
    </motion.div>
  );
}

export function TransferHistoryWithUser() {
  const currentUser = useAuthStore((state) => state.user);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.getAll,
  });

  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ['transfer-history', selectedUser?.id],
    queryFn: () => transferApi.getBetweenUsers(selectedUser!.id),
    enabled: !!selectedUser,
    staleTime: 30_000,
  });

  const otherUsers = users?.filter((u) => u.id !== currentUser?.id) || [];

  return (
    <div className="space-y-6">
      {/* User selection */}
      <div>
        <p className="text-xs text-[var(--text-secondary)] mb-3 uppercase tracking-widest font-semibold pl-1">Select Player</p>
        <div className="grid grid-cols-4 gap-3">
          {otherUsers.map((user) => (
            <motion.button
              key={user.id}
              onClick={() => setSelectedUser(user)}
              className={cn(
                'flex flex-col items-center p-3 rounded-2xl border transition-all duration-300',
                selectedUser?.id === user.id
                  ? 'bg-[var(--color-emerald-900)]/50 border-[var(--color-emerald-500)] shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                  : 'bg-[var(--bg-surface)] border-[var(--glass-border)] hover:border-[var(--glass-border-gold)] group'
              )}
              whileTap={{ scale: 0.95 }}
            >
              <Avatar src={user.avatarData || undefined} name={user.username} size="lg" className={cn("transition-transform group-hover:scale-110", selectedUser?.id === user.id && "ring-2 ring-[var(--color-emerald-500)] ring-offset-2 ring-offset-black")} />
              <p className={cn(
                "text-xs mt-2 truncate w-full text-center font-medium transition-colors",
                selectedUser?.id === user.id ? "text-[var(--color-emerald-400)]" : "text-[var(--text-secondary)] group-hover:text-white"
              )}>
                {user.username}
              </p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Transfer history */}
      <AnimatePresence mode="wait">
        {selectedUser && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {/* Summary card */}
            {historyData && !historyLoading && (
              <Card variant="premium" className="p-5 mb-6 relative overflow-visible">
                <div className="absolute -top-3 left-0 right-0 flex justify-center">
                    <div className="bg-[var(--color-emerald-950)] px-3 py-1 rounded-full border border-[var(--color-emerald-500)]/30 text-[10px] uppercase tracking-widest text-[var(--color-emerald-400)] font-bold shadow-lg">
                        LIFETIME STATS
                    </div>
                </div>

                <div className="flex items-center justify-between mb-6 border-b border-[var(--glass-border)] pb-4">
                  <div className="flex items-center gap-4">
                    <Avatar src={currentUser?.avatarData || undefined} name={currentUser?.username || ''} size="sm" className="ring-1 ring-white/20" />
                    <div className="h-px flex-1 w-12 bg-gradient-to-r from-transparent via-[var(--color-gold-500)]/50 to-transparent relative">
                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--color-gold-500)] w-1.5 h-1.5 rounded-full shadow-[0_0_5px_var(--color-gold-500)]" />
                    </div>
                    <Avatar src={selectedUser.avatarData || undefined} name={selectedUser.username} size="sm" className="ring-1 ring-white/20" />
                  </div>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="p-2 bg-white/5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center divide-x divide-white/5">
                  <div>
                    <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider mb-1">Sent</p>
                    <p className="text-lg font-bold font-display text-red-400 tabular-nums">
                      {formatChips(historyData.summary.user1TotalSent)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider mb-1">Received</p>
                    <p className="text-lg font-bold font-display text-[var(--color-emerald-400)] tabular-nums">
                      {formatChips(historyData.summary.user2TotalSent)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider mb-1">Net</p>
                    <p className={cn(
                      'text-lg font-bold font-display tabular-nums',
                      historyData.summary.netBalance >= 0 ? 'text-[var(--color-gold-400)]' : 'text-red-400'
                    )}>
                      {historyData.summary.netBalance >= 0 ? '+' : ''}
                      {formatChips(historyData.summary.netBalance)}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Transfer list */}
            {historyLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <SkeletonListItem key={i} />
                ))}
              </div>
            ) : historyData?.transfers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-zinc-500">No transfers with {selectedUser.username}</p>
                <p className="text-zinc-600 text-sm mt-1">
                  Send some chips to start the history!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {historyData?.transfers.map((transfer) => (
                  <TransferItem
                    key={transfer.id}
                    transfer={transfer}
                    currentUserId={currentUser?.id || ''}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
