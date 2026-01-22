import { Request, Response, NextFunction } from 'express';
import { gameService } from '../services/game.service';
import { apiResponse } from '../utils/response';
import { AuthRequest } from '../types';

export const createGame = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const game = await gameService.createGame(req.user!.userId, req.body);
    apiResponse.success(res, game, 'Game created', 201);
  } catch (error) {
    next(error);
  }
};

export const getGames = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await gameService.getGames(page, limit);
    apiResponse.paginated(res, result.games, result.page, result.limit, result.total);
  } catch (error) {
    next(error);
  }
};

export const getGameById = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const game = await gameService.getGameById(req.params.id);
    apiResponse.success(res, game);
  } catch (error) {
    next(error);
  }
};

export const getActiveGame = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const game = await gameService.getActiveGame(req.user!.userId);
    apiResponse.success(res, game);
  } catch (error) {
    next(error);
  }
};

export const getGameByCode = async (req: Request<{ code: string }>, res: Response, next: NextFunction) => {
  try {
    const game = await gameService.getGameByCode(req.params.code);
    apiResponse.success(res, game);
  } catch (error) {
    next(error);
  }
};

export const updateGame = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const game = await gameService.updateGame(req.params.id, req.body);
    apiResponse.success(res, game);
  } catch (error) {
    next(error);
  }
};

export const deleteGame = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    await gameService.deleteGame(req.params.id);
    apiResponse.success(res, null, 'Game deleted');
  } catch (error) {
    next(error);
  }
};

export const joinGameByCode = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const game = await gameService.joinGameByCode(
      req.params.code as string,
      req.user!.userId,
      req.body.buyIn || 0
    );
    apiResponse.success(res, game, 'Joined game', 201);
  } catch (error) {
    next(error);
  }
};

export const rebuy = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const game = await gameService.rebuy(
      req.params.id as string,
      req.user!.userId,
      req.body.amount
    );
    apiResponse.success(res, game, 'Rebuy successful');
  } catch (error) {
    next(error);
  }
};

export const leaveGame = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await gameService.leaveGame(req.params.id as string, req.user!.userId);
    apiResponse.success(res, null, 'Left game');
  } catch (error) {
    next(error);
  }
};

export const closeGame = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const game = await gameService.closeGame(
      req.params.id as string,
      req.user!.userId,
      req.body.results
    );
    apiResponse.success(res, game, 'Game closed');
  } catch (error) {
    next(error);
  }
};

export const getUserGames = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await gameService.getUserGames(req.user!.userId, page, limit);
    apiResponse.paginated(res, result.games, result.page, result.limit, result.total);
  } catch (error) {
    next(error);
  }
};
