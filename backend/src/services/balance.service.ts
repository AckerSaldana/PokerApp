import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/error.middleware';
import { achievementService } from './achievement.service';
import { eventService } from './event.service';

const WEEKLY_CHIP_BONUS = 100;
const WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;
const DAY_IN_MS = 24 * 60 * 60 * 1000;
const DAILY_BASE_BONUS = 10;
const DAILY_STREAK_BONUS = 5;
const MAX_STREAK_BONUS = 50;

export class BalanceService {
  async getBalanceWithWeeklyBonus(userId: string) {
    return prisma.$transaction(
      async (tx) => {
        // Lock user row to prevent concurrent bonus claims
        const users = await tx.$queryRaw<
          Array<{ id: string; chipBalance: number; lastWeeklyCredit: Date }>
        >`
          SELECT id, "chipBalance", "lastWeeklyCredit" FROM "User" WHERE id = ${userId} FOR UPDATE
        `;

        const user = users[0];
        if (!user) {
          throw new AppError('User not found', 404, 'USER_NOT_FOUND');
        }

        const now = new Date();
        const lastCredit = new Date(user.lastWeeklyCredit);
        const timeDiff = now.getTime() - lastCredit.getTime();
        const weeksPassed = Math.floor(timeDiff / WEEK_IN_MS);

        if (weeksPassed > 0) {
          const bonusChips = weeksPassed * WEEKLY_CHIP_BONUS;

          const updated = await tx.user.update({
            where: { id: userId },
            data: {
              chipBalance: { increment: bonusChips },
              lastWeeklyCredit: now,
            },
            select: { chipBalance: true, lastWeeklyCredit: true },
          });

          return {
            balance: updated.chipBalance,
            weeksAdded: weeksPassed,
            bonusChips,
            lastWeeklyCredit: updated.lastWeeklyCredit,
            nextBonusAt: new Date(now.getTime() + WEEK_IN_MS),
          };
        }

        return {
          balance: user.chipBalance,
          weeksAdded: 0,
          bonusChips: 0,
          lastWeeklyCredit: user.lastWeeklyCredit,
          nextBonusAt: new Date(lastCredit.getTime() + WEEK_IN_MS),
        };
      },
      {
        isolationLevel: 'Serializable',
      }
    );
  }

  async claimDailyBonus(userId: string) {
    return prisma.$transaction(
      async (tx) => {
        const users = await tx.$queryRaw<
          Array<{
            id: string;
            chipBalance: number;
            loginStreak: number;
            lastLoginDate: Date | null;
          }>
        >`
          SELECT id, "chipBalance", "loginStreak", "lastLoginDate"
          FROM "User" WHERE id = ${userId} FOR UPDATE
        `;

        const user = users[0];
        if (!user) {
          throw new AppError('User not found', 404, 'USER_NOT_FOUND');
        }

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const lastLogin = user.lastLoginDate ? new Date(user.lastLoginDate) : null;
        const lastLoginDay = lastLogin
          ? new Date(lastLogin.getFullYear(), lastLogin.getMonth(), lastLogin.getDate())
          : null;

        // Check if already claimed today
        if (lastLoginDay && lastLoginDay.getTime() === today.getTime()) {
          const nextClaimAt = new Date(today.getTime() + DAY_IN_MS);
          return {
            claimed: false,
            alreadyClaimed: true,
            currentStreak: user.loginStreak,
            nextClaimAt,
            balance: user.chipBalance,
          };
        }

        // Calculate streak
        let newStreak: number;
        if (lastLoginDay) {
          const daysSinceLastLogin = Math.floor(
            (today.getTime() - lastLoginDay.getTime()) / DAY_IN_MS
          );
          // Consecutive day = increment streak, otherwise reset
          newStreak = daysSinceLastLogin === 1 ? user.loginStreak + 1 : 1;
        } else {
          newStreak = 1;
        }

        // Calculate base bonus: base + streak bonus (capped)
        const streakBonus = Math.min(newStreak * DAILY_STREAK_BONUS, MAX_STREAK_BONUS);
        const baseBonus = DAILY_BASE_BONUS + streakBonus;

        // Get active event multiplier
        const eventMultiplier = await eventService.getActiveMultiplier(userId, 'daily');
        const bonusAmount = Math.floor(baseBonus * eventMultiplier.multiplier) + eventMultiplier.bonusChips;

        const updated = await tx.user.update({
          where: { id: userId },
          data: {
            chipBalance: { increment: bonusAmount },
            loginStreak: newStreak,
            lastLoginDate: now,
          },
          select: { chipBalance: true, loginStreak: true, lastLoginDate: true },
        });

        // Record event participation if there was an active event
        if (eventMultiplier.event && (eventMultiplier.multiplier > 1 || eventMultiplier.bonusChips > 0)) {
          const eventBonus = bonusAmount - baseBonus;
          await eventService.recordEventParticipation(userId, eventMultiplier.event.id, eventBonus);
        }

        // Check for streak achievements after successful claim (non-blocking)
        achievementService.checkAndUnlockAchievements(userId).catch((error) => {
          console.error('Failed to check achievements after daily bonus:', error);
        });

        return {
          claimed: true,
          alreadyClaimed: false,
          bonusAmount,
          baseBonus,
          eventMultiplier: eventMultiplier.multiplier,
          eventBonusChips: eventMultiplier.bonusChips,
          activeEvent: eventMultiplier.event,
          currentStreak: updated.loginStreak,
          nextClaimAt: new Date(today.getTime() + DAY_IN_MS),
          balance: updated.chipBalance,
        };
      },
      { isolationLevel: 'Serializable' }
    );
  }

  async getDailyBonusStatus(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { chipBalance: true, loginStreak: true, lastLoginDate: true },
    });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastLogin = user.lastLoginDate ? new Date(user.lastLoginDate) : null;
    const lastLoginDay = lastLogin
      ? new Date(lastLogin.getFullYear(), lastLogin.getMonth(), lastLogin.getDate())
      : null;

    const canClaim = !lastLoginDay || lastLoginDay.getTime() !== today.getTime();
    const nextClaimAt = canClaim ? now : new Date(today.getTime() + DAY_IN_MS);

    // Calculate next bonus amount
    let nextStreak = user.loginStreak;
    if (canClaim && lastLoginDay) {
      const daysSinceLastLogin = Math.floor(
        (today.getTime() - lastLoginDay.getTime()) / DAY_IN_MS
      );
      nextStreak = daysSinceLastLogin === 1 ? user.loginStreak + 1 : 1;
    } else if (canClaim) {
      nextStreak = 1;
    }
    const streakBonus = Math.min(nextStreak * DAILY_STREAK_BONUS, MAX_STREAK_BONUS);
    const nextBonusAmount = DAILY_BASE_BONUS + streakBonus;

    return {
      canClaim,
      currentStreak: user.loginStreak,
      nextBonusAmount,
      nextClaimAt,
      balance: user.chipBalance,
    };
  }

  async spinLuckyWheel(userId: string) {
    return prisma.$transaction(
      async (tx) => {
        const users = await tx.$queryRaw<
          Array<{ id: string; chipBalance: number; lastSpinDate: Date | null }>
        >`
          SELECT id, "chipBalance", "lastSpinDate"
          FROM "User" WHERE id = ${userId} FOR UPDATE
        `;

        const user = users[0];
        if (!user) {
          throw new AppError('User not found', 404, 'USER_NOT_FOUND');
        }

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const lastSpin = user.lastSpinDate ? new Date(user.lastSpinDate) : null;
        const lastSpinDay = lastSpin
          ? new Date(lastSpin.getFullYear(), lastSpin.getMonth(), lastSpin.getDate())
          : null;

        // Check if already spun today
        if (lastSpinDay && lastSpinDay.getTime() === today.getTime()) {
          return {
            canSpin: false,
            nextSpinAt: new Date(today.getTime() + DAY_IN_MS),
            balance: user.chipBalance,
          };
        }

        // Generate weighted random result
        const roll = Math.random();
        let baseResult: number;
        if (roll < 0.40) {
          // 40%: 0-10 chips (common)
          baseResult = Math.floor(Math.random() * 11);
        } else if (roll < 0.75) {
          // 35%: 11-25 chips (uncommon)
          baseResult = 11 + Math.floor(Math.random() * 15);
        } else if (roll < 0.95) {
          // 20%: 26-50 chips (rare)
          baseResult = 26 + Math.floor(Math.random() * 25);
        } else {
          // 5%: 51-100 chips (jackpot)
          baseResult = 51 + Math.floor(Math.random() * 50);
        }

        // Get active event multiplier
        const eventMultiplier = await eventService.getActiveMultiplier(userId, 'spin');
        const result = Math.floor(baseResult * eventMultiplier.multiplier) + eventMultiplier.bonusChips;

        const updated = await tx.user.update({
          where: { id: userId },
          data: {
            chipBalance: { increment: result },
            lastSpinDate: now,
          },
          select: { chipBalance: true },
        });

        // Record event participation if there was an active event
        if (eventMultiplier.event && (eventMultiplier.multiplier > 1 || eventMultiplier.bonusChips > 0)) {
          const eventBonus = result - baseResult;
          await eventService.recordEventParticipation(userId, eventMultiplier.event.id, eventBonus);
        }

        return {
          canSpin: true,
          result,
          baseResult,
          eventMultiplier: eventMultiplier.multiplier,
          eventBonusChips: eventMultiplier.bonusChips,
          activeEvent: eventMultiplier.event,
          balance: updated.chipBalance,
          nextSpinAt: new Date(today.getTime() + DAY_IN_MS),
        };
      },
      { isolationLevel: 'Serializable' }
    );
  }

  async getSpinStatus(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { chipBalance: true, lastSpinDate: true },
    });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastSpin = user.lastSpinDate ? new Date(user.lastSpinDate) : null;
    const lastSpinDay = lastSpin
      ? new Date(lastSpin.getFullYear(), lastSpin.getMonth(), lastSpin.getDate())
      : null;

    const canSpin = !lastSpinDay || lastSpinDay.getTime() !== today.getTime();
    const nextSpinAt = canSpin ? now : new Date(today.getTime() + DAY_IN_MS);

    return {
      canSpin,
      nextSpinAt,
      balance: user.chipBalance,
    };
  }

  async getHistory(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [transfers, total] = await Promise.all([
      prisma.chipTransfer.findMany({
        where: {
          OR: [{ senderId: userId }, { receiverId: userId }],
        },
        include: {
          sender: { select: { id: true, username: true, avatarData: true } },
          receiver: { select: { id: true, username: true, avatarData: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.chipTransfer.count({
        where: {
          OR: [{ senderId: userId }, { receiverId: userId }],
        },
      }),
    ]);

    const history = transfers.map((t) => ({
      id: t.id,
      type: t.senderId === userId ? 'sent' : 'received',
      amount: t.amount,
      note: t.note,
      otherUser: t.senderId === userId ? t.receiver : t.sender,
      createdAt: t.createdAt,
    }));

    return { history, total, page, limit };
  }
}

export const balanceService = new BalanceService();
