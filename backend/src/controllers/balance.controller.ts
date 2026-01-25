import { Response, NextFunction } from 'express';
import { balanceService } from '../services/balance.service';
import { apiResponse } from '../utils/response';
import { AuthRequest } from '../types';

export const getBalance = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await balanceService.getBalanceWithWeeklyBonus(req.user!.userId);
    apiResponse.success(res, result);
  } catch (error) {
    next(error);
  }
};

export const getHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await balanceService.getHistory(req.user!.userId, page, limit);
    apiResponse.paginated(res, result.history, result.page, result.limit, result.total);
  } catch (error) {
    next(error);
  }
};

export const getDailyBonusStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await balanceService.getDailyBonusStatus(req.user!.userId);
    apiResponse.success(res, result);
  } catch (error) {
    next(error);
  }
};

export const claimDailyBonus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await balanceService.claimDailyBonus(req.user!.userId);
    apiResponse.success(res, result);
  } catch (error) {
    next(error);
  }
};

export const getSpinStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await balanceService.getSpinStatus(req.user!.userId);
    apiResponse.success(res, result);
  } catch (error) {
    next(error);
  }
};

export const spinLuckyWheel = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await balanceService.spinLuckyWheel(req.user!.userId);
    apiResponse.success(res, result);
  } catch (error) {
    next(error);
  }
};
