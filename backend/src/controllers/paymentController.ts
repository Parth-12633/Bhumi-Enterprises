import { Response } from 'express';
import Payment from '../models/Payment';
import ActivityLog from '../models/ActivityLog';
import { AuthRequest } from '../middleware/auth';

export const getPayments = async (req: AuthRequest, res: Response) => {
  try {
    const { employeeId, date, month } = req.query;
    let query: any = { status: 'ACTIVE' };

    if (employeeId) query.employeeId = employeeId;
    if (date) query.date = date;
    if (month) {
      query.date = { $regex: `^${month}` };
    }

    const payments = await Payment.find(query)
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name')
      .sort({ date: -1, createdAt: -1 });
      
    res.json({ success: true, data: payments });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { employeeId, amount, type, paymentMethod, date, note } = req.body;

    const payment = new Payment({
      employeeId,
      amount,
      type,
      paymentMethod,
      date,
      note,
      createdBy: req.user?._id
    });

    const createdPayment = await payment.save();

    await ActivityLog.create({
      userId: req.user?._id,
      action: 'PAYMENT_CREATE',
      entityType: 'Payment',
      entityId: createdPayment._id,
      employeeId,
      after: createdPayment
    });

    res.status(201).json({ success: true, data: createdPayment });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updatePayment = async (req: AuthRequest, res: Response) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    if (req.body.version !== undefined && payment.version !== req.body.version) {
      return res.status(409).json({ success: false, message: 'This record was updated by another user.' });
    }

    const before = payment.toObject();

    if (req.body.amount !== undefined) payment.amount = req.body.amount;
    if (req.body.type) payment.type = req.body.type;
    if (req.body.paymentMethod) payment.paymentMethod = req.body.paymentMethod;
    if (req.body.date) payment.date = req.body.date;
    if (req.body.note !== undefined) payment.note = req.body.note;

    payment.updatedBy = req.user?._id;

    const updatedPayment = await payment.save();

    await ActivityLog.create({
      userId: req.user?._id,
      action: 'PAYMENT_UPDATE',
      entityType: 'Payment',
      entityId: updatedPayment._id,
      employeeId: updatedPayment.employeeId,
      before,
      after: updatedPayment,
      reason: req.body.reason
    });

    res.json({ success: true, data: updatedPayment });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
