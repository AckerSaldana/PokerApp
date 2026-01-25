import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Sparkles } from 'lucide-react';
import { balanceApi } from '@/services/api/balance';
import { cn } from '@/lib/utils';

interface LuckySpinModalProps {
  isOpen: boolean;
  onClose: () => void;
  canSpin: boolean;
}

const REEL_VALUES = [0, 5, 10, 15, 20, 25, 30, 40, 50, 75, 100];
const SPIN_DURATION = 3000;

function SlotReel({
  finalValue,
  isSpinning,
  delay
}: {
  finalValue: number;
  isSpinning: boolean;
  delay: number;
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const [spinning, setSpinning] = useState(false);

  useEffect(() => {
    if (!isSpinning) {
      setDisplayValue(finalValue);
      return;
    }

    setSpinning(true);
    const startTime = Date.now();
    const spinTime = SPIN_DURATION + delay;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;

      if (elapsed < spinTime - 500) {
        // Fast random cycling
        setDisplayValue(REEL_VALUES[Math.floor(Math.random() * REEL_VALUES.length)]);
      } else if (elapsed < spinTime) {
        // Slow down and approach final value
        const progress = (elapsed - (spinTime - 500)) / 500;
        if (progress < 0.5) {
          setDisplayValue(REEL_VALUES[Math.floor(Math.random() * REEL_VALUES.length)]);
        } else {
          setDisplayValue(finalValue);
        }
      } else {
        setDisplayValue(finalValue);
        setSpinning(false);
        clearInterval(interval);
      }
    }, 80);

    return () => clearInterval(interval);
  }, [isSpinning, finalValue, delay]);

  return (
    <div className="relative w-20 h-24 bg-black/40 rounded-xl border-2 border-white/20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-white/5" />

      <motion.div
        className="flex items-center justify-center h-full"
        animate={spinning ? { y: [0, -5, 0, 5, 0] } : {}}
        transition={{ duration: 0.1, repeat: spinning ? Infinity : 0 }}
      >
        <span className={cn(
          "text-3xl font-bold transition-all",
          spinning ? "text-white/60 blur-[1px]" : "text-white"
        )}>
          {displayValue}
        </span>
      </motion.div>

      {/* Shine effect */}
      {!spinning && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
          initial={{ x: '-100%' }}
          animate={{ x: '200%' }}
          transition={{ duration: 0.8, delay: delay / 1000 + 0.2 }}
        />
      )}
    </div>
  );
}

export function LuckySpinModal({ isOpen, onClose, canSpin }: LuckySpinModalProps) {
  const queryClient = useQueryClient();
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const spinMutation = useMutation({
    mutationFn: balanceApi.spin,
    onSuccess: (data) => {
      if (data.canSpin && data.result !== undefined) {
        setResult(data.result);
        // Show result after spin animation
        setTimeout(() => {
          setIsSpinning(false);
          setShowResult(true);
          queryClient.invalidateQueries({ queryKey: ['spinStatus'] });
          queryClient.invalidateQueries({ queryKey: ['balance'] });
        }, SPIN_DURATION + 800);
      }
    },
  });

  const handleSpin = useCallback(() => {
    if (!canSpin || isSpinning) return;
    setIsSpinning(true);
    setShowResult(false);
    setResult(null);
    spinMutation.mutate();
  }, [canSpin, isSpinning, spinMutation]);

  const handleClose = useCallback(() => {
    if (isSpinning) return;
    setShowResult(false);
    setResult(null);
    onClose();
  }, [isSpinning, onClose]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setShowResult(false);
      setResult(null);
      setIsSpinning(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Calculate reel display values
  const reelValues = result !== null
    ? [
        Math.floor(result / 100) % 10 * 10,
        Math.floor(result / 10) % 10 * 10,
        result % 100,
      ]
    : [0, 0, 0];

  return createPortal(
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9998] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      >
        <motion.div
          className="relative w-full max-w-sm bg-gradient-to-b from-purple-900/90 to-pink-900/90 rounded-3xl border border-white/20 p-6 overflow-hidden"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            disabled={isSpinning}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {/* Title */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-1">Lucky Spin</h2>
            <p className="text-purple-200/60 text-sm">Try your luck for free chips!</p>
          </div>

          {/* Slot Machine */}
          <div className="flex justify-center gap-3 mb-8">
            <SlotReel
              finalValue={result ?? 0}
              isSpinning={isSpinning}
              delay={0}
            />
            <SlotReel
              finalValue={result ?? 0}
              isSpinning={isSpinning}
              delay={200}
            />
            <SlotReel
              finalValue={result ?? 0}
              isSpinning={isSpinning}
              delay={400}
            />
          </div>

          {/* Result Display */}
          <AnimatePresence>
            {showResult && result !== null && (
              <motion.div
                className="text-center mb-6"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500"
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(251, 191, 36, 0.3)',
                      '0 0 40px rgba(251, 191, 36, 0.5)',
                      '0 0 20px rgba(251, 191, 36, 0.3)',
                    ]
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Sparkles className="w-5 h-5 text-white" />
                  <span className="text-2xl font-bold text-white">+{result} chips!</span>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Spin Button */}
          <motion.button
            onClick={handleSpin}
            disabled={!canSpin || isSpinning || showResult}
            className={cn(
              "w-full py-4 rounded-xl font-bold text-lg transition-all",
              canSpin && !showResult
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30"
                : "bg-white/10 text-zinc-400 cursor-not-allowed"
            )}
            whileHover={canSpin && !isSpinning && !showResult ? { scale: 1.02 } : {}}
            whileTap={canSpin && !isSpinning && !showResult ? { scale: 0.98 } : {}}
          >
            {isSpinning ? 'Spinning...' : showResult ? 'Done!' : 'SPIN'}
          </motion.button>

          {/* Prize tiers */}
          <div className="mt-6 grid grid-cols-4 gap-2 text-center text-xs">
            <div className="bg-white/5 rounded-lg py-2">
              <p className="text-zinc-400">Common</p>
              <p className="text-white font-medium">0-10</p>
            </div>
            <div className="bg-white/5 rounded-lg py-2">
              <p className="text-zinc-400">Uncommon</p>
              <p className="text-white font-medium">11-25</p>
            </div>
            <div className="bg-white/5 rounded-lg py-2">
              <p className="text-amber-400">Rare</p>
              <p className="text-white font-medium">26-50</p>
            </div>
            <div className="bg-white/5 rounded-lg py-2">
              <p className="text-purple-400">Jackpot</p>
              <p className="text-white font-medium">51-100</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
