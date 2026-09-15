import { Response } from 'express';
import WorkRecord from '../models/WorkRecord';
import Employee from '../models/Employee';
import ActivityLog from '../models/ActivityLog';
import { AuthRequest } from '../middleware/auth';

export const getWorkRecords = async (req: AuthRequest, res: Response) => {
  try {
    const { employeeId, date, month, siteId } = req.query;
    let query: any = { status: 'ACTIVE' };

    if (employeeId) query.employeeId = employeeId;
    if (siteId) query.siteId = siteId;
    if (date) query.date = date;
    if (month) {
      // month format YYYY-MM
      query.date = { $regex: `^${month}` };
    }

    const records = await WorkRecord.find(query)
      .populate('siteId', 'name')
      .populate('createdBy', 'name username')
      .populate('updatedBy', 'name username')
      .sort({ date: -1, createdAt: -1 });
      
    res.json({ success: true, data: records });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createWorkRecord = async (req: AuthRequest, res: Response) => {
  try {
    const { employeeId, siteId, date, hajri, workDescription, notes } = req.body;

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const rate = req.body.rate !== undefined ? req.body.rate : employee.dailyRate;
    const amount = Math.round(hajri * rate);

    if (hajri < 0 || hajri > 3.75) {
      return res.status(400).json({ success: false, message: 'Invalid Hajri value' });
    }

    const existingRecords = await WorkRecord.find({ employeeId, date, status: 'ACTIVE' });
    const totalExistingHajri = existingRecords.reduce((sum, record) => sum + record.hajri, 0);

    if (totalExistingHajri + hajri > 3.75) {
      return res.status(400).json({ success: false, message: `Total Hajri for ${date} cannot exceed 3.75. Current total: ${totalExistingHajri}` });
    }

    const record = new WorkRecord({
      employeeId,
      siteId,
      date,
      hajri,
      rate,
      amount,
      workDescription,
      notes,
      createdBy: req.user?._id
    });

    const createdRecord = await record.save();

    await ActivityLog.create({
      userId: req.user?._id,
      action: 'CREATE',
      entityType: 'WorkRecord',
      entityId: createdRecord._id,
      employeeId,
      siteId,
      after: createdRecord
    });

    res.status(201).json({ success: true, data: createdRecord });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateWorkRecord = async (req: AuthRequest, res: Response) => {
  try {
    const record = await WorkRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Work record not found' });
    }

    // Optimistic concurrency check
    if (req.body.version !== undefined && record.version !== req.body.version) {
      return res.status(409).json({ success: false, message: 'This record was updated by another user. Please refresh and review the latest data.' });
    }

    const before = record.toObject();

    if (req.body.hajri !== undefined) {
      if (req.body.hajri < 0 || req.body.hajri > 3.75) {
        return res.status(400).json({ success: false, message: 'Invalid Hajri value' });
      }

      const existingRecords = await WorkRecord.find({ employeeId: record.employeeId, date: record.date, status: 'ACTIVE' });
      const totalExistingHajri = existingRecords.reduce((sum, r) => r._id.toString() !== record._id.toString() ? sum + r.hajri : sum, 0);

      if (totalExistingHajri + req.body.hajri > 3.75) {
        return res.status(400).json({ success: false, message: `Total Hajri for ${record.date} cannot exceed 3.75.` });
      }

      record.hajri = req.body.hajri;
      // Recalculate amount using the snapped rate
      record.amount = Math.round(record.hajri * record.rate);
    }
    
    if (req.body.siteId) record.siteId = req.body.siteId;
    if (req.body.date) record.date = req.body.date;
    if (req.body.workDescription !== undefined) record.workDescription = req.body.workDescription;
    if (req.body.notes !== undefined) record.notes = req.body.notes;

    record.updatedBy = req.user?._id;

    const updatedRecord = await record.save();

    await ActivityLog.create({
      userId: req.user?._id,
      action: 'UPDATE',
      entityType: 'WorkRecord',
      entityId: updatedRecord._id,
      employeeId: updatedRecord.employeeId,
      siteId: updatedRecord.siteId,
      before,
      after: updatedRecord,
      reason: req.body.reason
    });

    res.json({ success: true, data: updatedRecord });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const voidWorkRecord = async (req: AuthRequest, res: Response) => {
  try {
    const record = await WorkRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Work record not found' });
    }

    record.status = 'VOIDED';
    record.updatedBy = req.user?._id;
    const voidedRecord = await record.save();

    await ActivityLog.create({
      userId: req.user?._id,
      action: 'VOID',
      entityType: 'WorkRecord',
      entityId: record._id,
      employeeId: record.employeeId,
      siteId: record.siteId,
      reason: req.body.reason
    });

    res.json({ success: true, data: voidedRecord });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
