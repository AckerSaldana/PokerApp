import { prisma } from '../lib/prisma';

export class LeaderboardService {
  async getAllTimeLeaderboard(limit = 20, offset = 0) {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        avatarData: true,
        chipBalance: true,
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
          },
        },
      },
    });

    const ranked = users
      .map((user) => {
        const stats = user.gameSessions.reduce(
          (acc, session) => ({
            totalWinnings: acc.totalWinnings + session.netResult,
            gamesPlayed: acc.gamesPlayed + 1,
            wins: acc.wins + (session.netResult > 0 ? 1 : 0),
          }),
          { totalWinnings: 0, gamesPlayed: 0, wins: 0 }
        );

        return {
          userId: user.id,
          username: user.username,
          avatarData: user.avatarData,
          chipBalance: user.chipBalance,
          equippedFrameId: user.equippedFrameId,
          equippedTitleId: user.equippedTitleId,
          equippedFrameCss: user.equippedFrame?.cssClass || null,
          equippedTitleName: user.equippedTitle?.name || null,
          equippedTitleColor: user.equippedTitle?.color || null,
          ...stats,
          winRate: stats.gamesPlayed > 0 ? stats.wins / stats.gamesPlayed : 0,
        };
      })
      .sort((a, b) => b.totalWinnings - a.totalWinnings)
      .map((user, index) => ({ rank: index + 1, ...user }));

    return {
      leaderboard: ranked.slice(offset, offset + limit),
      total: ranked.length,
    };
  }

  async getWeeklyLeaderboard(limit = 20, offset = 0) {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        avatarData: true,
        chipBalance: true,
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
          where: {
            gameSession: {
              date: { gte: oneWeekAgo },
            },
          },
          select: {
            netResult: true,
          },
        },
      },
    });

    const ranked = users
      .map((user) => {
        const totalWinnings = user.gameSessions.reduce(
          (sum, session) => sum + session.netResult,
          0
        );
        const gamesPlayed = user.gameSessions.length;

        return {
          userId: user.id,
          username: user.username,
          avatarData: user.avatarData,
          chipBalance: user.chipBalance,
          equippedFrameId: user.equippedFrameId,
          equippedTitleId: user.equippedTitleId,
          equippedFrameCss: user.equippedFrame?.cssClass || null,
          equippedTitleName: user.equippedTitle?.name || null,
          equippedTitleColor: user.equippedTitle?.color || null,
          totalWinnings,
          gamesPlayed,
          wins: user.gameSessions.filter((s) => s.netResult > 0).length,
          winRate: gamesPlayed > 0 ? user.gameSessions.filter((s) => s.netResult > 0).length / gamesPlayed : 0,
        };
      })
      .filter((u) => u.gamesPlayed > 0)
      .sort((a, b) => b.totalWinnings - a.totalWinnings)
      .map((user, index) => ({ rank: index + 1, ...user }));

    return {
      leaderboard: ranked.slice(offset, offset + limit),
      total: ranked.length,
    };
  }

  async getMonthlyLeaderboard(limit = 20, offset = 0) {
    const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        avatarData: true,
        chipBalance: true,
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
          where: {
            gameSession: {
              date: { gte: oneMonthAgo },
            },
          },
          select: {
            netResult: true,
          },
        },
      },
    });

    const ranked = users
      .map((user) => {
        const totalWinnings = user.gameSessions.reduce(
          (sum, session) => sum + session.netResult,
          0
        );
        const gamesPlayed = user.gameSessions.length;

        return {
          userId: user.id,
          username: user.username,
          avatarData: user.avatarData,
          chipBalance: user.chipBalance,
          equippedFrameId: user.equippedFrameId,
          equippedTitleId: user.equippedTitleId,
          equippedFrameCss: user.equippedFrame?.cssClass || null,
          equippedTitleName: user.equippedTitle?.name || null,
          equippedTitleColor: user.equippedTitle?.color || null,
          totalWinnings,
          gamesPlayed,
          wins: user.gameSessions.filter((s) => s.netResult > 0).length,
          winRate: gamesPlayed > 0 ? user.gameSessions.filter((s) => s.netResult > 0).length / gamesPlayed : 0,
        };
      })
      .filter((u) => u.gamesPlayed > 0)
      .sort((a, b) => b.totalWinnings - a.totalWinnings)
      .map((user, index) => ({ rank: index + 1, ...user }));

    return {
      leaderboard: ranked.slice(offset, offset + limit),
      total: ranked.length,
    };
  }
}

export const leaderboardService = new LeaderboardService();
