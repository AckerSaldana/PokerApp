import { Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { apiResponse } from '../utils/response';
import { AuthRequest } from '../types';

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) {
    apiResponse.error(res, 'Access token required', 401, 'UNAUTHORIZED');
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch {
    apiResponse.error(res, 'Invalid or expired token', 403, 'FORBIDDEN');
    return;
  }
};
