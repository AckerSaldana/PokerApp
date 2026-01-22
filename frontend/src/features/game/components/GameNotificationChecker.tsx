import { useEffect, useRef } from 'react';
import { notifications } from '@/services/notifications';
import type { Game, GameParticipant } from '@/lib/types';

interface GameNotificationCheckerProps {
  game: Game | null | undefined;
  userId: string | undefined;
  isHost: boolean;
}

/**
 * Detects game state changes and shows notifications:
 * - For hosts: When a player requests to leave
 * - For players: When they get cashed out
 */
export function GameNotificationChecker({ game, userId, isHost }: GameNotificationCheckerProps) {
  const previousParticipantsRef = useRef<Map<string, GameParticipant>>(new Map());

  useEffect(() => {
    if (!game || !userId || !notifications.isSupported()) return;

    const currentParticipants = new Map(
      game.participants.map((p) => [p.userId, p])
    );
    const previousParticipants = previousParticipantsRef.current;

    // Skip on first render (no previous state to compare)
    if (previousParticipants.size === 0) {
      previousParticipantsRef.current = currentParticipants;
      return;
    }

    // For hosts: Check for new leave requests
    if (isHost) {
      game.participants.forEach((participant) => {
        const previous = previousParticipants.get(participant.userId);
        // New leave request detected
        if (
          participant.leaveRequestedAt &&
          !previous?.leaveRequestedAt &&
          participant.userId !== userId
        ) {
          notifications.showLeaveRequest(
            participant.user?.username || 'A player',
            game.id
          );
        }
      });
    }

    // For players: Check if I got cashed out
    if (!isHost) {
      const myParticipation = game.participants.find((p) => p.userId === userId);
      const myPreviousParticipation = previousParticipants.get(userId);

      if (
        myParticipation?.cashedOutAt &&
        !myPreviousParticipation?.cashedOutAt
      ) {
        notifications.showCashedOut(
          myParticipation.cashOut,
          myParticipation.netResult,
          game.id
        );
      }
    }

    // Update the ref for next comparison
    previousParticipantsRef.current = currentParticipants;
  }, [game, userId, isHost]);

  return null;
}
