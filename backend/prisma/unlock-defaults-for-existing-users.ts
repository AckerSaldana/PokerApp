import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function unlockDefaultsForExistingUsers() {
  console.log('🔓 Unlocking default items for existing users...');

  // Get all users
  const users = await prisma.user.findMany({
    select: { id: true, username: true },
  });

  console.log(`Found ${users.length} users`);

  // Get all default frames and titles
  const [defaultFrames, defaultTitles] = await Promise.all([
    prisma.avatarFrame.findMany({
      where: { unlockType: 'DEFAULT' },
    }),
    prisma.profileTitle.findMany({
      where: { unlockType: 'DEFAULT' },
    }),
  ]);

  console.log(`Found ${defaultFrames.length} default frames and ${defaultTitles.length} default titles`);

  let unlockedCount = 0;

  for (const user of users) {
    // Unlock default frames
    for (const frame of defaultFrames) {
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
        unlockedCount++;
        console.log(`  ✓ Unlocked "${frame.name}" for ${user.username}`);
      }
    }

    // Unlock default titles
    for (const title of defaultTitles) {
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
        unlockedCount++;
        console.log(`  ✓ Unlocked "${title.name}" for ${user.username}`);
      }
    }
  }

  console.log(`\n✅ Unlocked ${unlockedCount} items total!`);
}

unlockDefaultsForExistingUsers()
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
