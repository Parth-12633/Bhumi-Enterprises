import express from 'express';
import { getEmployees, getEmployeeById, createEmployee, updateEmployee } from '../controllers/employeeController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.route('/')
  .get(protect, getEmployees)
  .post(protect, createEmployee);

router.route('/:id')
  .get(protect, getEmployeeById)
  .patch(protect, updateEmployee);

export default router;
