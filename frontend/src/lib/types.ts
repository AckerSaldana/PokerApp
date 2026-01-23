export interface User {
  id: string;
  email: string;
  username: string;
  chipBalance: number;
  avatarData?: string | null;
  lastWeeklyCredit?: string;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatarData?: string | null;
  chipBalance: number;
  totalWinnings: number;
  gamesPlayed: number;
  wins?: number;
  winRate: number;
}

export interface Transfer {
  id: string;
  senderId: string;
  receiverId: string;
  amount: number;
  note?: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  sender: { id: string; username: string; avatarData?: string | null };
  receiver: { id: string; username: string; avatarData?: string | null };
}

export interface GameSession {
  id: string;
  name?: string;
  joinCode: string;
  hostId: string;
  date: string;
  notes?: string;
  blind: number;
  isActive: boolean;
  createdAt: string;
  host: { id: string; username: string; avatarData?: string | null };
  participants: GameParticipant[];
}

export interface GameParticipant {
  id: string;
  userId: string;
  gameSessionId: string;
  buyIn: number;
  cashOut: number;
  netResult: number;
  joinedAt: string;
  cashedOutAt: string | null;
  leaveRequestedAt: string | null;
  user: { id: string; username: string; avatarData?: string | null };
}

export interface BalanceInfo {
  balance: number;
  weeksAdded: number;
  bonusChips: number;
  lastWeeklyCredit: string;
  nextBonusAt: string;
}

export interface UserStats {
  user: User;
  gameStats: {
    totalGames: number;
    totalWinnings: number;
    totalBuyIn: number;
    totalCashOut: number;
    wins: number;
    losses: number;
    biggestWin: number;
    biggestLoss: number;
    winRate: number;
    averageResult: number;
  };
  transferStats: {
    totalSent: number;
    totalReceived: number;
    transfersSentCount: number;
    transfersReceivedCount: number;
  };
}

export interface TransfersBetweenUsers {
  transfers: Transfer[];
  total: number;
  page: number;
  limit: number;
  summary: {
    user1TotalSent: number;
    user2TotalSent: number;
    netBalance: number;
  };
}

export interface TransferLeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatarData?: string | null;
  totalSent: number;
  totalReceived: number;
  totalTransferred: number;
  transfersSentCount: number;
  transfersReceivedCount: number;
}

export interface TransferLeaderboard {
  leaderboard: TransferLeaderboardEntry[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: unknown;
  };
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Achievement types
export type AchievementCategory = 'GAMES' | 'WINNINGS' | 'TRANSFERS' | 'SPECIAL';
export type AchievementTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';

export interface Achievement {
  id: string;
  key: string;
  name: string;
  description: string;
  category: AchievementCategory;
  tier: AchievementTier;
  icon: string;
  threshold: number;
  unlockedAt: string | null;
  isUnlocked: boolean;
  progress: number;
  progressPercent: number;
}

export interface UnlockedAchievement {
  id: string;
  key: string;
  name: string;
  description: string;
  tier: AchievementTier;
  icon: string;
  unlockedAt: string;
}
