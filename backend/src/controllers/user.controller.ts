import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service';
import { apiResponse } from '../utils/response';
import { AuthRequest } from '../types';

export const getAllUsers = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await userService.getAllUsers();
    apiResponse.success(res, users);
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const user = await userService.getUserById(req.params.id);
    apiResponse.success(res, user);
  } catch (error) {
    next(error);
  }
};

export const getUserStats = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const stats = await userService.getUserStats(req.params.id);
    apiResponse.success(res, stats);
  } catch (error) {
    next(error);
  }
};

export const getProfitHistory = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query.limit as string) || 30;
    const history = await userService.getProfitHistory(req.params.id, limit);
    apiResponse.success(res, history);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (req.params.id !== req.user!.userId) {
      apiResponse.error(res, 'Cannot update another user profile', 403, 'FORBIDDEN');
      return;
    }
    const user = await userService.updateProfile(req.user!.userId, req.body);
    apiResponse.success(res, user);
  } catch (error) {
    next(error);
  }
};
