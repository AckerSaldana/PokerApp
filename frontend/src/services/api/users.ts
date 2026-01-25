import { apiClient } from './client';
import type { User, UserStats, ApiResponse } from '@/lib/types';

export interface ProfitDataPoint {
  date: string;
  gameName: string | null;
  netResult: number;
  cumulativeProfit: number;
}

export const usersApi = {
  getAll: async () => {
    const response = await apiClient.get<ApiResponse<User[]>>('/users');
    return response.data.data!;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<User>>(`/users/${id}`);
    return response.data.data!;
  },

  getStats: async (id: string) => {
    const response = await apiClient.get<ApiResponse<UserStats>>(`/users/${id}/stats`);
    return response.data.data!;
  },

  getProfitHistory: async (id: string, limit = 30) => {
    const response = await apiClient.get<ApiResponse<ProfitDataPoint[]>>(`/users/${id}/profit-history`, {
      params: { limit },
    });
    return response.data.data!;
  },

  updateProfile: async (id: string, data: { username?: string; avatarData?: string | null }) => {
    const response = await apiClient.patch<ApiResponse<User>>(`/users/${id}`, data);
    return response.data.data!;
  },
};
