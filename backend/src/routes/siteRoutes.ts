import express from 'express';
import { getSites, getSiteById, createSite, updateSite, deleteSite } from '../controllers/siteController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.route('/')
  .get(protect, getSites)
  .post(protect, createSite);

router.route('/:id')
  .get(protect, getSiteById)
  .patch(protect, updateSite)
  .delete(protect, deleteSite);

export default router;
