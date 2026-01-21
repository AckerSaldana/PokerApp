import { Router } from 'express';
import authRoutes from './auth.routes';
import balanceRoutes from './balance.routes';
import transferRoutes from './transfer.routes';
import leaderboardRoutes from './leaderboard.routes';
import gameRoutes from './game.routes';
import userRoutes from './user.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/balance', balanceRoutes);
router.use('/transfers', transferRoutes);
router.use('/leaderboard', leaderboardRoutes);
router.use('/games', gameRoutes);
router.use('/users', userRoutes);

export default router;
