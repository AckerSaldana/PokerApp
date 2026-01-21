import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.get('/:id/stats', userController.getUserStats);
router.patch('/:id', authenticateToken, userController.updateProfile);

export default router;
