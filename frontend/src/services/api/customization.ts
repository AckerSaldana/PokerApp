import { apiClient } from './client';

export interface AvatarFrame {
  id: string;
  key: string;
  name: string;
  description: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  cssClass: string;
  unlockType: 'DEFAULT' | 'ACHIEVEMENT' | 'MILESTONE' | 'SPECIAL';
  requirement: string;
  isUnlocked: boolean;
  unlockedAt: string | null;
}

export interface ProfileTitle {
  id: string;
  key: string;
  name: string;
  description: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  color: string;
  unlockType: 'DEFAULT' | 'ACHIEVEMENT' | 'MILESTONE' | 'SPECIAL';
  requirement: string;
  isUnlocked: boolean;
  unlockedAt: string | null;
}

export const customizationApi = {
  getUserFrames: async (): Promise<AvatarFrame[]> => {
    const response = await apiClient.get('/customization/frames');
    return response.data.data;
  },

  getUserTitles: async (): Promise<ProfileTitle[]> => {
    const response = await apiClient.get('/customization/titles');
    return response.data.data;
  },

  equipFrame: async (frameId: string | null): Promise<void> => {
    await apiClient.post('/customization/frames/equip', { frameId });
  },

  equipTitle: async (titleId: string | null): Promise<void> => {
    await apiClient.post('/customization/titles/equip', { titleId });
  },
};
