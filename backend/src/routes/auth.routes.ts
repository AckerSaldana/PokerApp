import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { registerSchema, loginSchema, refreshSchema } from '../validators/auth.validator';

const router = Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', validate(refreshSchema), authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', authenticateToken, authController.getMe);

export default router;
