import express from 'express';
import { getPublicStatement } from '../controllers/publicController';

const router = express.Router();

router.get('/statement/:employeeId', getPublicStatement);

export default router;
