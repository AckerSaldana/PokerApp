import { apiClient } from './client';
import type { GameSession, ApiResponse } from '@/lib/types';

interface CreateGameInput {
  name?: string;
  notes?: string;
}

interface CloseGameResult {
  userId: string;
  cashOut: number;
}

export const gamesApi = {
  create: async (data: CreateGameInput) => {
    const response = await apiClient.post<ApiResponse<GameSession>>('/games', data);
    return response.data.data!;
  },

  getActive: async () => {
    const response = await apiClient.get<ApiResponse<GameSession | null>>('/games/active');
    return response.data.data;
  },

  getByCode: async (code: string) => {
    const response = await apiClient.get<ApiResponse<GameSession>>(`/games/join/${code}`);
    return response.data.data!;
  },

  join: async (code: string, buyIn: number) => {
    const response = await apiClient.post<ApiResponse<GameSession>>(`/games/join/${code}`, { buyIn });
    return response.data.data!;
  },

  rebuy: async (gameId: string, amount: number) => {
    const response = await apiClient.post<ApiResponse<GameSession>>(`/games/${gameId}/rebuy`, { amount });
    return response.data.data!;
  },

  requestLeave: async (gameId: string) => {
    const response = await apiClient.post<ApiResponse<GameSession>>(`/games/${gameId}/request-leave`);
    return response.data.data!;
  },

  close: async (gameId: string, results: CloseGameResult[]) => {
    const response = await apiClient.post<ApiResponse<GameSession>>(`/games/${gameId}/close`, { results });
    return response.data.data!;
  },

  earlyCashOut: async (gameId: string, participantUserId: string, cashOut: number) => {
    const response = await apiClient.post<ApiResponse<GameSession>>(`/games/${gameId}/early-cashout`, {
      participantUserId,
      cashOut,
    });
    return response.data.data!;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<GameSession>>(`/games/${id}`);
    return response.data.data!;
  },

  getMyGames: async (page = 1, limit = 20) => {
    const response = await apiClient.get<ApiResponse<GameSession[]>>('/games/my-games', {
      params: { page, limit },
    });
    return { games: response.data.data! };
  },
};
