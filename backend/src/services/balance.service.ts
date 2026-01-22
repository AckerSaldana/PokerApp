import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/error.middleware';

const WEEKLY_CHIP_BONUS = 100;
const WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;

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

  async getHistory(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [transfers, total] = await Promise.all([
      prisma.chipTransfer.findMany({
        where: {
          OR: [{ senderId: userId }, { receiverId: userId }],
        },
        include: {
          sender: { select: { id: true, username: true } },
          receiver: { select: { id: true, username: true } },
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
