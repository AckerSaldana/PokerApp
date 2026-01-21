import { Router } from 'express';
import * as transferController from '../controllers/transfer.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { createTransferSchema } from '../validators/transfer.validator';

const router = Router();

router.use(authenticateToken);

router.get('/', transferController.getTransfers);
router.get('/leaderboard', transferController.getTransferLeaderboard);
router.post('/', validate(createTransferSchema), transferController.createTransfer);
router.get('/with/:userId', transferController.getTransfersBetweenUsers);
router.get('/:id', transferController.getTransferById);

export default router;
