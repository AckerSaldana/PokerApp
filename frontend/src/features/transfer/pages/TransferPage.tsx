import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, Send, History, Trophy } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { usersApi } from '@/services/api/users';
import { transferApi } from '@/services/api/transfer';
import { useAuthStore } from '@/stores/authStore';
import { formatChips, cn } from '@/lib/utils';
import { pageTransition, successPop } from '@/components/animations/variants';
import { TransferLeaderboard } from '../components/TransferLeaderboard';
import { TransferHistoryWithUser } from '../components/TransferHistoryWithUser';
import type { User } from '@/lib/types';

type TabType = 'send' | 'history' | 'leaderboard';

const tabs: { label: string; value: TabType; icon: React.ReactNode }[] = [
  { label: 'Send', value: 'send', icon: <Send className="w-4 h-4" /> },
  { label: 'History', value: 'history', icon: <History className="w-4 h-4" /> },
  { label: 'Leaderboard', value: 'leaderboard', icon: <Trophy className="w-4 h-4" /> },
];

const presetAmounts = [10, 25, 50, 75, 100];

export function TransferPage() {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState<TabType>('send');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [amount, setAmount] = useState(10);
  const [note, setNote] = useState('');
  const [success, setSuccess] = useState(false);

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.getAll,
  });

  const transferMutation = useMutation({
    mutationFn: transferApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setSelectedUser(null);
        setAmount(10);
        setNote('');
      }, 2000);
    },
  });

  const otherUsers = users?.filter((u) => u.id !== currentUser?.id) || [];

  const handleTransfer = () => {
    if (!selectedUser) return;
    transferMutation.mutate({
      receiverId: selectedUser.id,
      amount,
      note: note || undefined,
    });
  };

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="pb-20"
    >
      <PageHeader title="Transfers" subtitle="Manage your chips" />

      <div className="px-6 space-y-8">
        {/* Premium tab navigation with animated pill */}
        <div className="relative flex gap-1 p-1.5 bg-[var(--bg-surface-elevated)] backdrop-blur-xl rounded-2xl border border-[var(--glass-border)] shadow-lg shadow-black/20">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                'relative z-10 flex-1 flex items-center justify-center gap-2',
                'py-3 px-4 rounded-xl text-sm font-medium transition-colors duration-200',
                activeTab === tab.value ? 'text-[var(--color-gold-100)]' : 'text-[var(--text-secondary)] hover:text-white'
              )}
            >
              {activeTab === tab.value && (
                <motion.div
                  layoutId="activeTransferTab"
                  className="absolute inset-0 bg-gradient-to-r from-[var(--color-emerald-800)] to-[var(--color-emerald-600)] rounded-xl border border-[var(--color-emerald-500)]/30 shadow-[0_4px_12px_rgba(5,150,105,0.3)]"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <motion.span
                className="relative z-10"
                animate={{ scale: activeTab === tab.value ? 1.1 : 1 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                {tab.icon}
              </motion.span>
              <span className="relative z-10 font-display tracking-wide">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          {activeTab === 'send' && (
            <motion.div
              key="send"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Premium success animation with particles */}
              <AnimatePresence>
                {success && (
                  <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {/* Backdrop with blur */}
                    <div className="absolute inset-0 bg-zinc-950/95 backdrop-blur-xl" />

                    {/* Falling chip particles */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      {Array.from({ length: 15 }).map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-4 h-4 rounded-full bg-gradient-to-br from-amber-400 to-amber-600"
                          initial={{
                            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 400),
                            y: -20,
                            rotate: 0,
                            opacity: 1
                          }}
                          animate={{
                            y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 20,
                            rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
                            opacity: 0
                          }}
                          transition={{
                            duration: 2 + Math.random(),
                            delay: Math.random() * 0.5,
                            ease: 'easeIn'
                          }}
                        />
                      ))}
                    </div>

                    {/* Success content */}
                    <motion.div
                      className="relative flex flex-col items-center"
                      variants={successPop}
                      initial="initial"
                      animate="animate"
                    >
                      <motion.div
                        className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-emerald-600
                                   rounded-full flex items-center justify-center mb-6
                                   shadow-2xl shadow-emerald-500/50"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                      >
                        <Check className="w-12 h-12 text-white" />
                      </motion.div>

                      <motion.p
                        className="text-white text-2xl font-bold"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        Transfer Sent!
                      </motion.p>

                      <motion.p
                        className="text-emerald-400 text-lg mt-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                      >
                        {amount} chips to {selectedUser?.username}
                      </motion.p>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Enhanced user selection */}
              <div>
                <p className="text-sm text-zinc-400 mb-3 uppercase tracking-wider">Select recipient</p>
                <div className="grid grid-cols-4 gap-3">
                  {otherUsers.map((user, i) => (
                    <motion.button
                      key={user.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => setSelectedUser(user)}
                      className={cn(
                        'relative flex flex-col items-center p-4 rounded-2xl',
                        'border-2 transition-all duration-300',
                        'backdrop-blur-sm',
                        selectedUser?.id === user.id
                          ? 'bg-emerald-600/20 border-emerald-500 shadow-lg shadow-emerald-500/20'
                          : 'bg-zinc-900/50 border-zinc-800/50 hover:border-zinc-700'
                      )}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {/* Selection checkmark */}
                      <AnimatePresence>
                        {selectedUser?.id === user.id && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full
                                       flex items-center justify-center shadow-lg"
                          >
                            <Check className="w-4 h-4 text-white" />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <Avatar
                        name={user.username}
                        size="lg"
                        className={cn(selectedUser?.id === user.id && 'ring-2 ring-emerald-500')}
                      />
                      <p className="text-xs text-white mt-2 truncate w-full text-center font-medium">
                        {user.username}
                      </p>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Premium amount slider */}
              <Card variant="premium" className="p-8 relative overflow-visible">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--color-emerald-950)] px-4 py-1 rounded-full border border-[var(--color-emerald-500)]/30 shadow-lg">
                    <span className="text-[10px] text-[var(--color-emerald-400)] uppercase tracking-widest font-bold">Amount to Send</span>
                </div>

                {/* Large animated number */}
                <motion.div
                  className="text-center mb-10 mt-2"
                  key={amount}
                  initial={{ scale: 0.8, opacity: 0, filter: 'blur(10px)' }}
                  animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                >
                  <span className="text-7xl font-display font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] tabular-nums">
                    {amount}
                  </span>
                  <span className="text-xl text-[var(--color-gold-400)] ml-2 font-medium">chips</span>
                </motion.div>

                {/* Custom styled range slider */}
                <div className="relative mb-8 px-2">
                  {/* Track background */}
                  <div className="h-4 bg-[var(--bg-surface)] rounded-full overflow-hidden border border-[var(--glass-border)] shadow-inner">
                    {/* Filled portion with gradient */}
                    <motion.div
                      className="h-full bg-gradient-to-r from-[var(--color-emerald-600)] to-[var(--color-emerald-400)] relative"
                      style={{ width: `${amount}%` }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    > 
                         <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/50 blur-[2px]" />
                    </motion.div>
                  </div>

                  {/* Invisible range input */}
                  <input
                    type="range"
                    min={1}
                    max={100}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />

                  {/* Custom thumb indicator */}
                  <motion.div
                    className="absolute top-1/2 -translate-y-1/2 w-8 h-8 pointer-events-none
                               bg-gradient-to-b from-white to-zinc-300
                               rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.5)]
                               flex items-center justify-center border-2 border-white"
                    style={{ left: `calc(${amount}% - 16px)` }}
                  >
                    <div className="w-2.5 h-2.5 bg-[var(--color-emerald-500)] rounded-full shadow-inner" />
                  </motion.div>
                </div>

                {/* Preset amount buttons */}
                <div className="flex justify-between gap-2">
                  {presetAmounts.map((preset) => (
                    <motion.button
                      key={preset}
                      onClick={() => setAmount(preset)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        'flex-1 py-2.5 rounded-xl text-sm font-bold transition-all border font-display tracking-wide',
                        amount === preset
                          ? 'bg-[var(--color-gold-500)] border-[var(--color-gold-400)] text-amber-950 shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                          : 'bg-white/5 border-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'
                      )}
                    >
                      {preset}
                    </motion.button>
                  ))}
                </div>
              </Card>

              {/* Note input */}
              <Input
                label="Message"
                placeholder="Add a friendly note..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={200}
                className="bg-[var(--bg-surface)] border-[var(--glass-border)] focus:border-[var(--color-gold-500)]/50 transition-all font-display"
              />

              {/* Send button */}
              <Button
                variant="gold"
                className="w-full h-14 text-lg shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                size="lg"
                disabled={!selectedUser}
                isLoading={transferMutation.isPending}
                onClick={handleTransfer}
                leftIcon={<Send className="w-5 h-5" />}
              >
                Send {formatChips(amount)} Chips
                {selectedUser && ` to ${selectedUser.username}`}
              </Button>

              {transferMutation.isError && (
                <p className="text-red-500 text-sm text-center">
                  {(transferMutation.error as Error).message || 'Transfer failed'}
                </p>
              )}
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <TransferHistoryWithUser />
            </motion.div>
          )}

          {activeTab === 'leaderboard' && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <TransferLeaderboard />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
