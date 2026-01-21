import { apiClient } from './client';
import type { Transfer, ApiResponse, PaginatedResponse, TransfersBetweenUsers, TransferLeaderboard } from '@/lib/types';

interface CreateTransferRequest {
  receiverId: string;
  amount: number;
  note?: string;
}

interface TransferResponse {
  transfer: Transfer;
  newBalance: number;
}

export const transferApi = {
  create: async (data: CreateTransferRequest) => {
    const response = await apiClient.post<ApiResponse<TransferResponse>>('/transfers', data);
    return response.data.data!;
  },

  getAll: async (page = 1, limit = 20) => {
    const response = await apiClient.get<PaginatedResponse<Transfer>>('/transfers', {
      params: { page, limit },
    });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Transfer>>(`/transfers/${id}`);
    return response.data.data!;
  },

  getBetweenUsers: async (userId: string, page = 1, limit = 20) => {
    const response = await apiClient.get<ApiResponse<TransfersBetweenUsers>>(`/transfers/with/${userId}`, {
      params: { page, limit },
    });
    return response.data.data!;
  },

  getLeaderboard: async (limit = 20) => {
    const response = await apiClient.get<ApiResponse<TransferLeaderboard>>('/transfers/leaderboard', {
      params: { limit },
    });
    return response.data.data!;
  },
};
