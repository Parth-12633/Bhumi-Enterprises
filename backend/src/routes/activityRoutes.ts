import express from 'express';
import { getActivityLogs } from '../controllers/activityLogController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.get('/', protect, getActivityLogs);

export default router;
