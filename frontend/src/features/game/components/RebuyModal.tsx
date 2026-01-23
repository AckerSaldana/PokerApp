import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Coins } from 'lucide-react';
import { cn, formatChips } from '@/lib/utils';
import { ChipStack3D } from './ChipStack3D';

interface RebuyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (amount: number) => void;
  balance: number;
  isPending: boolean;
}

export function RebuyModal({ isOpen, onClose, onConfirm, balance, isPending }: RebuyModalProps) {
  const [amount, setAmount] = useState(0);

  const presets = [10, 25, 50, 100];

  const handleConfirm = () => {
    if (amount > 0 && amount <= balance) {
      onConfirm(amount);
    }
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
            className="fixed bottom-0 left-0 right-0 z-[9999] transform-gpu p-6 pb-28 bg-zinc-900 rounded-t-3xl border-t border-zinc-800"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Rebuy</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition-colors"
              >
                <X className="w-5 h-5 text-zinc-400" />
              </button>
            </div>

            {/* Chip Stack Visualization */}
            <ChipStack3D amount={amount} className="mb-4" />

            {/* Balance */}
            <div className="flex items-center justify-between mb-4 text-sm">
              <span className="text-zinc-400">Your Balance</span>
              <span className="text-white font-medium">{formatChips(balance)}</span>
            </div>

            {/* Presets */}
            <div className="flex gap-2 mb-4">
              {presets.map((preset) => (
                <button
                  key={preset}
                  onClick={() => setAmount(preset)}
                  disabled={preset > balance}
                  className={cn(
                    'flex-1 py-3 rounded-xl font-medium transition-colors',
                    amount === preset
                      ? 'bg-emerald-600 text-white'
                      : preset > balance
                      ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  )}
                >
                  ${preset}
                </button>
              ))}
            </div>

            {/* Custom input */}
            <div className="relative mb-6">
              <Coins className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                type="number"
                value={amount || ''}
                onChange={(e) => setAmount(Math.max(0, parseInt(e.target.value) || 0))}
                placeholder="Custom amount"
                className={cn(
                  'w-full py-4 pl-12 pr-4 rounded-xl',
                  'bg-zinc-800 border border-zinc-700',
                  'text-white text-lg placeholder-zinc-500',
                  'focus:outline-none focus:border-emerald-500'
                )}
              />
            </div>

            {/* Confirm button */}
            <button
              onClick={handleConfirm}
              disabled={isPending || amount <= 0 || amount > balance}
              className={cn(
                'w-full py-4 rounded-xl font-semibold transition-colors',
                amount <= 0 || amount > balance
                  ? 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
                  : 'bg-emerald-600 text-white hover:bg-emerald-500'
              )}
            >
              {isPending ? 'Processing...' : `Add ${formatChips(amount)}`}
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
