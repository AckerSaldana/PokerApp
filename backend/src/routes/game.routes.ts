import { Router } from 'express';
import * as gameController from '../controllers/game.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createGameSchema,
  updateGameSchema,
  joinGameSchema,
  rebuySchema,
  closeGameSchema,
} from '../validators/game.validator';

const router = Router();

// Game CRUD
router.get('/', gameController.getGames);
router.post('/', authenticateToken, validate(createGameSchema), gameController.createGame);
router.get('/active', authenticateToken, gameController.getActiveGame);
router.get('/my-games', authenticateToken, gameController.getUserGames);

// Join by code
router.get('/join/:code', gameController.getGameByCode);
router.post('/join/:code', authenticateToken, validate(joinGameSchema), gameController.joinGameByCode);

// Game by ID
router.get('/:id', gameController.getGameById);
router.patch('/:id', authenticateToken, validate(updateGameSchema), gameController.updateGame);
router.delete('/:id', authenticateToken, gameController.deleteGame);

// Game actions
router.post('/:id/rebuy', authenticateToken, validate(rebuySchema), gameController.rebuy);
router.post('/:id/leave', authenticateToken, gameController.leaveGame);
router.post('/:id/close', authenticateToken, validate(closeGameSchema), gameController.closeGame);

export default router;
