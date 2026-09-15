import { Response } from 'express';
import ActivityLog from '../models/ActivityLog';
import { AuthRequest } from '../middleware/auth';

export const getActivityLogs = async (req: AuthRequest, res: Response) => {
  try {
    const { employeeId, siteId } = req.query;
    let query: any = {};
    if (employeeId) query.employeeId = employeeId;
    if (siteId) query.siteId = siteId;

    const logs = await ActivityLog.find(query)
      .populate('userId', 'name')
      .populate('employeeId', 'name')
      .populate('siteId', 'name')
      .sort({ timestamp: -1 })
      .limit(100);
      
    res.json({ success: true, data: logs });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
