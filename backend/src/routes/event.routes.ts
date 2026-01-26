import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import * as eventController from '../controllers/event.controller';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get active events
router.get('/active', eventController.getActiveEvents);

// Get upcoming events
router.get('/upcoming', eventController.getUpcomingEvents);

// Get event stats (participation, rewards claimed)
router.get('/:eventId/stats', eventController.getEventStats);

// Get user notification settings
router.get('/notifications/settings', eventController.getNotificationSettings);

// Update user notification settings
router.put('/notifications/settings', eventController.updateNotificationSettings);

export default router;
