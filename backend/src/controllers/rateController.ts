import { Response } from 'express';
import Rate from '../models/Rate';
import { AuthRequest } from '../middleware/auth';

export const getRates = async (req: AuthRequest, res: Response) => {
  try {
    const { siteId, status } = req.query;
    let query: any = {};
    if (siteId) query.siteId = siteId;
    if (status) query.status = status;

    const rates = await Rate.find(query)
      .populate('siteId', 'name')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: rates });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createRate = async (req: AuthRequest, res: Response) => {
  try {
    const { siteId, workName, rate, effectiveFrom } = req.body;

    const newRate = new Rate({
      siteId,
      workName,
      rate,
      effectiveFrom,
      createdBy: req.user?._id
    });

    await newRate.save();
    res.status(201).json({ success: true, data: newRate });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateRate = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    const rate = await Rate.findById(req.params.id);
    if (!rate) return res.status(404).json({ success: false, message: 'Rate not found' });

    if (status) rate.status = status;
    if (req.user) rate.updatedBy = req.user._id;
    await rate.save();

    res.json({ success: true, data: rate });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
