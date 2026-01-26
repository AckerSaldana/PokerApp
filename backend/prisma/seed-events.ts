import { PrismaClient, EventType } from '@prisma/client';

const prisma = new PrismaClient();

async function seedEvents() {
  console.log('🎉 Seeding FOMO events...');

  // Get tomorrow's date to avoid immediate activation
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const events = [
    // Happy Hour - Daily 6-7pm (2x multiplier)
    {
      key: 'happy_hour',
      name: 'Happy Hour',
      description: 'Double your daily bonus and spin rewards! Active 6-7pm every weekday.',
      type: EventType.HAPPY_HOUR,
      startTime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 18, 0, 0), // 6pm
      endTime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 19, 0, 0), // 7pm
      isActive: false,
      multiplier: 2.0,
      bonusChips: 0,
      iconEmoji: '🍺',
      bannerColor: '#f97316', // Orange
      priority: 2,
    },

    // Weekend Bonanza - Saturday-Sunday (+50 chips bonus)
    {
      key: 'weekend_bonanza',
      name: 'Weekend Bonanza',
      description: 'Enjoy +50 bonus chips on your lucky wheel spins all weekend long!',
      type: EventType.WEEKEND_BONANZA,
      startTime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 0, 0, 0),
      endTime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate() + 2, 23, 59, 59),
      isActive: false,
      multiplier: 1.0,
      bonusChips: 50,
      iconEmoji: '🎊',
      bannerColor: '#8b5cf6', // Purple
      priority: 3,
    },

    // Flash Bonus - Random 30-minute bursts (3x multiplier)
    {
      key: 'flash_bonus',
      name: 'Flash Bonus',
      description: 'Lightning-fast bonus! 3x rewards for the next 30 minutes only!',
      type: EventType.FLASH_BONUS,
      startTime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 14, 0, 0), // 2pm
      endTime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 14, 30, 0), // 2:30pm
      isActive: false,
      multiplier: 3.0,
      bonusChips: 0,
      iconEmoji: '⚡',
      bannerColor: '#eab308', // Yellow
      priority: 4,
    },

    // Midnight Madness - Daily 11pm-12am (1.5x + 25 chips)
    {
      key: 'midnight_madness',
      name: 'Midnight Madness',
      description: 'Night owls rejoice! 1.5x multiplier + 25 bonus chips every night!',
      type: EventType.MILESTONE_BOOST,
      startTime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 23, 0, 0), // 11pm
      endTime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate() + 1, 0, 0, 0), // 12am
      isActive: false,
      multiplier: 1.5,
      bonusChips: 25,
      iconEmoji: '🌙',
      bannerColor: '#6366f1', // Indigo
      priority: 1,
    },
  ];

  for (const event of events) {
    await prisma.event.upsert({
      where: { key: event.key },
      update: event,
      create: event,
    });
  }

  console.log(`✅ Seeded ${events.length} events successfully!`);
}

seedEvents()
  .catch((error) => {
    console.error('❌ Error seeding events:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
