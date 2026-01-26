import { prisma } from '../lib/prisma';
import { AchievementCategory } from '@prisma/client';

interface UserProgress {
  totalGames: number;
  totalWinnings: number;
  wins: number;
  biggestWin: number;
  transfersSent: number;
  transferVolume: number;
  gamesHosted: number;
  loginStreak: number;
}

export class AchievementService {
  // Get all achievements with user's unlock status
  async getUserAchievements(userId: string) {
    const achievements = await prisma.achievement.findMany({
      orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
      include: {
        userAchievements: {
          where: { userId },
        },
      },
    });

    // Get user's progress for calculating progress percentages
    const progress = await this.calculateUserProgress(userId);

    return achievements.map((achievement) => {
      const userAchievement = achievement.userAchievements[0];
      const progressValue = this.getProgressForAchievement(achievement.key, progress);

      return {
        id: achievement.id,
        key: achievement.key,
        name: achievement.name,
        description: achievement.description,
        category: achievement.category,
        tier: achievement.tier,
        icon: achievement.icon,
        threshold: achievement.threshold,
        unlockedAt: userAchievement?.unlockedAt || null,
        isUnlocked: !!userAchievement,
        progress: Math.min(progressValue, achievement.threshold),
        progressPercent: Math.min((progressValue / achievement.threshold) * 100, 100),
      };
    });
  }

  // Get achievements for viewing another user's profile
  async getPublicUserAchievements(userId: string) {
    const achievements = await prisma.achievement.findMany({
      orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
      include: {
        userAchievements: {
          where: { userId },
        },
      },
    });

    return achievements
      .filter((a) => a.userAchievements.length > 0)
      .map((achievement) => ({
        id: achievement.id,
        key: achievement.key,
        name: achievement.name,
        description: achievement.description,
        category: achievement.category,
        tier: achievement.tier,
        icon: achievement.icon,
        unlockedAt: achievement.userAchievements[0].unlockedAt,
      }));
  }

  // Get newly unlocked achievements that haven't been notified
  async getUnnotifiedAchievements(userId: string) {
    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId, notified: false },
      include: {
        achievement: true,
      },
      orderBy: { unlockedAt: 'desc' },
    });

    return userAchievements.map((ua) => ({
      id: ua.achievement.id,
      key: ua.achievement.key,
      name: ua.achievement.name,
      description: ua.achievement.description,
      tier: ua.achievement.tier,
      icon: ua.achievement.icon,
      unlockedAt: ua.unlockedAt,
    }));
  }

  // Mark achievements as notified
  async markAsNotified(userId: string, achievementIds: string[]) {
    await prisma.userAchievement.updateMany({
      where: {
        userId,
        achievementId: { in: achievementIds },
      },
      data: { notified: true },
    });
  }

  // Check and unlock achievements for a user (called after game close)
  async checkAndUnlockAchievements(userId: string): Promise<string[]> {
    const progress = await this.calculateUserProgress(userId);
    const allAchievements = await prisma.achievement.findMany();
    const existingUnlocks = await prisma.userAchievement.findMany({
      where: { userId },
      select: { achievementId: true },
    });
    const existingIds = new Set(existingUnlocks.map((u) => u.achievementId));

    const newUnlocks: string[] = [];

    for (const achievement of allAchievements) {
      if (existingIds.has(achievement.id)) continue;

      const progressValue = this.getProgressForAchievement(achievement.key, progress);
      if (progressValue >= achievement.threshold) {
        await prisma.userAchievement.create({
          data: {
            userId,
            achievementId: achievement.id,
            notified: false,
          },
        });
        newUnlocks.push(achievement.key);
      }
    }

    return newUnlocks;
  }

  // Check achievements after a transfer
  async checkTransferAchievements(userId: string): Promise<string[]> {
    const progress = await this.calculateUserProgress(userId);
    const transferAchievements = await prisma.achievement.findMany({
      where: { category: AchievementCategory.TRANSFERS },
    });
    const existingUnlocks = await prisma.userAchievement.findMany({
      where: { userId },
      select: { achievementId: true },
    });
    const existingIds = new Set(existingUnlocks.map((u) => u.achievementId));

    const newUnlocks: string[] = [];

    for (const achievement of transferAchievements) {
      if (existingIds.has(achievement.id)) continue;

      const progressValue = this.getProgressForAchievement(achievement.key, progress);
      if (progressValue >= achievement.threshold) {
        await prisma.userAchievement.create({
          data: {
            userId,
            achievementId: achievement.id,
            notified: false,
          },
        });
        newUnlocks.push(achievement.key);
      }
    }

    return newUnlocks;
  }

  private async calculateUserProgress(userId: string): Promise<UserProgress> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        loginStreak: true,
        gameSessions: {
          select: { netResult: true },
        },
        transfersSent: {
          select: { amount: true },
        },
        hostedGames: {
          select: { id: true },
        },
      },
    });

    if (!user) {
      return {
        totalGames: 0,
        totalWinnings: 0,
        wins: 0,
        biggestWin: 0,
        transfersSent: 0,
        transferVolume: 0,
        gamesHosted: 0,
        loginStreak: 0,
      };
    }

    const wins = user.gameSessions.filter((g) => g.netResult > 0).length;
    const totalWinnings = user.gameSessions
      .filter((g) => g.netResult > 0)
      .reduce((sum, g) => sum + g.netResult, 0);
    const biggestWin = Math.max(0, ...user.gameSessions.map((g) => g.netResult));
    const transferVolume = user.transfersSent.reduce((sum, t) => sum + t.amount, 0);

    return {
      totalGames: user.gameSessions.length,
      totalWinnings,
      wins,
      biggestWin,
      transfersSent: user.transfersSent.length,
      transferVolume,
      gamesHosted: user.hostedGames.length,
      loginStreak: user.loginStreak,
    };
  }

  private getProgressForAchievement(key: string, progress: UserProgress): number {
    switch (key) {
      // Games
      case 'first_game':
      case 'games_10':
      case 'games_25':
      case 'games_50':
      case 'games_100':
        return progress.totalGames;

      // Winnings (total)
      case 'first_win':
        return progress.wins;
      case 'winnings_500':
      case 'winnings_1000':
      case 'winnings_5000':
      case 'winnings_10000':
        return progress.totalWinnings;

      // Big single wins
      case 'big_win_200':
      case 'big_win_500':
      case 'big_win_1000':
        return progress.biggestWin;

      // Transfers
      case 'first_transfer':
      case 'transfers_10':
      case 'transfers_50':
        return progress.transfersSent;
      case 'transfer_volume_1000':
      case 'transfer_volume_5000':
        return progress.transferVolume;

      // Hosting
      case 'host_first':
      case 'host_10':
      case 'host_25':
        return progress.gamesHosted;

      // Streak achievements
      case 'streak_3':
      case 'streak_7':
      case 'streak_14':
      case 'streak_30':
      case 'streak_60':
      case 'streak_100':
      case 'streak_150':
      case 'streak_200':
      case 'streak_365':
      case 'streak_500':
      case 'streak_1000':
        return progress.loginStreak;

      default:
        return 0;
    }
  }
}

export const achievementService = new AchievementService();
