import { apiClient } from './client';
import type { LeaderboardEntry, ApiResponse } from '@/lib/types';

interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  total: number;
}

export const leaderboardApi = {
  getAllTime: async (limit = 20, offset = 0) => {
    const response = await apiClient.get<ApiResponse<LeaderboardResponse>>('/leaderboard/all-time', {
      params: { limit, offset },
    });
    return response.data.data!;
  },

  getWeekly: async (limit = 20, offset = 0) => {
    const response = await apiClient.get<ApiResponse<LeaderboardResponse>>('/leaderboard/weekly', {
      params: { limit, offset },
    });
    return response.data.data!;
  },

  getMonthly: async (limit = 20, offset = 0) => {
    const response = await apiClient.get<ApiResponse<LeaderboardResponse>>('/leaderboard/monthly', {
      params: { limit, offset },
    });
    return response.data.data!;
  },
};
