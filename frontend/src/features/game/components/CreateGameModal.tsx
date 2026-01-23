import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Pencil, Coins } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CreateGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { name: string; blind: number }) => void;
  isPending: boolean;
}

export function CreateGameModal({ isOpen, onClose, onConfirm, isPending }: CreateGameModalProps) {
  const [name, setName] = useState('Poker Night');
  const [blind, setBlind] = useState(10);

  const blindPresets = [1, 2, 5, 10];

  const handleConfirm = () => {
    if (blind > 0) {
      onConfirm({ name: name.trim() || 'Poker Night', blind });
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
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">New Game</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition-colors"
              >
                <X className="w-5 h-5 text-zinc-400" />
              </button>
            </div>

            {/* Game Name Input */}
            <div className="mb-5">
              <label className="text-sm text-zinc-400 mb-2 block">Game Name</label>
              <div className="relative">
                <Pencil className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Poker Night"
                  maxLength={100}
                  className={cn(
                    'w-full py-4 pl-12 pr-4 rounded-xl',
                    'bg-zinc-800 border border-zinc-700',
                    'text-white text-lg placeholder-zinc-500',
                    'focus:outline-none focus:border-emerald-500'
                  )}
                />
              </div>
            </div>

            {/* Blind Selection */}
            <div className="mb-6">
              <label className="text-sm text-zinc-400 mb-2 block">
                Small Blind
                <span className="text-zinc-600 ml-2">(Big Blind: {blind * 2})</span>
              </label>

              {/* Presets */}
              <div className="flex gap-2 mb-3">
                {blindPresets.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setBlind(preset)}
                    className={cn(
                      'flex-1 py-3 rounded-xl font-medium transition-colors',
                      blind === preset
                        ? 'bg-emerald-600 text-white'
                        : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                    )}
                  >
                    {preset}
                  </button>
                ))}
              </div>

              {/* Custom input */}
              <div className="relative">
                <Coins className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type="number"
                  value={blind || ''}
                  onChange={(e) => setBlind(Math.max(1, parseInt(e.target.value) || 0))}
                  placeholder="Custom blind"
                  min={1}
                  className={cn(
                    'w-full py-4 pl-12 pr-4 rounded-xl',
                    'bg-zinc-800 border border-zinc-700',
                    'text-white text-lg placeholder-zinc-500',
                    'focus:outline-none focus:border-emerald-500'
                  )}
                />
              </div>
            </div>

            {/* Confirm button */}
            <button
              onClick={handleConfirm}
              disabled={isPending || blind <= 0}
              className={cn(
                'w-full py-4 rounded-xl font-semibold transition-colors',
                blind <= 0
                  ? 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
                  : 'bg-emerald-600 text-white hover:bg-emerald-500'
              )}
            >
              {isPending ? 'Creating...' : 'Start Game'}
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
