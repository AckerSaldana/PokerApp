import { Router } from 'express';
import * as gameController from '../controllers/game.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { createGameSchema, updateGameSchema } from '../validators/game.validator';

const router = Router();

router.get('/', gameController.getGames);
router.post('/', authenticateToken, validate(createGameSchema), gameController.createGame);
router.get('/my-games', authenticateToken, gameController.getUserGames);
router.get('/:id', gameController.getGameById);
router.patch('/:id', authenticateToken, validate(updateGameSchema), gameController.updateGame);
router.delete('/:id', authenticateToken, gameController.deleteGame);
router.post('/:id/join', authenticateToken, gameController.joinGame);
router.post('/:id/leave', authenticateToken, gameController.leaveGame);
router.patch('/:id/results', authenticateToken, gameController.updateResults);
router.post('/:id/close', authenticateToken, gameController.closeGame);

export default router;
