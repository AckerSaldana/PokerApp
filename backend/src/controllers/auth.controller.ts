import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { apiResponse } from '../utils/response';
import { AuthRequest } from '../types';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.register(req.body);
    apiResponse.success(res, result, 'Registration successful', 201);
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.login(req.body);
    apiResponse.success(res, result, 'Login successful');
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refresh(refreshToken);
    apiResponse.success(res, result, 'Token refreshed');
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    await authService.logout(refreshToken);
    apiResponse.success(res, null, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await authService.getMe(req.user!.userId);
    apiResponse.success(res, user);
  } catch (error) {
    next(error);
  }
};
