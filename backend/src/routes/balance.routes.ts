import { Router } from 'express';
import * as balanceController from '../controllers/balance.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/', balanceController.getBalance);
router.get('/history', balanceController.getHistory);

export default router;
