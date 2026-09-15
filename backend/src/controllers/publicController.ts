import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Employee from '../models/Employee';
import WorkRecord from '../models/WorkRecord';
import Payment from '../models/Payment';

export const getPublicStatement = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;
    const { month } = req.query; // format YYYY-MM

    if (!month || typeof month !== 'string') {
      return res.status(400).json({ success: false, message: 'Month is required (YYYY-MM)' });
    }

    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({ success: false, message: 'Invalid employee link' });
    }

    // 1. Fetch Employee
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // 2. Fetch Work Records & Payments for the month
    const empObjectId = new mongoose.Types.ObjectId(employeeId);
    
    // Fetch records populated with site details
    const workRecords = await WorkRecord.find({
      employeeId: empObjectId,
      status: 'ACTIVE',
      date: { $regex: `^${month}` }
    }).populate('siteId', 'name').sort({ date: 1 });

    const payments = await Payment.find({
      employeeId: empObjectId,
      status: 'ACTIVE',
      date: { $regex: `^${month}` }
    }).sort({ date: 1 });

    // 3. Calculate Report Data
    let totalHajri = 0;
    let totalEarned = 0;
    const siteWiseHajri: Record<string, number> = {};

    workRecords.forEach(record => {
      totalHajri += record.hajri;
      totalEarned += record.amount;
      
      if (record.hajri > 0) {
        const siteName = (record.siteId as any)?.name || 'Unknown Site';
        siteWiseHajri[siteName] = (siteWiseHajri[siteName] || 0) + record.hajri;
      }
    });

    let advance = 0;
    let otherPayments = 0;

    payments.forEach(p => {
      if (p.type === 'ADVANCE') advance += p.amount;
      else otherPayments += p.amount;
    });

    const totalPaid = advance + otherPayments;
    const balance = totalEarned - totalPaid;

    // 4. Merge records for chronological display
    const allRecords = [...workRecords, ...payments].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // 5. Send single consolidated payload
    res.json({
      success: true,
      data: {
        employee,
        report: {
          totalHajri,
          totalEarned,
          advance,
          totalPaid,
          balance
        },
        siteWiseHajri,
        records: allRecords
      }
    });
  } catch (error: any) {
    console.error('Error fetching public statement:', error);
    res.status(500).json({ success: false, message: 'Server error generating statement' });
  }
};
