import { Request, Response, NextFunction } from 'express';
import { achievementService } from '../services/achievement.service';
import { apiResponse } from '../utils/response';
import { AuthRequest } from '../types';

// Get current user's achievements with progress
export const getMyAchievements = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const achievements = await achievementService.getUserAchievements(req.user!.userId);
    apiResponse.success(res, { achievements });
  } catch (error) {
    next(error);
  }
};

// Get another user's unlocked achievements (public view)
export const getUserAchievements = async (
  req: Request<{ userId: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const achievements = await achievementService.getPublicUserAchievements(req.params.userId);
    apiResponse.success(res, { achievements });
  } catch (error) {
    next(error);
  }
};

// Get unnotified achievement unlocks
export const getUnnotifiedAchievements = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const achievements = await achievementService.getUnnotifiedAchievements(req.user!.userId);
    apiResponse.success(res, { achievements });
  } catch (error) {
    next(error);
  }
};

// Mark achievements as notified
export const markAchievementsNotified = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { achievementIds } = req.body;
    if (!Array.isArray(achievementIds)) {
      apiResponse.error(res, 'achievementIds must be an array', 400, 'INVALID_REQUEST');
      return;
    }
    await achievementService.markAsNotified(req.user!.userId, achievementIds);
    apiResponse.success(res, { marked: achievementIds.length });
  } catch (error) {
    next(error);
  }
};
