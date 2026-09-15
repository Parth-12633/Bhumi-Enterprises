import { Response } from 'express';
import Employee from '../models/Employee';
import { AuthRequest } from '../middleware/auth';

export const getEmployees = async (req: AuthRequest, res: Response) => {
  try {
    const employees = await Employee.find({}).sort({ name: 1 });
    res.json({ success: true, data: employees });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getEmployeeById = async (req: AuthRequest, res: Response) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (employee) {
      res.json({ success: true, data: employee });
    } else {
      res.status(404).json({ success: false, message: 'Employee not found' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createEmployee = async (req: AuthRequest, res: Response) => {
  try {
    const { name, mobile, address, dailyRate, notes } = req.body;
    
    const employee = new Employee({
      name,
      mobile,
      address,
      dailyRate,
      notes
    });

    const createdEmployee = await employee.save();
    res.status(201).json({ success: true, data: createdEmployee });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateEmployee = async (req: AuthRequest, res: Response) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (employee) {
      employee.name = req.body.name || employee.name;
      employee.mobile = req.body.mobile || employee.mobile;
      employee.address = req.body.address || employee.address;
      employee.dailyRate = req.body.dailyRate !== undefined ? req.body.dailyRate : employee.dailyRate;
      employee.status = req.body.status || employee.status;
      employee.notes = req.body.notes || employee.notes;

      const updatedEmployee = await employee.save();
      res.json({ success: true, data: updatedEmployee });
    } else {
      res.status(404).json({ success: false, message: 'Employee not found' });
    }
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
