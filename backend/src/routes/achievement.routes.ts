import { Router } from 'express';
import * as achievementController from '../controllers/achievement.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get current user's achievements with progress
router.get('/me', achievementController.getMyAchievements);

// Get unnotified achievements
router.get('/unnotified', achievementController.getUnnotifiedAchievements);

// Mark achievements as notified
router.post('/mark-notified', achievementController.markAchievementsNotified);

// Get another user's achievements (public view)
router.get('/user/:userId', achievementController.getUserAchievements);

export default router;
