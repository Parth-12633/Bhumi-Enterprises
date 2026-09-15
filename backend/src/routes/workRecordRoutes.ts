import express from 'express';
import { getWorkRecords, createWorkRecord, updateWorkRecord, voidWorkRecord } from '../controllers/workRecordController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.route('/')
  .get(protect, getWorkRecords)
  .post(protect, createWorkRecord);

router.route('/:id')
  .patch(protect, updateWorkRecord);

router.route('/:id/void')
  .post(protect, voidWorkRecord);

export default router;
