import { Router } from 'express';
import * as leaderboardController from '../controllers/leaderboard.controller';

const router = Router();

router.get('/', leaderboardController.getAllTimeLeaderboard);
router.get('/weekly', leaderboardController.getWeeklyLeaderboard);
router.get('/monthly', leaderboardController.getMonthlyLeaderboard);
router.get('/all-time', leaderboardController.getAllTimeLeaderboard);

export default router;
