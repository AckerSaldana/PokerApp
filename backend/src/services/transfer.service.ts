import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/error.middleware';
import { CreateTransferInput } from '../validators/transfer.validator';

const MAX_TRANSFER_AMOUNT = 100;

export class TransferService {
  async createTransfer(senderId: string, data: CreateTransferInput) {
    const { receiverId, amount, note } = data;

    if (amount <= 0 || amount > MAX_TRANSFER_AMOUNT) {
      throw new AppError(
        `Transfer amount must be between 1 and ${MAX_TRANSFER_AMOUNT}`,
        400,
        'INVALID_AMOUNT'
      );
    }

    if (senderId === receiverId) {
      throw new AppError('Cannot transfer chips to yourself', 400, 'SELF_TRANSFER');
    }

    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
    });

    if (!receiver) {
      throw new AppError('Receiver not found', 404, 'RECEIVER_NOT_FOUND');
    }

    return prisma.$transaction(async (tx) => {
      const sender = await tx.user.findUnique({
        where: { id: senderId },
        select: { chipBalance: true, username: true },
      });

      if (!sender || sender.chipBalance < amount) {
        throw new AppError('Insufficient chip balance', 400, 'INSUFFICIENT_BALANCE');
      }

      await tx.user.update({
        where: { id: senderId },
        data: { chipBalance: { decrement: amount } },
      });

      await tx.user.update({
        where: { id: receiverId },
        data: { chipBalance: { increment: amount } },
      });

      const transfer = await tx.chipTransfer.create({
        data: {
          senderId,
          receiverId,
          amount,
          note,
          status: 'COMPLETED',
        },
        include: {
          sender: { select: { id: true, username: true } },
          receiver: { select: { id: true, username: true } },
        },
      });

      const updatedSender = await tx.user.findUnique({
        where: { id: senderId },
        select: { chipBalance: true },
      });

      return {
        transfer,
        newBalance: updatedSender?.chipBalance,
      };
    });
  }

  async getTransfers(userId: string, page = 1, limit = 20) {
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

    return { transfers, total, page, limit };
  }

  async getTransferById(transferId: string, userId: string) {
    const transfer = await prisma.chipTransfer.findUnique({
      where: { id: transferId },
      include: {
        sender: { select: { id: true, username: true } },
        receiver: { select: { id: true, username: true } },
      },
    });

    if (!transfer) {
      throw new AppError('Transfer not found', 404, 'TRANSFER_NOT_FOUND');
    }

    if (transfer.senderId !== userId && transfer.receiverId !== userId) {
      throw new AppError('Access denied', 403, 'FORBIDDEN');
    }

    return transfer;
  }

  // Get transfer history between two specific users
  async getTransfersBetweenUsers(userId1: string, userId2: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [transfers, total] = await Promise.all([
      prisma.chipTransfer.findMany({
        where: {
          OR: [
            { senderId: userId1, receiverId: userId2 },
            { senderId: userId2, receiverId: userId1 },
          ],
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
          OR: [
            { senderId: userId1, receiverId: userId2 },
            { senderId: userId2, receiverId: userId1 },
          ],
        },
      }),
    ]);

    // Calculate totals
    const allTransfers = await prisma.chipTransfer.findMany({
      where: {
        OR: [
          { senderId: userId1, receiverId: userId2 },
          { senderId: userId2, receiverId: userId1 },
        ],
      },
      select: { senderId: true, amount: true },
    });

    const user1Sent = allTransfers
      .filter(t => t.senderId === userId1)
      .reduce((sum, t) => sum + t.amount, 0);
    const user2Sent = allTransfers
      .filter(t => t.senderId === userId2)
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      transfers,
      total,
      page,
      limit,
      summary: {
        user1TotalSent: user1Sent,
        user2TotalSent: user2Sent,
        netBalance: user2Sent - user1Sent, // Positive means user1 owes user2
      },
    };
  }

  // Get leaderboard of users who transferred the most chips
  async getTransferLeaderboard(limit = 20) {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        transfersSent: {
          select: { amount: true },
        },
        transfersReceived: {
          select: { amount: true },
        },
      },
    });

    const ranked = users
      .map(user => {
        const totalSent = user.transfersSent.reduce((sum, t) => sum + t.amount, 0);
        const totalReceived = user.transfersReceived.reduce((sum, t) => sum + t.amount, 0);
        const totalTransferred = totalSent + totalReceived;

        return {
          userId: user.id,
          username: user.username,
          totalSent,
          totalReceived,
          totalTransferred,
          transfersSentCount: user.transfersSent.length,
          transfersReceivedCount: user.transfersReceived.length,
        };
      })
      .sort((a, b) => b.totalTransferred - a.totalTransferred)
      .slice(0, limit)
      .map((user, index) => ({ rank: index + 1, ...user }));

    return { leaderboard: ranked };
  }
}

export const transferService = new TransferService();
