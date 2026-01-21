import { apiClient } from './client';
import type { BalanceInfo, ApiResponse, PaginatedResponse } from '@/lib/types';

interface HistoryItem {
  id: string;
  type: 'sent' | 'received';
  amount: number;
  note?: string;
  otherUser: { id: string; username: string };
  createdAt: string;
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
};
