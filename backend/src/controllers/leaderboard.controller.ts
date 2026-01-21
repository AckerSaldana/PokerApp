import { Request, Response, NextFunction } from 'express';
import { leaderboardService } from '../services/leaderboard.service';
import { apiResponse } from '../utils/response';

export const getAllTimeLeaderboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    const result = await leaderboardService.getAllTimeLeaderboard(limit, offset);
    apiResponse.success(res, result);
  } catch (error) {
    next(error);
  }
};

export const getWeeklyLeaderboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    const result = await leaderboardService.getWeeklyLeaderboard(limit, offset);
    apiResponse.success(res, result);
  } catch (error) {
    next(error);
  }
};

export const getMonthlyLeaderboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    const result = await leaderboardService.getMonthlyLeaderboard(limit, offset);
    apiResponse.success(res, result);
  } catch (error) {
    next(error);
  }
};
