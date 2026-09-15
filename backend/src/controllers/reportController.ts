import { Response } from 'express';
import WorkRecord from '../models/WorkRecord';
import Payment from '../models/Payment';
import { AuthRequest } from '../middleware/auth';
import mongoose from 'mongoose';

export const getEmployeeReport = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { month } = req.query; // format YYYY-MM

    if (!month) {
      return res.status(400).json({ success: false, message: 'Month is required (YYYY-MM)' });
    }

    const employeeId = new mongoose.Types.ObjectId(id);

    // Aggregate work records
    const workRecords = await WorkRecord.aggregate([
      { 
        $match: { 
          employeeId, 
          status: 'ACTIVE',
          date: { $regex: `^${month}` } 
        } 
      },
      {
        $group: {
          _id: null,
          totalHajri: { $sum: '$hajri' },
          totalEarned: { $sum: '$amount' }
        }
      }
    ]);

    const workStats = workRecords.length > 0 ? workRecords[0] : { totalHajri: 0, totalEarned: 0 };

    // Aggregate payments
    const payments = await Payment.aggregate([
      {
        $match: {
          employeeId,
          status: 'ACTIVE',
          date: { $regex: `^${month}` }
        }
      },
      {
        $group: {
          _id: '$type',
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    let advance = 0;
    let otherPayments = 0;

    payments.forEach(p => {
      if (p._id === 'ADVANCE') advance += p.totalAmount;
      else otherPayments += p.totalAmount;
    });

    const totalPaid = advance + otherPayments;
    const balance = workStats.totalEarned - totalPaid;

    res.json({
      success: true,
      data: {
        totalHajri: workStats.totalHajri,
        totalEarned: workStats.totalEarned,
        advance,
        totalPaid,
        balance
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
