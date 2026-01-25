import { Router } from 'express';
import * as balanceController from '../controllers/balance.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/', balanceController.getBalance);
router.get('/history', balanceController.getHistory);

// Daily bonus routes
router.get('/daily-bonus', balanceController.getDailyBonusStatus);
router.post('/daily-bonus', balanceController.claimDailyBonus);

// Lucky spin routes
router.get('/spin', balanceController.getSpinStatus);
router.post('/spin', balanceController.spinLuckyWheel);

export default router;
