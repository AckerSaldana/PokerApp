import { apiClient } from './client';
import type { BalanceInfo, ApiResponse, PaginatedResponse } from '@/lib/types';

interface HistoryItem {
  id: string;
  type: 'sent' | 'received';
  amount: number;
  note?: string;
  otherUser: { id: string; username: string; avatarData?: string | null };
  createdAt: string;
}

export interface DailyBonusStatus {
  canClaim: boolean;
  currentStreak: number;
  nextBonusAmount: number;
  nextClaimAt: string;
  balance: number;
}

export interface DailyBonusClaimResult {
  claimed: boolean;
  alreadyClaimed?: boolean;
  bonusAmount?: number;
  currentStreak: number;
  nextClaimAt: string;
  balance: number;
}

export interface SpinStatus {
  canSpin: boolean;
  nextSpinAt: string;
  balance: number;
}

export interface SpinResult {
  canSpin: boolean;
  result?: number;
  balance: number;
  nextSpinAt: string;
}

export const balanceApi = {
  getBalance: async () => {
    const response = await apiClient.get<ApiResponse<BalanceInfo>>('/balance');
    return response.data.data!;
  },

  getHistory: async (page = 1, limit = 20) => {
    const response = await apiClient.get<PaginatedResponse<HistoryItem>>('/balance/history', {
      params: { page, limit },
    });
    return response.data;
  },

  getDailyBonusStatus: async () => {
    const response = await apiClient.get<ApiResponse<DailyBonusStatus>>('/balance/daily-bonus');
    return response.data.data!;
  },

  claimDailyBonus: async () => {
    const response = await apiClient.post<ApiResponse<DailyBonusClaimResult>>('/balance/daily-bonus');
    return response.data.data!;
  },

  getSpinStatus: async () => {
    const response = await apiClient.get<ApiResponse<SpinStatus>>('/balance/spin');
    return response.data.data!;
  },

  spin: async () => {
    const response = await apiClient.post<ApiResponse<SpinResult>>('/balance/spin');
    return response.data.data!;
  },
};
