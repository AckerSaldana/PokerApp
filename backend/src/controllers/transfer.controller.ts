import { Response, NextFunction } from 'express';
import { transferService } from '../services/transfer.service';
import { apiResponse } from '../utils/response';
import { AuthRequest } from '../types';

export const createTransfer = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await transferService.createTransfer(req.user!.userId, req.body);
    apiResponse.success(res, result, 'Transfer successful', 201);
  } catch (error) {
    next(error);
  }
};

export const getTransfers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await transferService.getTransfers(req.user!.userId, page, limit);
    apiResponse.paginated(res, result.transfers, result.page, result.limit, result.total);
  } catch (error) {
    next(error);
  }
};

export const getTransferById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const transfer = await transferService.getTransferById(req.params.id as string, req.user!.userId);
    apiResponse.success(res, transfer);
  } catch (error) {
    next(error);
  }
};

export const getTransfersBetweenUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.params.userId as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await transferService.getTransfersBetweenUsers(req.user!.userId, userId, page, limit);
    apiResponse.success(res, result);
  } catch (error) {
    next(error);
  }
};

export const getTransferLeaderboard = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await transferService.getTransferLeaderboard(limit);
    apiResponse.success(res, result);
  } catch (error) {
    next(error);
  }
};
