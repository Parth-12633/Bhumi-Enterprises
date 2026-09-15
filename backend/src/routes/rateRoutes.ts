import express from 'express';
import { protect } from '../middleware/auth';
import { getRates, createRate, updateRate } from '../controllers/rateController';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getRates)
  .post(createRate);

router.route('/:id')
  .put(updateRate);

export default router;
