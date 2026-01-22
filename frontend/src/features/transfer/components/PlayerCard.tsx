import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { formatChips, cn } from '@/lib/utils';
import type { User } from '@/lib/types';

interface PlayerCardProps {
  user: User;
  isSelected: boolean;
  onSelect: () => void;
  index: number;
}

export function PlayerCard({ user, isSelected, onSelect, index }: PlayerCardProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      onClick={onSelect}
      className={cn(
        'relative flex flex-col items-center p-4 rounded-2xl',
        'border-2 transition-all duration-300',
        'backdrop-blur-sm w-full',
        isSelected
          ? 'bg-emerald-600/20 border-emerald-500 shadow-lg shadow-emerald-500/20'
          : 'bg-zinc-900/50 border-zinc-800/50 hover:border-zinc-700'
      )}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Selection checkmark */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full
                       flex items-center justify-center shadow-lg z-10"
          >
            <Check className="w-4 h-4 text-white" />
          </motion.div>
        )}
      </AnimatePresence>

      <Avatar
        src={user.avatarData || undefined}
        name={user.username}
        size="lg"
        className={cn(isSelected && 'ring-2 ring-emerald-500')}
      />

      <p className="text-sm text-white mt-2 truncate w-full text-center font-medium">
        {user.username}
      </p>

      {/* Chip balance display */}
      <p className={cn(
        'text-xs mt-1 font-display tabular-nums',
        user.chipBalance >= 0 ? 'text-emerald-400' : 'text-red-400'
      )}>
        {formatChips(user.chipBalance)}
      </p>
    </motion.button>
  );
}
