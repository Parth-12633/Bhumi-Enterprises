import express from 'express';
import { getEmployeeReport } from '../controllers/reportController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.get('/employee/:id', protect, getEmployeeReport);

export default router;
