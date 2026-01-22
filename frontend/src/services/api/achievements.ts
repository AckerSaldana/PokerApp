import { apiClient } from './client';
import type { Achievement, UnlockedAchievement, ApiResponse } from '@/lib/types';

export interface AchievementsResponse {
  achievements: Achievement[];
}

export interface UnlockedAchievementsResponse {
  achievements: UnlockedAchievement[];
}

interface UnnotifiedResponse {
  achievements: UnlockedAchievement[];
}

export const achievementsApi = {
  // Get current user's achievements with progress
  getMyAchievements: async () => {
    const response = await apiClient.get<ApiResponse<AchievementsResponse>>('/achievements/me');
    return response.data.data!;
  },

  // Get another user's unlocked achievements
  getUserAchievements: async (userId: string) => {
    const response = await apiClient.get<ApiResponse<UnlockedAchievementsResponse>>(
      `/achievements/user/${userId}`
    );
    return response.data.data!;
  },

  // Get unnotified achievement unlocks
  getUnnotified: async () => {
    const response = await apiClient.get<ApiResponse<UnnotifiedResponse>>('/achievements/unnotified');
    return response.data.data!;
  },

  // Mark achievements as notified
  markNotified: async (achievementIds: string[]) => {
    const response = await apiClient.post<ApiResponse<{ marked: number }>>('/achievements/mark-notified', {
      achievementIds,
    });
    return response.data.data!;
  },
};
