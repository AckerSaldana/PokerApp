import { Crown, LogOut } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { cn, formatChips } from '@/lib/utils';
import type { GameParticipant } from '@/lib/types';

interface ParticipantRowProps {
  participant: GameParticipant;
  isHost: boolean;
  isCurrentUser: boolean;
  gameActive: boolean;
  showCashOutButton?: boolean;
  onCashOut?: () => void;
  onPlayerTap?: (playerId: string, playerName: string) => void;
}

export function ParticipantRow({
  participant,
  isHost,
  isCurrentUser,
  gameActive,
  showCashOutButton = false,
  onCashOut,
  onPlayerTap,
}: ParticipantRowProps) {
  const isCashedOut = !!participant.cashedOutAt;
  const isLeaveRequested = !!participant.leaveRequestedAt && !isCashedOut;
  const username = participant.user?.username ?? 'Loading...';

  const handleTap = () => {
    if (!isCurrentUser && onPlayerTap) {
      onPlayerTap(participant.userId, username);
    }
  };

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-xl',
        'bg-white/5 border border-white/10',
        isCurrentUser && 'border-emerald-500/30 bg-emerald-500/5',
        isCashedOut && gameActive && 'opacity-60',
        !isCurrentUser && onPlayerTap && 'cursor-pointer active:scale-[0.98] transition-transform'
      )}
      onClick={handleTap}
    >
      {/* Avatar */}
      <div className="relative">
        <Avatar src={participant.user?.avatarData || undefined} name={username} size="md" />
        {isHost && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
            <Crown className="w-3 h-3 text-amber-900" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-white truncate">{username}</p>
          {isCurrentUser && (
            <span className="text-xs text-emerald-400">(You)</span>
          )}
          {/* Cashed out badge */}
          {isCashedOut && gameActive && (
            <span className="text-xs px-2 py-0.5 bg-zinc-700 text-zinc-400 rounded-full">
              Cashed Out
            </span>
          )}
          {/* Leave requested badge */}
          {isLeaveRequested && gameActive && (
            <span className="text-xs px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-full">
              Leave Requested
            </span>
          )}
        </div>
        {gameActive && (
          <p className="text-sm text-zinc-500">
            Buy-in: {formatChips(participant.buyIn)}
            {isCashedOut && (
              <span className="ml-2 text-emerald-400">
                → {formatChips(participant.cashOut)}
              </span>
            )}
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

      {/* Buy-in / Cash Out Button (if game active and not cashed out) */}
      {gameActive && !isCashedOut && (
        <div className="flex items-center gap-2">
          <p className="font-bold text-white tabular-nums">{formatChips(participant.buyIn)}</p>
          {/* Cash Out button for host */}
          {showCashOutButton && onCashOut && (
            <button
              onClick={onCashOut}
              className={cn(
                'p-2 rounded-lg transition-colors',
                'bg-amber-600/20 hover:bg-amber-600/40',
                'text-amber-400'
              )}
              title="Cash out player"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Cashed out result (game still active) */}
      {gameActive && isCashedOut && (
        <div className="text-right">
          <p
            className={cn(
              'font-bold tabular-nums',
              participant.netResult >= 0 ? 'text-emerald-400' : 'text-red-400'
            )}
          >
            {participant.netResult >= 0 ? '+' : ''}{formatChips(participant.netResult)}
          </p>
        </div>
      )}
    </div>
  );
}
