import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/error.middleware';
import { CreateGameInput, UpdateGameInput } from '../validators/game.validator';

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
    const gameId = await prisma.$transaction(async (tx) => {
      const game = await tx.gameSession.findUnique({
        where: { joinCode: joinCode.toUpperCase() },
      });

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

      // Check user balance
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }

      if (buyIn > 0 && user.chipBalance < buyIn) {
        throw new AppError('Insufficient chip balance', 400, 'INSUFFICIENT_BALANCE');
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
    });

    return this.getGameById(gameId);
  }

  async rebuy(gameId: string, userId: string, amount: number) {
    if (amount <= 0) {
      throw new AppError('Rebuy amount must be positive', 400, 'INVALID_AMOUNT');
    }

    await prisma.$transaction(async (tx) => {
      const game = await tx.gameSession.findUnique({
        where: { id: gameId },
      });

      if (!game) {
        throw new AppError('Game not found', 404, 'GAME_NOT_FOUND');
      }

      if (!game.isActive) {
        throw new AppError('Game is no longer active', 400, 'GAME_INACTIVE');
      }

      // Check if user is a participant
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

      // Check user balance
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }

      if (user.chipBalance < amount) {
        throw new AppError('Insufficient chip balance', 400, 'INSUFFICIENT_BALANCE');
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
    });

    return this.getGameById(gameId);
  }

  async leaveGame(gameId: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      const game = await tx.gameSession.findUnique({
        where: { id: gameId },
      });

      if (!game) {
        throw new AppError('Game not found', 404, 'GAME_NOT_FOUND');
      }

      // Host cannot leave their own game
      if (game.hostId === userId) {
        throw new AppError('Host cannot leave. Close the game instead.', 400, 'HOST_CANNOT_LEAVE');
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

      // Refund chips if game is still active
      if (game.isActive && participant.buyIn > 0) {
        await tx.user.update({
          where: { id: userId },
          data: { chipBalance: { increment: participant.buyIn } },
        });
      }

      await tx.gameSessionParticipant.delete({
        where: { id: participant.id },
      });
    });
  }

  async closeGame(
    gameId: string,
    hostId: string,
    results: Array<{ userId: string; cashOut: number }>
  ) {
    await prisma.$transaction(async (tx) => {
      const game = await tx.gameSession.findUnique({
        where: { id: gameId },
        include: { participants: true },
      });

      if (!game) {
        throw new AppError('Game not found', 404, 'GAME_NOT_FOUND');
      }

      if (game.hostId !== hostId) {
        throw new AppError('Only the host can close the game', 403, 'NOT_HOST');
      }

      if (!game.isActive) {
        throw new AppError('Game is already closed', 400, 'GAME_ALREADY_CLOSED');
      }

      // Update each participant's balance and record results
      for (const result of results) {
        const participant = game.participants.find((p) => p.userId === result.userId);
        if (!participant) continue;

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
    });

    return this.getGameById(gameId);
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

    return { games: participations, total, page, limit };
  }
}

export const gameService = new GameService();
