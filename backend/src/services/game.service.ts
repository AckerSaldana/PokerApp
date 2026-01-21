import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/error.middleware';
import { CreateGameInput, UpdateGameInput } from '../validators/game.validator';

export class GameService {
  async createGame(data: CreateGameInput) {
    const game = await prisma.gameSession.create({
      data: {
        name: data.name,
        date: new Date(data.date),
        notes: data.notes,
      },
    });

    return game;
  }

  async getGames(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [games, total] = await Promise.all([
      prisma.gameSession.findMany({
        include: {
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
        participants: {
          include: {
            user: { select: { id: true, username: true } },
          },
          orderBy: { netResult: 'desc' },
        },
      },
    });

    if (!game) {
      throw new AppError('Game not found', 404, 'GAME_NOT_FOUND');
    }

    return game;
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

  async joinGame(gameId: string, userId: string, buyIn = 0) {
    const game = await prisma.gameSession.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      throw new AppError('Game not found', 404, 'GAME_NOT_FOUND');
    }

    if (!game.isActive) {
      throw new AppError('Game is no longer active', 400, 'GAME_INACTIVE');
    }

    const existingParticipant = await prisma.gameSessionParticipant.findUnique({
      where: {
        userId_gameSessionId: {
          userId,
          gameSessionId: gameId,
        },
      },
    });

    if (existingParticipant) {
      throw new AppError('Already joined this game', 400, 'ALREADY_JOINED');
    }

    return prisma.gameSessionParticipant.create({
      data: {
        userId,
        gameSessionId: gameId,
        buyIn,
      },
      include: {
        user: { select: { id: true, username: true } },
      },
    });
  }

  async leaveGame(gameId: string, userId: string) {
    const participant = await prisma.gameSessionParticipant.findUnique({
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

    await prisma.gameSessionParticipant.delete({
      where: { id: participant.id },
    });
  }

  async updateResults(
    gameId: string,
    participants: Array<{ userId: string; buyIn: number; cashOut: number }>
  ) {
    const game = await prisma.gameSession.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      throw new AppError('Game not found', 404, 'GAME_NOT_FOUND');
    }

    const updates = participants.map((p) =>
      prisma.gameSessionParticipant.updateMany({
        where: {
          gameSessionId: gameId,
          userId: p.userId,
        },
        data: {
          buyIn: p.buyIn,
          cashOut: p.cashOut,
          netResult: p.cashOut - p.buyIn,
        },
      })
    );

    await prisma.$transaction(updates);

    return this.getGameById(gameId);
  }

  async closeGame(gameId: string) {
    const game = await prisma.gameSession.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      throw new AppError('Game not found', 404, 'GAME_NOT_FOUND');
    }

    return prisma.gameSession.update({
      where: { id: gameId },
      data: { isActive: false },
      include: {
        participants: {
          include: {
            user: { select: { id: true, username: true } },
          },
        },
      },
    });
  }

  async getUserGames(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [participations, total] = await Promise.all([
      prisma.gameSessionParticipant.findMany({
        where: { userId },
        include: {
          gameSession: true,
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
