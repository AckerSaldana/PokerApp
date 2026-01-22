import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { AchievementBadge } from './AchievementBadge';
import type { UnlockedAchievement } from '@/lib/types';

interface AchievementToastProps {
  achievement: UnlockedAchievement | null;
  onClose: () => void;
}

export function AchievementToast({ achievement, onClose }: AchievementToastProps) {
  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-2rem)] max-w-sm"
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          <div className="relative bg-zinc-900/95 backdrop-blur-xl border border-amber-500/30 rounded-2xl p-4 shadow-2xl shadow-amber-500/20">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-amber-500/10 rounded-2xl" />

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 text-zinc-400" />
            </button>

            <div className="relative flex items-center gap-4">
              <AchievementBadge achievement={achievement} size="lg" />

              <div className="flex-1 min-w-0">
                <p className="text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
                  Achievement Unlocked!
                </p>
                <p className="text-white font-bold text-lg">{achievement.name}</p>
                <p className="text-zinc-400 text-sm">{achievement.description}</p>
              </div>
            </div>

            {/* Animated sparkles */}
            <motion.div
              className="absolute top-2 left-8 w-2 h-2 bg-amber-400 rounded-full"
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
              }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
            />
            <motion.div
              className="absolute bottom-4 right-12 w-1.5 h-1.5 bg-amber-300 rounded-full"
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
              }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
            />
            <motion.div
              className="absolute top-6 right-24 w-1 h-1 bg-amber-500 rounded-full"
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
              }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
