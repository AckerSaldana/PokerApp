import { PrismaClient, FrameRarity, TitleRarity, UnlockType } from '@prisma/client';

const prisma = new PrismaClient();

const avatarFrames = [
  // COMMON (Default + Early)
  {
    key: 'basic_frame',
    name: 'Basic Frame',
    description: 'Your starting frame',
    rarity: FrameRarity.COMMON,
    cssClass: 'ring-2 ring-zinc-600',
    unlockType: UnlockType.DEFAULT,
    requirement: 'default',
    sortOrder: 1,
  },
  {
    key: 'bronze_frame',
    name: 'Bronze Frame',
    description: 'Unlocked by playing your first game',
    rarity: FrameRarity.COMMON,
    cssClass: 'ring-2 ring-amber-700',
    unlockType: UnlockType.ACHIEVEMENT,
    requirement: 'first_game',
    sortOrder: 2,
  },
  {
    key: 'silver_frame',
    name: 'Silver Frame',
    description: 'Unlocked after 10 games',
    rarity: FrameRarity.COMMON,
    cssClass: 'ring-2 ring-zinc-400',
    unlockType: UnlockType.ACHIEVEMENT,
    requirement: 'games_10',
    sortOrder: 3,
  },

  // RARE (Mid-tier achievements)
  {
    key: 'gold_frame',
    name: 'Gold Frame',
    description: 'Unlocked after 50 games',
    rarity: FrameRarity.RARE,
    cssClass: 'ring-3 ring-amber-400 shadow-lg shadow-amber-400/20',
    unlockType: UnlockType.ACHIEVEMENT,
    requirement: 'games_50',
    sortOrder: 4,
  },
  {
    key: 'emerald_frame',
    name: 'Emerald Frame',
    description: 'Earn 1,000 total chips',
    rarity: FrameRarity.RARE,
    cssClass: 'ring-3 ring-emerald-400 shadow-lg shadow-emerald-400/20',
    unlockType: UnlockType.ACHIEVEMENT,
    requirement: 'winnings_1000',
    sortOrder: 5,
  },
  {
    key: 'fire_frame',
    name: 'Fire Frame',
    description: 'Win 3 games in a row',
    rarity: FrameRarity.RARE,
    cssClass: 'ring-3 ring-orange-400 shadow-lg shadow-orange-400/20',
    unlockType: UnlockType.ACHIEVEMENT,
    requirement: 'hot_hand',
    sortOrder: 6,
  },
  {
    key: 'sapphire_frame',
    name: 'Sapphire Frame',
    description: 'Maintain a 7-day login streak',
    rarity: FrameRarity.RARE,
    cssClass: 'ring-3 ring-blue-400 shadow-lg shadow-blue-400/20',
    unlockType: UnlockType.ACHIEVEMENT,
    requirement: 'streak_7',
    sortOrder: 7,
  },

  // EPIC (High-tier achievements)
  {
    key: 'ruby_frame',
    name: 'Ruby Frame',
    description: 'Win a game with 500+ chips',
    rarity: FrameRarity.EPIC,
    cssClass: 'ring-4 ring-red-500 shadow-xl shadow-red-500/30',
    unlockType: UnlockType.ACHIEVEMENT,
    requirement: 'big_win_500',
    sortOrder: 8,
  },
  {
    key: 'diamond_frame',
    name: 'Diamond Frame',
    description: 'Earn 5,000 total chips',
    rarity: FrameRarity.EPIC,
    cssClass: 'ring-4 ring-cyan-400 shadow-xl shadow-cyan-400/30',
    unlockType: UnlockType.ACHIEVEMENT,
    requirement: 'winnings_5000',
    sortOrder: 9,
  },
  {
    key: 'platinum_frame',
    name: 'Platinum Frame',
    description: 'Play 100 games',
    rarity: FrameRarity.EPIC,
    cssClass: 'ring-4 ring-zinc-300 shadow-xl shadow-zinc-300/30',
    unlockType: UnlockType.ACHIEVEMENT,
    requirement: 'games_100',
    sortOrder: 10,
  },
  {
    key: 'unstoppable_frame',
    name: 'Unstoppable Frame',
    description: 'Win 10 games in a row',
    rarity: FrameRarity.EPIC,
    cssClass: 'ring-4 ring-purple-500 shadow-xl shadow-purple-500/30',
    unlockType: UnlockType.ACHIEVEMENT,
    requirement: 'unstoppable',
    sortOrder: 11,
  },

  // LEGENDARY (Ultra-rare)
  {
    key: 'legend_frame',
    name: 'Legend Frame',
    description: 'Win a game with 1,000+ chips',
    rarity: FrameRarity.LEGENDARY,
    cssClass: 'ring-4 ring-gradient-to-r from-purple-500 via-pink-500 to-red-500 shadow-2xl shadow-purple-500/50 animate-pulse',
    unlockType: UnlockType.ACHIEVEMENT,
    requirement: 'big_win_1000',
    sortOrder: 12,
  },
  {
    key: 'immortal_frame',
    name: 'Immortal Frame',
    description: 'Maintain a 100-day login streak',
    rarity: FrameRarity.LEGENDARY,
    cssClass: 'ring-4 ring-gradient-to-r from-yellow-400 via-orange-500 to-red-500 shadow-2xl shadow-yellow-400/50 animate-pulse',
    unlockType: UnlockType.ACHIEVEMENT,
    requirement: 'streak_100',
    sortOrder: 13,
  },
  {
    key: 'champion_frame',
    name: 'Champion Frame',
    description: 'Earn 10,000 total chips',
    rarity: FrameRarity.LEGENDARY,
    cssClass: 'ring-4 ring-gradient-to-r from-amber-400 via-yellow-500 to-amber-400 shadow-2xl shadow-amber-400/50 animate-pulse',
    unlockType: UnlockType.ACHIEVEMENT,
    requirement: 'winnings_10000',
    sortOrder: 14,
  },
  {
    key: 'legendary_streak_frame',
    name: 'Legendary Streak Frame',
    description: 'Win 15 games in a row',
    rarity: FrameRarity.LEGENDARY,
    cssClass: 'ring-4 ring-gradient-to-r from-orange-400 via-red-500 to-pink-500 shadow-2xl shadow-red-500/50 animate-pulse',
    unlockType: UnlockType.ACHIEVEMENT,
    requirement: 'legendary_streak',
    sortOrder: 15,
  },
];

const profileTitles = [
  // COMMON (Default + Early)
  {
    key: 'rookie',
    name: 'Rookie',
    description: 'Your starting title',
    rarity: TitleRarity.COMMON,
    color: 'text-zinc-400',
    unlockType: UnlockType.DEFAULT,
    requirement: 'default',
    sortOrder: 1,
  },
  {
    key: 'card_player',
    name: 'Card Player',
    description: 'Played your first game',
    rarity: TitleRarity.COMMON,
    color: 'text-zinc-300',
    unlockType: UnlockType.ACHIEVEMENT,
    requirement: 'first_game',
    sortOrder: 2,
  },
  {
    key: 'regular',
    name: 'Regular',
    description: 'Played 10 games',
    rarity: TitleRarity.COMMON,
    color: 'text-blue-400',
    unlockType: UnlockType.ACHIEVEMENT,
    requirement: 'games_10',
    sortOrder: 3,
  },

  // RARE (Mid-tier)
  {
    key: 'veteran',
    name: 'Veteran',
    description: 'Played 50 games',
    rarity: TitleRarity.RARE,
    color: 'text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600',
    unlockType: UnlockType.ACHIEVEMENT,
    requirement: 'games_50',
    sortOrder: 4,
  },
  {
    key: 'chip_collector',
    name: 'Chip Collector',
    description: 'Earned 1,000 chips',
    rarity: TitleRarity.RARE,
    color: 'text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400',
    unlockType: UnlockType.ACHIEVEMENT,
    requirement: 'winnings_1000',
    sortOrder: 5,
  },
  {
    key: 'hot_hand',
    name: 'Hot Hand',
    description: 'Win 3 games in a row',
    rarity: TitleRarity.RARE,
    color: 'text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400',
    unlockType: UnlockType.ACHIEVEMENT,
    requirement: 'hot_hand',
    sortOrder: 6,
  },
  {
    key: 'dedicated',
    name: 'Dedicated',
    description: 'Maintained a 7-day streak',
    rarity: TitleRarity.RARE,
    color: 'text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400',
    unlockType: UnlockType.ACHIEVEMENT,
    requirement: 'streak_7',
    sortOrder: 7,
  },

  // EPIC (High-tier)
  {
    key: 'big_winner',
    name: 'Big Winner',
    description: 'Won 500+ chips in one game',
    rarity: TitleRarity.EPIC,
    color: 'text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-pink-400 to-red-400',
    unlockType: UnlockType.ACHIEVEMENT,
    requirement: 'big_win_500',
    sortOrder: 8,
  },
  {
    key: 'high_roller',
    name: 'High Roller',
    description: 'Earned 5,000 chips',
    rarity: TitleRarity.EPIC,
    color: 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400',
    unlockType: UnlockType.ACHIEVEMENT,
    requirement: 'winnings_5000',
    sortOrder: 9,
  },
  {
    key: 'on_fire',
    name: 'On Fire',
    description: 'Win 5 games in a row',
    rarity: TitleRarity.EPIC,
    color: 'text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-orange-400',
    unlockType: UnlockType.ACHIEVEMENT,
    requirement: 'on_fire',
    sortOrder: 10,
  },
  {
    key: 'marathon_master',
    name: 'Marathon Master',
    description: 'Maintained a 30-day streak',
    rarity: TitleRarity.EPIC,
    color: 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400',
    unlockType: UnlockType.ACHIEVEMENT,
    requirement: 'streak_30',
    sortOrder: 11,
  },

  // LEGENDARY (Ultra-rare)
  {
    key: 'poker_legend',
    name: 'Poker Legend',
    description: 'Played 100 games',
    rarity: TitleRarity.LEGENDARY,
    color: 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]',
    unlockType: UnlockType.ACHIEVEMENT,
    requirement: 'games_100',
    sortOrder: 12,
  },
  {
    key: 'chip_king',
    name: 'Chip King',
    description: 'Earned 10,000 chips',
    rarity: TitleRarity.LEGENDARY,
    color: 'text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]',
    unlockType: UnlockType.ACHIEVEMENT,
    requirement: 'winnings_10000',
    sortOrder: 13,
  },
  {
    key: 'unstoppable',
    name: 'Unstoppable',
    description: 'Win 10 games in a row',
    rarity: TitleRarity.LEGENDARY,
    color: 'text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-pink-500 to-purple-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]',
    unlockType: UnlockType.ACHIEVEMENT,
    requirement: 'unstoppable',
    sortOrder: 14,
  },
  {
    key: 'immortal',
    name: 'Immortal',
    description: 'Maintained a 100-day streak',
    rarity: TitleRarity.LEGENDARY,
    color: 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]',
    unlockType: UnlockType.ACHIEVEMENT,
    requirement: 'streak_100',
    sortOrder: 15,
  },
];

async function main() {
  console.log('Seeding avatar frames...');

  for (const frame of avatarFrames) {
    await prisma.avatarFrame.upsert({
      where: { key: frame.key },
      update: frame,
      create: frame,
    });
  }

  console.log(`Seeded ${avatarFrames.length} avatar frames`);

  console.log('Seeding profile titles...');

  for (const title of profileTitles) {
    await prisma.profileTitle.upsert({
      where: { key: title.key },
      update: title,
      create: title,
    });
  }

  console.log(`Seeded ${profileTitles.length} profile titles`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
