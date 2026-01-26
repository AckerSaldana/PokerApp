import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function retroactiveUnlockAchievements() {
  console.log('🎯 Retroactively unlocking items based on earned achievements...\n');

  // Get all users with their achievements
  const users = await prisma.user.findMany({
    include: {
      achievements: {
        include: {
          achievement: true,
        },
      },
    },
  });

  console.log(`Found ${users.length} users\n`);

  let totalUnlocked = 0;

  for (const user of users) {
    console.log(`\n👤 Processing ${user.username}...`);

    // Get achievement keys for this user
    const achievementKeys = user.achievements.map(ua => ua.achievement.key);

    if (achievementKeys.length === 0) {
      console.log(`  No achievements yet`);
      continue;
    }

    console.log(`  Has ${achievementKeys.length} achievements: ${achievementKeys.join(', ')}`);

    // Find frames that should be unlocked based on achievements
    const framesToUnlock = await prisma.avatarFrame.findMany({
      where: {
        unlockType: 'ACHIEVEMENT',
        requirement: { in: achievementKeys },
      },
    });

    // Unlock frames
    for (const frame of framesToUnlock) {
      const existing = await prisma.userAvatarFrame.findUnique({
        where: {
          userId_frameId: {
            userId: user.id,
            frameId: frame.id,
          },
        },
      });

      if (!existing) {
        await prisma.userAvatarFrame.create({
          data: {
            userId: user.id,
            frameId: frame.id,
          },
        });
        console.log(`  ✓ Unlocked frame: "${frame.name}" (${frame.requirement})`);
        totalUnlocked++;
      }
    }

    // Find titles that should be unlocked based on achievements
    const titlesToUnlock = await prisma.profileTitle.findMany({
      where: {
        unlockType: 'ACHIEVEMENT',
        requirement: { in: achievementKeys },
      },
    });

    // Unlock titles
    for (const title of titlesToUnlock) {
      const existing = await prisma.userProfileTitle.findUnique({
        where: {
          userId_titleId: {
            userId: user.id,
            titleId: title.id,
          },
        },
      });

      if (!existing) {
        await prisma.userProfileTitle.create({
          data: {
            userId: user.id,
            titleId: title.id,
          },
        });
        console.log(`  ✓ Unlocked title: "${title.name}" (${title.requirement})`);
        totalUnlocked++;
      }
    }
  }

  console.log(`\n\n✅ Done! Unlocked ${totalUnlocked} items total based on achievements.`);
}

retroactiveUnlockAchievements()
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
