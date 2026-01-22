import { Crown } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { cn, formatChips } from '@/lib/utils';
import type { GameParticipant } from '@/lib/types';

interface ParticipantRowProps {
  participant: GameParticipant;
  isHost: boolean;
  isCurrentUser: boolean;
  gameActive: boolean;
}

export function ParticipantRow({ participant, isHost, isCurrentUser, gameActive }: ParticipantRowProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-xl',
        'bg-white/5 border border-white/10',
        isCurrentUser && 'border-emerald-500/30 bg-emerald-500/5'
      )}
    >
      {/* Avatar */}
      <div className="relative">
        <Avatar name={participant.user.username} size="md" />
        {isHost && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
            <Crown className="w-3 h-3 text-amber-900" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-white truncate">{participant.user.username}</p>
          {isCurrentUser && (
            <span className="text-xs text-emerald-400">(You)</span>
          )}
        </div>
        {gameActive && (
          <p className="text-sm text-zinc-500">
            Buy-in: {formatChips(participant.buyIn)}
          </p>
        )}
      </div>

      {/* Result (if game closed) */}
      {!gameActive && (
        <div className="text-right">
          <p
            className={cn(
              'font-bold tabular-nums',
              participant.netResult >= 0 ? 'text-emerald-400' : 'text-red-400'
            )}
          >
            {participant.netResult >= 0 ? '+' : ''}{formatChips(participant.netResult)}
          </p>
          <p className="text-xs text-zinc-500">
            {formatChips(participant.buyIn)} → {formatChips(participant.cashOut)}
          </p>
        </div>
      )}

      {/* Buy-in (if game active) */}
      {gameActive && (
        <div className="text-right">
          <p className="font-bold text-white tabular-nums">{formatChips(participant.buyIn)}</p>
        </div>
      )}
    </div>
  );
}
