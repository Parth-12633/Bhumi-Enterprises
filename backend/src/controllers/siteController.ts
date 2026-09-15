import { Response } from 'express';
import Site from '../models/Site';
import { AuthRequest } from '../middleware/auth';

export const getSites = async (req: AuthRequest, res: Response) => {
  try {
    const sites = await Site.find({}).sort({ name: 1 });
    res.json({ success: true, data: sites });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSiteById = async (req: AuthRequest, res: Response) => {
  try {
    const site = await Site.findById(req.params.id);
    if (site) {
      res.json({ success: true, data: site });
    } else {
      res.status(404).json({ success: false, message: 'Site not found' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createSite = async (req: AuthRequest, res: Response) => {
  try {
    const { name, location, clientName, notes } = req.body;
    
    const site = new Site({
      name,
      location,
      clientName,
      notes
    });

    const createdSite = await site.save();
    res.status(201).json({ success: true, data: createdSite });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateSite = async (req: AuthRequest, res: Response) => {
  try {
    const site = await Site.findById(req.params.id);

    if (site) {
      site.name = req.body.name || site.name;
      site.location = req.body.location || site.location;
      site.clientName = req.body.clientName || site.clientName;
      site.status = req.body.status || site.status;
      site.notes = req.body.notes || site.notes;

      const updatedSite = await site.save();
      res.json({ success: true, data: updatedSite });
    } else {
      res.status(404).json({ success: false, message: 'Site not found' });
    }
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteSite = async (req: AuthRequest, res: Response) => {
  try {
    const site = await Site.findById(req.params.id);
    if (!site) return res.status(404).json({ success: false, message: 'Site not found' });
    
    await Site.deleteOne({ _id: site._id });
    res.json({ success: true, message: 'Site deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
