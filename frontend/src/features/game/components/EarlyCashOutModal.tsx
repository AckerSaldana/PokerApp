import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Coins, AlertCircle } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { cn, formatChips } from '@/lib/utils';
import type { GameParticipant } from '@/lib/types';

interface EarlyCashOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (amount: number) => void;
  participant: GameParticipant | null;
  availablePot: number;
  isPending: boolean;
}

export function EarlyCashOutModal({
  isOpen,
  onClose,
  onConfirm,
  participant,
  availablePot,
  isPending,
}: EarlyCashOutModalProps) {
  const [amount, setAmount] = useState(0);

  // Reset amount when participant changes
  useEffect(() => {
    if (participant) {
      setAmount(0);
    }
  }, [participant]);

  if (!participant) return null;

  const netResult = amount - participant.buyIn;
  const isValid = amount >= 0 && amount <= availablePot;

  const handleConfirm = () => {
    if (isValid) {
      onConfirm(amount);
    }
  };

  // Presets: 0 (bust), their buy-in (break even)
  const presets = [
    { label: 'Bust ($0)', value: 0 },
    { label: `Even ($${participant.buyIn})`, value: participant.buyIn },
  ];

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
            className="fixed bottom-0 left-0 right-0 z-[9999] transform-gpu p-6 pb-28 bg-zinc-900 rounded-t-3xl border-t border-zinc-800"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Cash Out Player</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition-colors"
              >
                <X className="w-5 h-5 text-zinc-400" />
              </button>
            </div>

            {/* Player Info */}
            <div className="flex items-center gap-3 p-4 bg-zinc-800/50 rounded-xl mb-4">
              <Avatar src={participant.user.avatarData || undefined} name={participant.user.username} size="md" />
              <div>
                <p className="font-semibold text-white">
                  {participant.user.username}
                </p>
                <p className="text-sm text-zinc-500">
                  Buy-in: {formatChips(participant.buyIn)}
                </p>
              </div>
            </div>

            {/* Available Pot */}
            <div className="flex items-center justify-between mb-4 text-sm p-3 bg-zinc-800/50 rounded-xl">
              <span className="text-zinc-400">Available in Pot</span>
              <span className="text-emerald-400 font-medium">
                {formatChips(availablePot)}
              </span>
            </div>

            {/* Presets */}
            <div className="flex gap-2 mb-4">
              {presets.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => setAmount(preset.value)}
                  disabled={preset.value > availablePot}
                  className={cn(
                    'flex-1 py-3 rounded-xl font-medium transition-colors',
                    amount === preset.value
                      ? 'bg-emerald-600 text-white'
                      : preset.value > availablePot
                      ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Custom Input */}
            <div className="relative mb-4">
              <Coins className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                type="number"
                value={amount || ''}
                onChange={(e) =>
                  setAmount(Math.max(0, parseInt(e.target.value) || 0))
                }
                placeholder="Cash-out amount"
                className={cn(
                  'w-full py-4 pl-12 pr-4 rounded-xl',
                  'bg-zinc-800 border border-zinc-700',
                  'text-white text-lg placeholder-zinc-500',
                  'focus:outline-none focus:border-emerald-500'
                )}
              />
            </div>

            {/* Net Result Preview */}
            <div className="flex items-center justify-between mb-4 text-sm">
              <span className="text-zinc-400">Net Result</span>
              <span
                className={cn(
                  'font-medium',
                  netResult >= 0 ? 'text-emerald-400' : 'text-red-400'
                )}
              >
                {netResult >= 0 ? '+' : ''}
                {formatChips(netResult)}
              </span>
            </div>

            {/* Validation Warning */}
            {amount > availablePot && (
              <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/30 rounded-xl mb-4">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-400 text-sm">
                  Amount exceeds available pot ({formatChips(availablePot)})
                </p>
              </div>
            )}

            {/* Confirm Button */}
            <button
              onClick={handleConfirm}
              disabled={isPending || !isValid}
              className={cn(
                'w-full py-4 rounded-xl font-semibold transition-colors',
                !isValid
                  ? 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
                  : 'bg-emerald-600 text-white hover:bg-emerald-500'
              )}
            >
              {isPending
                ? 'Processing...'
                : `Cash Out ${formatChips(amount)}`}
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
