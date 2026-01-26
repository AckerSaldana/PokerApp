import { Response, NextFunction } from 'express';
import { customizationService } from '../services/customization.service';
import { apiResponse } from '../utils/response';
import { AuthRequest } from '../types';

export const getUserFrames = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const frames = await customizationService.getUserFrames(req.user!.userId);
    apiResponse.success(res, frames);
  } catch (error) {
    next(error);
  }
};

export const getUserTitles = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const titles = await customizationService.getUserTitles(req.user!.userId);
    apiResponse.success(res, titles);
  } catch (error) {
    next(error);
  }
};

export const equipFrame = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { frameId } = req.body;
    const result = await customizationService.equipFrame(req.user!.userId, frameId);
    apiResponse.success(res, result, 'Frame equipped');
  } catch (error) {
    next(error);
  }
};

export const equipTitle = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { titleId } = req.body;
    const result = await customizationService.equipTitle(req.user!.userId, titleId);
    apiResponse.success(res, result, 'Title equipped');
  } catch (error) {
    next(error);
  }
};
