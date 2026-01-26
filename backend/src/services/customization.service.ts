import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/error.middleware';

export class CustomizationService {
  // Get all frames with user's unlock status
  async getUserFrames(userId: string) {
    const frames = await prisma.avatarFrame.findMany({
      orderBy: [{ rarity: 'asc' }, { sortOrder: 'asc' }],
      include: {
        userFrames: {
          where: { userId },
        },
      },
    });

    return frames.map((frame) => ({
      id: frame.id,
      key: frame.key,
      name: frame.name,
      description: frame.description,
      rarity: frame.rarity,
      cssClass: frame.cssClass,
      unlockType: frame.unlockType,
      requirement: frame.requirement,
      isUnlocked: frame.userFrames.length > 0,
      unlockedAt: frame.userFrames[0]?.unlockedAt || null,
    }));
  }

  // Get all titles with user's unlock status
  async getUserTitles(userId: string) {
    const titles = await prisma.profileTitle.findMany({
      orderBy: [{ rarity: 'asc' }, { sortOrder: 'asc' }],
      include: {
        userTitles: {
          where: { userId },
        },
      },
    });

    return titles.map((title) => ({
      id: title.id,
      key: title.key,
      name: title.name,
      description: title.description,
      rarity: title.rarity,
      color: title.color,
      unlockType: title.unlockType,
      requirement: title.requirement,
      isUnlocked: title.userTitles.length > 0,
      unlockedAt: title.userTitles[0]?.unlockedAt || null,
    }));
  }

  // Equip a frame
  async equipFrame(userId: string, frameId: string | null) {
    if (frameId) {
      // Verify user owns this frame
      const userFrame = await prisma.userAvatarFrame.findUnique({
        where: { userId_frameId: { userId, frameId } },
      });

      if (!userFrame) {
        throw new AppError('You do not own this frame', 403, 'FRAME_NOT_OWNED');
      }
    }

    // Update user's equipped frame (null = unequip)
    await prisma.user.update({
      where: { id: userId },
      data: { equippedFrameId: frameId },
    });

    return { equipped: true, frameId };
  }

  // Equip a title
  async equipTitle(userId: string, titleId: string | null) {
    if (titleId) {
      // Verify user owns this title
      const userTitle = await prisma.userProfileTitle.findUnique({
        where: { userId_titleId: { userId, titleId } },
      });

      if (!userTitle) {
        throw new AppError('You do not own this title', 403, 'TITLE_NOT_OWNED');
      }
    }

    // Update user's equipped title (null = unequip)
    await prisma.user.update({
      where: { id: userId },
      data: { equippedTitleId: titleId },
    });

    return { equipped: true, titleId };
  }

  // Check and unlock items based on achievement keys
  async checkAndUnlockItems(userId: string, achievementKeys: string[]): Promise<{
    newFrames: string[];
    newTitles: string[];
  }> {
    const newFrames: string[] = [];
    const newTitles: string[] = [];

    // Check frames that should unlock
    const framesToUnlock = await prisma.avatarFrame.findMany({
      where: {
        unlockType: 'ACHIEVEMENT',
        requirement: { in: achievementKeys },
      },
    });

    for (const frame of framesToUnlock) {
      // Check if user already has this frame
      const existing = await prisma.userAvatarFrame.findUnique({
        where: { userId_frameId: { userId, frameId: frame.id } },
      });

      if (!existing) {
        await prisma.userAvatarFrame.create({
          data: { userId, frameId: frame.id },
        });
        newFrames.push(frame.key);
      }
    }

    // Check titles that should unlock
    const titlesToUnlock = await prisma.profileTitle.findMany({
      where: {
        unlockType: 'ACHIEVEMENT',
        requirement: { in: achievementKeys },
      },
    });

    for (const title of titlesToUnlock) {
      // Check if user already has this title
      const existing = await prisma.userProfileTitle.findUnique({
        where: { userId_titleId: { userId, titleId: title.id } },
      });

      if (!existing) {
        await prisma.userProfileTitle.create({
          data: { userId, titleId: title.id },
        });
        newTitles.push(title.key);
      }
    }

    return { newFrames, newTitles };
  }

  // Auto-unlock default items for new users
  async unlockDefaultItems(userId: string) {
    // Unlock default frame
    const defaultFrame = await prisma.avatarFrame.findFirst({
      where: { unlockType: 'DEFAULT' },
    });

    if (defaultFrame) {
      await prisma.userAvatarFrame.create({
        data: { userId, frameId: defaultFrame.id },
      });
    }

    // Unlock default title
    const defaultTitle = await prisma.profileTitle.findFirst({
      where: { unlockType: 'DEFAULT' },
    });

    if (defaultTitle) {
      await prisma.userProfileTitle.create({
        data: { userId, titleId: defaultTitle.id },
      });
    }
  }
}

export const customizationService = new CustomizationService();
