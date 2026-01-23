import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { X, AlertCircle, Check, CheckCircle } from 'lucide-react';
import { gamesApi } from '@/services/api/games';
import { Avatar } from '@/components/ui/Avatar';
import { cn, formatChips } from '@/lib/utils';
import type { GameSession } from '@/lib/types';

interface CloseGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  game: GameSession;
  onSuccess: () => void;
}

export function CloseGameModal({ isOpen, onClose, game, onSuccess }: CloseGameModalProps) {
  // Separate active participants from those who already cashed out
  const { activeParticipants, cashedOutParticipants } = useMemo(() => {
    const active = game.participants.filter((p) => !p.cashedOutAt);
    const cashedOut = game.participants.filter((p) => p.cashedOutAt);
    return { activeParticipants: active, cashedOutParticipants: cashedOut };
  }, [game.participants]);

  // Initialize cash-outs only for active participants
  const [cashOuts, setCashOuts] = useState<Record<string, number>>(() =>
    Object.fromEntries(activeParticipants.map((p) => [p.userId, 0]))
  );

  const closeMutation = useMutation({
    mutationFn: () => {
      // Only send results for active participants
      const results = Object.entries(cashOuts).map(([userId, cashOut]) => ({
        userId,
        cashOut,
      }));
      return gamesApi.close(game.id, results);
    },
    onSuccess,
  });

  // Calculate pot breakdown
  const totalBuyIns = useMemo(
    () => game.participants.reduce((sum, p) => sum + p.buyIn, 0),
    [game.participants]
  );

  const totalEarlyCashOuts = useMemo(
    () => cashedOutParticipants.reduce((sum, p) => sum + p.cashOut, 0),
    [cashedOutParticipants]
  );

  const remainingPot = totalBuyIns - totalEarlyCashOuts;

  const totalClosingCashOuts = useMemo(
    () => Object.values(cashOuts).reduce((sum, val) => sum + val, 0),
    [cashOuts]
  );

  // Validation: closing cash-outs must equal remaining pot
  const isBalanced = totalClosingCashOuts === remainingPot;
  const difference = totalClosingCashOuts - remainingPot;

  const handleCashOutChange = (userId: string, value: string) => {
    const numValue = Math.max(0, parseInt(value) || 0);
    setCashOuts((prev) => ({ ...prev, [userId]: numValue }));
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] transform-gpu"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-0 left-0 right-0 z-[9999] transform-gpu max-h-[90vh] flex flex-col bg-zinc-900 rounded-t-3xl border-t border-zinc-800"
          >
            {/* Header - sticky */}
            <div className="flex items-center justify-between p-6 pb-4 flex-shrink-0">
              <h2 className="text-xl font-bold text-white">End Game</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition-colors"
              >
                <X className="w-5 h-5 text-zinc-400" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-6 min-h-0">

              {/* Pot Breakdown Summary */}
              <div className="bg-zinc-800/50 rounded-xl p-4 mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-zinc-400">Total Buy-ins</span>
                  <span className="text-white font-medium">{formatChips(totalBuyIns)}</span>
                </div>
                {totalEarlyCashOuts > 0 && (
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-zinc-400">Early Cash-outs</span>
                    <span className="text-amber-400 font-medium">
                      -{formatChips(totalEarlyCashOuts)}
                    </span>
                  </div>
                )}
                <div className="h-px bg-zinc-700 my-2" />
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-zinc-400">Remaining Pot</span>
                  <span className="text-emerald-400 font-bold">{formatChips(remainingPot)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Closing Cash-outs</span>
                  <span className="text-white font-medium">
                    {formatChips(totalClosingCashOuts)}
                  </span>
                </div>
                <div className="h-px bg-zinc-700 my-2" />
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Difference</span>
                  <span
                    className={cn(
                      'font-medium',
                      isBalanced
                        ? 'text-emerald-400'
                        : difference > 0
                        ? 'text-red-400'
                        : 'text-amber-400'
                    )}
                  >
                    {difference > 0 ? '+' : ''}
                    {formatChips(difference)}
                    {isBalanced && <Check className="inline w-4 h-4 ml-1" />}
                  </span>
                </div>
              </div>

              {/* Warning if not balanced */}
              {!isBalanced && (
                <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl mb-6">
                  <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-amber-400 text-sm">
                    Cash-outs must equal the remaining pot ({formatChips(remainingPot)}).
                  </p>
                </div>
              )}

              {/* Already Cashed Out Players (read-only) */}
              {cashedOutParticipants.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">
                    Already Cashed Out
                  </h3>
                  <div className="space-y-2">
                    {cashedOutParticipants.map((participant) => (
                      <div
                        key={participant.id}
                        className="flex items-center gap-3 p-3 bg-zinc-800/30 rounded-xl border border-zinc-700/50 opacity-70"
                      >
                        <Avatar src={participant.user.avatarData || undefined} name={participant.user.username} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-zinc-400 truncate">
                            {participant.user.username}
                          </p>
                          <p className="text-xs text-zinc-600">
                            Buy-in: {formatChips(participant.buyIn)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                          <span className="text-zinc-400 font-medium">
                            {formatChips(participant.cashOut)}
                          </span>
                          <span
                            className={cn(
                              'text-sm font-medium tabular-nums ml-2',
                              participant.netResult >= 0 ? 'text-emerald-400' : 'text-red-400'
                            )}
                          >
                            {participant.netResult >= 0 ? '+' : ''}
                            {formatChips(participant.netResult)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Active Players - need cash-out input */}
              <div className="mb-6">
                {cashedOutParticipants.length > 0 && (
                  <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">
                    Remaining Players
                  </h3>
                )}
                <div className="space-y-3">
                  {activeParticipants.map((participant) => {
                    const cashOut = cashOuts[participant.userId] || 0;
                    const netResult = cashOut - participant.buyIn;

                    return (
                      <div
                        key={participant.id}
                        className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10"
                      >
                        <Avatar src={participant.user.avatarData || undefined} name={participant.user.username} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white truncate">
                            {participant.user.username}
                          </p>
                          <p className="text-xs text-zinc-500">
                            Buy-in: {formatChips(participant.buyIn)}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <input
                            type="number"
                            value={cashOut || ''}
                            onChange={(e) => handleCashOutChange(participant.userId, e.target.value)}
                            placeholder="0"
                            className={cn(
                              'w-20 py-2 px-3 rounded-lg text-right',
                              'bg-zinc-800 border border-zinc-700',
                              'text-white placeholder-zinc-500',
                              'focus:outline-none focus:border-emerald-500'
                            )}
                          />
                          <div className="w-16 text-right">
                            <span
                              className={cn(
                                'text-sm font-medium tabular-nums',
                                netResult >= 0 ? 'text-emerald-400' : 'text-red-400'
                              )}
                            >
                              {netResult >= 0 ? '+' : ''}
                              {formatChips(netResult)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Confirm button - sticky bottom */}
            <div className="flex-shrink-0 p-6 pt-4 pb-8">
              <button
                onClick={() => closeMutation.mutate()}
                disabled={closeMutation.isPending || !isBalanced}
                className={cn(
                  'w-full py-4 rounded-xl font-semibold transition-colors',
                  !isBalanced
                    ? 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
                    : 'bg-emerald-600 text-white hover:bg-emerald-500'
                )}
              >
                {closeMutation.isPending ? 'Closing Game...' : 'Close Game'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
