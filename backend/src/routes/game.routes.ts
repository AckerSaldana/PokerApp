import { Router } from 'express';
import * as gameController from '../controllers/game.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireGameHost } from '../middleware/gameAuth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createGameSchema,
  updateGameSchema,
  joinGameSchema,
  rebuySchema,
  closeGameSchema,
  earlyCashOutSchema,
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
router.patch('/:id', authenticateToken, requireGameHost, validate(updateGameSchema), gameController.updateGame);
router.delete('/:id', authenticateToken, requireGameHost, gameController.deleteGame);

// Game actions (rebuy and request-leave can be done by any participant)
router.post('/:id/rebuy', authenticateToken, validate(rebuySchema), gameController.rebuy);
router.post('/:id/request-leave', authenticateToken, gameController.requestLeave);
// Host-only actions
router.post('/:id/close', authenticateToken, requireGameHost, validate(closeGameSchema), gameController.closeGame);
router.post('/:id/early-cashout', authenticateToken, requireGameHost, validate(earlyCashOutSchema), gameController.earlyCashOut);

export default router;
