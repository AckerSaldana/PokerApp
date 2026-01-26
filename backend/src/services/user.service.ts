import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/error.middleware';

export class UserService {
  async getAllUsers() {
    return prisma.user.findMany({
      select: {
        id: true,
        username: true,
        chipBalance: true,
        avatarData: true,
        createdAt: true,
      },
      orderBy: { username: 'asc' },
    });
  }

  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        chipBalance: true,
        avatarData: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    return user;
  }

  async getUserStats(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        chipBalance: true,
        avatarData: true,
        createdAt: true,
        equippedFrameId: true,
        equippedTitleId: true,
        equippedFrame: {
          select: {
            cssClass: true,
          },
        },
        equippedTitle: {
          select: {
            name: true,
            color: true,
          },
        },
        gameSessions: {
          select: {
            netResult: true,
            buyIn: true,
            cashOut: true,
            gameSession: {
              select: { date: true },
            },
          },
        },
        transfersSent: {
          select: { amount: true },
        },
        transfersReceived: {
          select: { amount: true },
        },
      },
    });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    const gameStats = user.gameSessions.reduce(
      (acc, session) => ({
        totalGames: acc.totalGames + 1,
        totalWinnings: acc.totalWinnings + session.netResult,
        totalBuyIn: acc.totalBuyIn + session.buyIn,
        totalCashOut: acc.totalCashOut + session.cashOut,
        wins: acc.wins + (session.netResult > 0 ? 1 : 0),
        losses: acc.losses + (session.netResult < 0 ? 1 : 0),
        biggestWin: Math.max(acc.biggestWin, session.netResult),
        biggestLoss: Math.min(acc.biggestLoss, session.netResult),
      }),
      {
        totalGames: 0,
        totalWinnings: 0,
        totalBuyIn: 0,
        totalCashOut: 0,
        wins: 0,
        losses: 0,
        biggestWin: 0,
        biggestLoss: 0,
      }
    );

    const transferStats = {
      totalSent: user.transfersSent.reduce((sum, t) => sum + t.amount, 0),
      totalReceived: user.transfersReceived.reduce((sum, t) => sum + t.amount, 0),
      transfersSentCount: user.transfersSent.length,
      transfersReceivedCount: user.transfersReceived.length,
    };

    return {
      user: {
        id: user.id,
        username: user.username,
        chipBalance: user.chipBalance,
        avatarData: user.avatarData,
        createdAt: user.createdAt,
        equippedFrameId: user.equippedFrameId,
        equippedTitleId: user.equippedTitleId,
        equippedFrameCss: user.equippedFrame?.cssClass || null,
        equippedTitleName: user.equippedTitle?.name || null,
        equippedTitleColor: user.equippedTitle?.color || null,
      },
      gameStats: {
        ...gameStats,
        winRate: gameStats.totalGames > 0 ? gameStats.wins / gameStats.totalGames : 0,
        averageResult:
          gameStats.totalGames > 0 ? gameStats.totalWinnings / gameStats.totalGames : 0,
      },
      transferStats,
    };
  }

  async getProfitHistory(userId: string, limit = 30) {
    const games = await prisma.gameSessionParticipant.findMany({
      where: {
        userId,
        gameSession: { isActive: false },
      },
      include: {
        gameSession: {
          select: { date: true, name: true },
        },
      },
      orderBy: {
        gameSession: { date: 'asc' },
      },
      take: limit,
    });

    // Calculate running cumulative profit
    let cumulativeProfit = 0;
    return games.map((g) => {
      cumulativeProfit += g.netResult;
      return {
        date: g.gameSession.date,
        gameName: g.gameSession.name,
        netResult: g.netResult,
        cumulativeProfit,
      };
    });
  }

  async updateProfile(userId: string, data: { username?: string; avatarData?: string | null }) {
    if (data.username) {
      const existing = await prisma.user.findFirst({
        where: {
          username: data.username,
          NOT: { id: userId },
        },
      });

      if (existing) {
        throw new AppError('Username already taken', 400, 'USERNAME_EXISTS');
      }
    }

    // Validate avatar size if provided (max ~2MB after base64 decode)
    if (data.avatarData && data.avatarData.length > 2800000) {
      throw new AppError('Avatar image is too large. Max size is 2MB.', 400, 'AVATAR_TOO_LARGE');
    }

    return prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.username !== undefined && { username: data.username }),
        ...(data.avatarData !== undefined && { avatarData: data.avatarData }),
      },
      select: {
        id: true,
        email: true,
        username: true,
        chipBalance: true,
        avatarData: true,
        createdAt: true,
      },
    });
  }
}

export const userService = new UserService();
