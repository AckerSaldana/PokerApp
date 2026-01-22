import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/error.middleware';
import { CreateGameInput, UpdateGameInput } from '../validators/game.validator';
import { achievementService } from './achievement.service';

export class GameService {
  // Generate a 6-character alphanumeric code
  private generateJoinCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude confusing chars (0, O, 1, I)
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  async createGame(hostId: string, data: CreateGameInput) {
    // Generate unique join code
    let joinCode = this.generateJoinCode();
    let attempts = 0;
    while (attempts < 10) {
      const existing = await prisma.gameSession.findUnique({ where: { joinCode } });
      if (!existing) break;
      joinCode = this.generateJoinCode();
      attempts++;
    }

    const gameId = await prisma.$transaction(async (tx) => {
      // Create the game
      const game = await tx.gameSession.create({
        data: {
          name: data.name || 'Poker Night',
          joinCode,
          hostId,
          date: new Date(),
          notes: data.notes,
        },
      });

      // Auto-join host with 0 buy-in (they'll rebuy when ready)
      await tx.gameSessionParticipant.create({
        data: {
          userId: hostId,
          gameSessionId: game.id,
          buyIn: 0,
        },
      });

      return game.id;
    });

    // Check hosting achievements (async, non-blocking)
    achievementService.checkAndUnlockAchievements(hostId).catch(console.error);

    // Fetch the full game data after transaction commits
    return this.getGameById(gameId);
  }

  async getGames(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [games, total] = await Promise.all([
      prisma.gameSession.findMany({
        include: {
          host: { select: { id: true, username: true } },
          participants: {
            include: {
              user: { select: { id: true, username: true } },
            },
          },
        },
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      prisma.gameSession.count(),
    ]);

    return { games, total, page, limit };
  }

  async getGameById(gameId: string) {
    const game = await prisma.gameSession.findUnique({
      where: { id: gameId },
      include: {
        host: { select: { id: true, username: true } },
        participants: {
          include: {
            user: { select: { id: true, username: true } },
          },
          orderBy: { buyIn: 'desc' },
        },
      },
    });

    if (!game) {
      throw new AppError('Game not found', 404, 'GAME_NOT_FOUND');
    }

    return game;
  }

  async getGameByCode(joinCode: string) {
    const game = await prisma.gameSession.findUnique({
      where: { joinCode: joinCode.toUpperCase() },
      include: {
        host: { select: { id: true, username: true } },
        participants: {
          include: {
            user: { select: { id: true, username: true } },
          },
          orderBy: { buyIn: 'desc' },
        },
      },
    });

    if (!game) {
      throw new AppError('Game not found', 404, 'GAME_NOT_FOUND');
    }

    if (!game.isActive) {
      throw new AppError('Game is no longer active', 400, 'GAME_INACTIVE');
    }

    return game;
  }

  async getActiveGame(userId: string) {
    const participation = await prisma.gameSessionParticipant.findFirst({
      where: {
        userId,
        gameSession: { isActive: true },
      },
      include: {
        gameSession: {
          include: {
            host: { select: { id: true, username: true } },
            participants: {
              include: {
                user: { select: { id: true, username: true } },
              },
              orderBy: { buyIn: 'desc' },
            },
          },
        },
      },
    });

    return participation?.gameSession || null;
  }

  async updateGame(gameId: string, data: UpdateGameInput) {
    const game = await prisma.gameSession.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      throw new AppError('Game not found', 404, 'GAME_NOT_FOUND');
    }

    return prisma.gameSession.update({
      where: { id: gameId },
      data,
    });
  }

  async deleteGame(gameId: string) {
    const game = await prisma.gameSession.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      throw new AppError('Game not found', 404, 'GAME_NOT_FOUND');
    }

    await prisma.gameSession.delete({
      where: { id: gameId },
    });
  }

  async joinGameByCode(joinCode: string, userId: string, buyIn: number) {
    const gameId = await prisma.$transaction(
      async (tx) => {
        // Lock user row first to prevent concurrent balance modifications
        const users = await tx.$queryRaw<Array<{ id: string; chipBalance: number }>>`
          SELECT id, "chipBalance" FROM "User" WHERE id = ${userId} FOR UPDATE
        `;
        const user = users[0];
        if (!user) {
          throw new AppError('User not found', 404, 'USER_NOT_FOUND');
        }

        if (buyIn > 0 && user.chipBalance < buyIn) {
          throw new AppError('Insufficient chip balance', 400, 'INSUFFICIENT_BALANCE');
        }

        // Lock game row to prevent concurrent joins during close
        const games = await tx.$queryRaw<
          Array<{ id: string; isActive: boolean; joinCode: string }>
        >`
          SELECT id, "isActive", "joinCode" FROM "GameSession"
          WHERE "joinCode" = ${joinCode.toUpperCase()} FOR UPDATE
        `;
        const game = games[0];

        if (!game) {
          throw new AppError('Game not found', 404, 'GAME_NOT_FOUND');
        }

        if (!game.isActive) {
          throw new AppError('Game is no longer active', 400, 'GAME_INACTIVE');
        }

        // Check if already joined
        const existingParticipant = await tx.gameSessionParticipant.findUnique({
          where: {
            userId_gameSessionId: {
              userId,
              gameSessionId: game.id,
            },
          },
        });

        if (existingParticipant) {
          throw new AppError('Already joined this game', 400, 'ALREADY_JOINED');
        }

        // Deduct chips from balance
        if (buyIn > 0) {
          await tx.user.update({
            where: { id: userId },
            data: { chipBalance: { decrement: buyIn } },
          });
        }

        // Create participant
        await tx.gameSessionParticipant.create({
          data: {
            userId,
            gameSessionId: game.id,
            buyIn,
          },
        });

        return game.id;
      },
      {
        isolationLevel: 'Serializable',
      }
    );

    return this.getGameById(gameId);
  }

  async rebuy(gameId: string, userId: string, amount: number) {
    if (amount <= 0) {
      throw new AppError('Rebuy amount must be positive', 400, 'INVALID_AMOUNT');
    }

    await prisma.$transaction(
      async (tx) => {
        // Lock user row first to prevent concurrent balance modifications
        const users = await tx.$queryRaw<Array<{ id: string; chipBalance: number }>>`
          SELECT id, "chipBalance" FROM "User" WHERE id = ${userId} FOR UPDATE
        `;
        const user = users[0];
        if (!user) {
          throw new AppError('User not found', 404, 'USER_NOT_FOUND');
        }

        if (user.chipBalance < amount) {
          throw new AppError('Insufficient chip balance', 400, 'INSUFFICIENT_BALANCE');
        }

        // Lock game row
        const games = await tx.$queryRaw<Array<{ id: string; isActive: boolean }>>`
          SELECT id, "isActive" FROM "GameSession" WHERE id = ${gameId} FOR UPDATE
        `;
        const game = games[0];

        if (!game) {
          throw new AppError('Game not found', 404, 'GAME_NOT_FOUND');
        }

        if (!game.isActive) {
          throw new AppError('Game is no longer active', 400, 'GAME_INACTIVE');
        }

        // Check if user is a participant (with lock)
        const participants = await tx.$queryRaw<
          Array<{ id: string; cashedOutAt: Date | null }>
        >`
          SELECT id, "cashedOutAt" FROM "GameSessionParticipant"
          WHERE "userId" = ${userId} AND "gameSessionId" = ${gameId}
          FOR UPDATE
        `;
        const participant = participants[0];

        if (!participant) {
          throw new AppError('Not a participant in this game', 400, 'NOT_PARTICIPANT');
        }

        // Check if already cashed out
        if (participant.cashedOutAt) {
          throw new AppError('Cannot rebuy after being cashed out', 400, 'ALREADY_CASHED_OUT');
        }

        // Deduct chips from balance
        await tx.user.update({
          where: { id: userId },
          data: { chipBalance: { decrement: amount } },
        });

        // Add to buy-in
        await tx.gameSessionParticipant.update({
          where: { id: participant.id },
          data: { buyIn: { increment: amount } },
        });
      },
      {
        isolationLevel: 'Serializable',
      }
    );

    return this.getGameById(gameId);
  }

  async requestLeave(gameId: string, userId: string) {
    const resultGameId = await prisma.$transaction(async (tx) => {
      const game = await tx.gameSession.findUnique({
        where: { id: gameId },
      });

      if (!game) {
        throw new AppError('Game not found', 404, 'GAME_NOT_FOUND');
      }

      if (!game.isActive) {
        throw new AppError('Game is not active', 400, 'GAME_INACTIVE');
      }

      // Host cannot leave their own game
      if (game.hostId === userId) {
        throw new AppError('Host cannot leave. End the game instead.', 400, 'HOST_CANNOT_LEAVE');
      }

      const participant = await tx.gameSessionParticipant.findUnique({
        where: {
          userId_gameSessionId: {
            userId,
            gameSessionId: gameId,
          },
        },
      });

      if (!participant) {
        throw new AppError('Not a participant in this game', 400, 'NOT_PARTICIPANT');
      }

      // Cannot request leave if already cashed out
      if (participant.cashedOutAt) {
        throw new AppError('Already cashed out', 400, 'ALREADY_CASHED_OUT');
      }

      // Cannot request leave if already requested
      if (participant.leaveRequestedAt) {
        throw new AppError('Leave already requested', 400, 'LEAVE_ALREADY_REQUESTED');
      }

      // Set the leave request flag - host will cash them out
      await tx.gameSessionParticipant.update({
        where: { id: participant.id },
        data: { leaveRequestedAt: new Date() },
      });

      return gameId;
    });

    return this.getGameById(resultGameId);
  }

  async closeGame(
    gameId: string,
    hostId: string,
    results: Array<{ userId: string; cashOut: number }>
  ) {
    await prisma.$transaction(
      async (tx) => {
        // Lock game row first to prevent concurrent joins/cash-outs
        const games = await tx.$queryRaw<Array<{ id: string; hostId: string; isActive: boolean }>>`
          SELECT id, "hostId", "isActive" FROM "GameSession" WHERE id = ${gameId} FOR UPDATE
        `;
        const game = games[0];

        if (!game) {
          throw new AppError('Game not found', 404, 'GAME_NOT_FOUND');
        }

        if (game.hostId !== hostId) {
          throw new AppError('Only the host can close the game', 403, 'NOT_HOST');
        }

        if (!game.isActive) {
          throw new AppError('Game is already closed', 400, 'GAME_ALREADY_CLOSED');
        }

        // Lock all participants to prevent concurrent modifications
        const participants = await tx.$queryRaw<
          Array<{
            id: string;
            userId: string;
            buyIn: number;
            cashOut: number;
            cashedOutAt: Date | null;
          }>
        >`
          SELECT id, "userId", "buyIn", "cashOut", "cashedOutAt"
          FROM "GameSessionParticipant"
          WHERE "gameSessionId" = ${gameId}
          FOR UPDATE
        `;

        // Calculate pot tracking
        const totalBuyIns = participants.reduce((sum, p) => sum + p.buyIn, 0);
        const totalEarlyCashOuts = participants
          .filter((p) => p.cashedOutAt !== null)
          .reduce((sum, p) => sum + p.cashOut, 0);
        const remainingPot = totalBuyIns - totalEarlyCashOuts;

        // Identify active (not cashed out) participants
        const activeParticipants = participants.filter((p) => p.cashedOutAt === null);
        const activeUserIds = new Set(activeParticipants.map((p) => p.userId));

        // Calculate total closing cash-outs (only for active participants)
        const totalClosingCashOuts = results
          .filter((r) => activeUserIds.has(r.userId))
          .reduce((sum, r) => sum + r.cashOut, 0);

        // Validate: cash-outs must equal remaining pot
        if (totalClosingCashOuts !== remainingPot) {
          throw new AppError(
            `Total cash-outs (${totalClosingCashOuts}) must equal remaining pot (${remainingPot})`,
            400,
            'CASHOUT_MISMATCH'
          );
        }

        // Update each active participant's balance and record results
        for (const result of results) {
          const participant = activeParticipants.find((p) => p.userId === result.userId);
          if (!participant) continue; // Skip if not active or not found

          const netResult = result.cashOut - participant.buyIn;

          // Add cash-out to user balance
          await tx.user.update({
            where: { id: result.userId },
            data: { chipBalance: { increment: result.cashOut } },
          });

          // Record results
          await tx.gameSessionParticipant.update({
            where: { id: participant.id },
            data: {
              cashOut: result.cashOut,
              netResult,
            },
          });
        }

        // Close game
        await tx.gameSession.update({
          where: { id: gameId },
          data: { isActive: false },
        });
      },
      {
        isolationLevel: 'Serializable',
      }
    );

    // Check achievements for all participants (async, non-blocking)
    const game = await this.getGameById(gameId);
    const participantIds = game.participants.map((p) => p.userId);
    Promise.all(participantIds.map((userId) => achievementService.checkAndUnlockAchievements(userId))).catch(
      console.error
    );

    return game;
  }

  async earlyCashOut(
    gameId: string,
    hostId: string,
    participantUserId: string,
    cashOutAmount: number
  ) {
    const resultGameId = await prisma.$transaction(
      async (tx) => {
        // Lock game row first to prevent concurrent modifications
        const games = await tx.$queryRaw<Array<{ id: string; hostId: string; isActive: boolean }>>`
          SELECT id, "hostId", "isActive" FROM "GameSession" WHERE id = ${gameId} FOR UPDATE
        `;
        const game = games[0];

        if (!game) {
          throw new AppError('Game not found', 404, 'GAME_NOT_FOUND');
        }

        // Verify host authorization
        if (game.hostId !== hostId) {
          throw new AppError('Only the host can cash out players', 403, 'NOT_HOST');
        }

        // Verify game is active
        if (!game.isActive) {
          throw new AppError('Game is already closed', 400, 'GAME_ALREADY_CLOSED');
        }

        // Lock all participants to get accurate pot calculation
        const participants = await tx.$queryRaw<
          Array<{
            id: string;
            userId: string;
            buyIn: number;
            cashOut: number;
            cashedOutAt: Date | null;
          }>
        >`
          SELECT id, "userId", "buyIn", "cashOut", "cashedOutAt"
          FROM "GameSessionParticipant"
          WHERE "gameSessionId" = ${gameId}
          FOR UPDATE
        `;

        // Find the participant
        const participant = participants.find((p) => p.userId === participantUserId);

        if (!participant) {
          throw new AppError('Player not in this game', 400, 'NOT_PARTICIPANT');
        }

        // Check if already cashed out
        if (participant.cashedOutAt) {
          throw new AppError('Player already cashed out', 400, 'ALREADY_CASHED_OUT');
        }

        // Calculate available pot with locked data
        const totalBuyIns = participants.reduce((sum, p) => sum + p.buyIn, 0);
        const totalEarlyCashOuts = participants
          .filter((p) => p.cashedOutAt !== null)
          .reduce((sum, p) => sum + p.cashOut, 0);
        const availablePot = totalBuyIns - totalEarlyCashOuts;

        // Validate cash-out doesn't exceed available pot
        if (cashOutAmount > availablePot) {
          throw new AppError(
            `Cash-out exceeds available pot. Maximum: ${availablePot}`,
            400,
            'EXCEEDS_POT'
          );
        }

        // Update participant record
        const netResult = cashOutAmount - participant.buyIn;
        await tx.gameSessionParticipant.update({
          where: { id: participant.id },
          data: {
            cashOut: cashOutAmount,
            netResult,
            cashedOutAt: new Date(),
          },
        });

        // Credit chips to user's balance
        await tx.user.update({
          where: { id: participantUserId },
          data: { chipBalance: { increment: cashOutAmount } },
        });

        return gameId;
      },
      {
        isolationLevel: 'Serializable',
      }
    );

    return this.getGameById(resultGameId);
  }

  async getUserGames(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [participations, total] = await Promise.all([
      prisma.gameSessionParticipant.findMany({
        where: { userId },
        include: {
          gameSession: {
            include: {
              host: { select: { id: true, username: true } },
              participants: {
                include: {
                  user: { select: { id: true, username: true } },
                },
              },
            },
          },
        },
        orderBy: { gameSession: { date: 'desc' } },
        skip,
        take: limit,
      }),
      prisma.gameSessionParticipant.count({
        where: { userId },
      }),
    ]);

    const games = participations.map((p) => p.gameSession);
    return { games, total, page, limit };
  }
}

export const gameService = new GameService();
