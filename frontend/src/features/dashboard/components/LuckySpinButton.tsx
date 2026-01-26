import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Dices } from 'lucide-react';
import { balanceApi } from '@/services/api/balance';
import { LuckySpinModal } from './LuckySpinModal';
import { cn } from '@/lib/utils';

function formatTimeRemaining(targetDate: Date): string {
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();

  if (diff <= 0) return 'Spin Now!';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export function LuckySpinButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['spinStatus'],
    queryFn: balanceApi.getSpinStatus,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  // Update countdown timer
  useEffect(() => {
    if (!data || data.canSpin) return;

    const targetDate = new Date(data.nextSpinAt);
    const updateTimer = () => {
      setTimeRemaining(formatTimeRemaining(targetDate));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [data]);

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-black/40 border border-[#d4af37]/20 p-4 h-16 animate-pulse" />
    );
  }

  if (!data) return null;

  return (
    <>
      <motion.button
        onClick={() => setIsModalOpen(true)}
        className={cn(
          "w-full relative overflow-hidden rounded-2xl p-4 border transition-all",
          data.canSpin
            ? "bg-black/60 border-[#d4af37]/40"
            : "bg-white/5 border-white/10"
        )}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        {/* Glow when available */}
        {data.canSpin && (
          <motion.div
            className="absolute inset-0 bg-[#d4af37]/10"
            animate={{ opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              data.canSpin
                ? "bg-[#d4af37]"
                : "bg-white/10"
            )}>
              <Dices className={cn(
                "w-5 h-5",
                data.canSpin ? "text-black" : "text-zinc-400"
              )} />
            </div>
            <div className="text-left">
              <p className={cn(
                "font-semibold",
                data.canSpin ? "text-white" : "text-zinc-400"
              )}>
                Lucky Spin
              </p>
              <p className="text-xs text-zinc-500">
                {data.canSpin ? 'Win up to 100 chips!' : timeRemaining}
              </p>
            </div>
          </div>

          <div className={cn(
            "px-4 py-2 rounded-lg font-semibold text-sm",
            data.canSpin
              ? "bg-[#d4af37] text-black"
              : "bg-white/5 text-zinc-500"
          )}>
            {data.canSpin ? 'SPIN!' : 'Wait'}
          </div>
        </div>
      </motion.button>

      <LuckySpinModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        canSpin={data.canSpin}
      />
    </>
  );
}
