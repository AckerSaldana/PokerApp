import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, ChevronRight } from 'lucide-react';
import { cn, formatChips } from '@/lib/utils';
import type { GameSession, GameParticipant } from '@/lib/types';
import { useAuthStore } from '@/stores/authStore';

interface GameCardProps {
  game: GameSession;
}

export function GameCard({ game }: GameCardProps) {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  // Find current user's participation
  const myParticipation = game.participants.find(p => p.userId === user?.id);
  const netResult = myParticipation?.netResult || 0;
  const isPositive = netResult >= 0;

  const formattedDate = new Date(game.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <motion.button
      onClick={() => navigate(`/game/${game.id}`)}
      className={cn(
        'w-full flex items-center gap-4 p-4',
        'bg-white/5 rounded-xl',
        'border border-white/10',
        'text-left transition-colors'
      )}
      whileHover={{ scale: 1.01, borderColor: 'rgba(255, 255, 255, 0.15)' }}
      transition={{ duration: 0.2 }}
    >
      {/* Date badge */}
      <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-zinc-800/80">
        <span className="text-xs text-zinc-500 uppercase">
          {new Date(game.date).toLocaleDateString('en-US', { month: 'short' })}
        </span>
        <span className="text-lg font-bold text-white">
          {new Date(game.date).getDate()}
        </span>
      </div>

      {/* Game info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-white truncate">{game.name || 'Poker Night'}</p>
        <div className="flex items-center gap-3 text-sm text-zinc-500">
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {game.participants.length}
          </span>
          <span>Host: {game.host.username}</span>
        </div>
      </div>

      {/* Result */}
      {myParticipation && !game.isActive && (
        <div className="text-right">
          <p
            className={cn(
              'font-bold tabular-nums',
              isPositive ? 'text-emerald-400' : 'text-red-400'
            )}
          >
            {isPositive ? '+' : ''}{formatChips(netResult)}
          </p>
        </div>
      )}

      <ChevronRight className="w-5 h-5 text-zinc-600" />
    </motion.button>
  );
}
