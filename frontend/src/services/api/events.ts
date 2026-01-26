import { apiClient } from './client';

export interface Event {
  id: string;
  key: string;
  name: string;
  description: string;
  type: 'HAPPY_HOUR' | 'WEEKEND_BONANZA' | 'FLASH_BONUS' | 'MILESTONE_BOOST';
  startTime: string;
  endTime: string;
  isActive: boolean;
  multiplier: number;
  bonusChips: number;
  iconEmoji: string;
  bannerColor: string;
  priority: number;
}

export interface EventStats {
  eventId: string;
  participantCount: number;
  totalRewardsClaimed: number;
  recentParticipants: number;
}

export interface NotificationSettings {
  id: string;
  userId: string;
  eventReminders: boolean;
  streakWarnings: boolean;
  achievementProgress: boolean;
  leaderboardUpdates: boolean;
  quietHoursStart: number | null;
  quietHoursEnd: number | null;
  lastEventNotification: string | null;
  lastStreakNotification: string | null;
}

export const eventsApi = {
  getActiveEvents: async (): Promise<Event[]> => {
    const response = await apiClient.get('/events/active');
    return response.data.data;
  },

  getUpcomingEvents: async (limit: number = 3): Promise<Event[]> => {
    const response = await apiClient.get('/events/upcoming', { params: { limit } });
    return response.data.data;
  },

  getEventStats: async (eventId: string): Promise<EventStats> => {
    const response = await apiClient.get(`/events/${eventId}/stats`);
    return response.data.data;
  },

  getNotificationSettings: async (): Promise<NotificationSettings> => {
    const response = await apiClient.get('/events/notifications/settings');
    return response.data.data;
  },

  updateNotificationSettings: async (
    settings: Partial<NotificationSettings>
  ): Promise<NotificationSettings> => {
    const response = await apiClient.put('/events/notifications/settings', settings);
    return response.data.data;
  },
};
