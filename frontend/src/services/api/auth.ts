import { apiClient } from './client';
import type { User, ApiResponse, AuthTokens } from '@/lib/types';

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest extends LoginRequest {
  username: string;
}

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  register: async (data: RegisterRequest) => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data);
    return response.data.data!;
  },

  login: async (data: LoginRequest) => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data);
    return response.data.data!;
  },

  refresh: async (refreshToken: string) => {
    const response = await apiClient.post<ApiResponse<AuthTokens>>('/auth/refresh', {
      refreshToken,
    });
    return response.data.data!;
  },

  logout: async (refreshToken: string) => {
    await apiClient.post('/auth/logout', { refreshToken });
  },

  getMe: async () => {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me');
    return response.data.data!;
  },
};
