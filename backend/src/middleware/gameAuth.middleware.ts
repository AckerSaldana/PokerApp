import { Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { apiResponse } from '../utils/response';
import { AuthRequest } from '../types';

/**
 * Middleware to verify the authenticated user is the host of the game.
 * Must be used after authenticateToken middleware.
 * Expects :id parameter in the route.
 */
export const requireGameHost = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const gameId = req.params.id as string;
  const userId = req.user?.userId;

  if (!userId) {
    apiResponse.error(res, 'Authentication required', 401, 'UNAUTHORIZED');
    return;
  }

  if (!gameId) {
    apiResponse.error(res, 'Game ID required', 400, 'INVALID_REQUEST');
    return;
  }

  try {
    const game = await prisma.gameSession.findUnique({
      where: { id: gameId },
      select: { hostId: true },
    });

    if (!game) {
      apiResponse.error(res, 'Game not found', 404, 'NOT_FOUND');
      return;
    }

    if (game.hostId !== userId) {
      apiResponse.error(res, 'Only the host can perform this action', 403, 'NOT_HOST');
      return;
    }

    next();
  } catch (error) {
    apiResponse.error(res, 'Failed to verify game ownership', 500, 'INTERNAL_ERROR');
  }
};
