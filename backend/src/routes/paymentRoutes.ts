import express from 'express';
import { getPayments, createPayment, updatePayment } from '../controllers/paymentController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.route('/')
  .get(protect, getPayments)
  .post(protect, createPayment);

router.route('/:id')
  .patch(protect, updatePayment);

export default router;
