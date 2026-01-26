import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import * as customizationController from '../controllers/customization.controller';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get user's frames with unlock status
router.get('/frames', customizationController.getUserFrames);

// Get user's titles with unlock status
router.get('/titles', customizationController.getUserTitles);

// Equip a frame
router.post('/frames/equip', customizationController.equipFrame);

// Equip a title
router.post('/titles/equip', customizationController.equipTitle);

export default router;
