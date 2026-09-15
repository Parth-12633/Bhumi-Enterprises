"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateEmployee = exports.createEmployee = exports.getEmployeeById = exports.getEmployees = void 0;
const Employee_1 = __importDefault(require("../models/Employee"));
const getEmployees = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const employees = yield Employee_1.default.find({}).sort({ name: 1 });
        res.json({ success: true, data: employees });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.getEmployees = getEmployees;
const getEmployeeById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const employee = yield Employee_1.default.findById(req.params.id);
        if (employee) {
            res.json({ success: true, data: employee });
        }
        else {
            res.status(404).json({ success: false, message: 'Employee not found' });
        }
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.getEmployeeById = getEmployeeById;
const createEmployee = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, mobile, address, dailyRate, notes } = req.body;
        const employee = new Employee_1.default({
            name,
            mobile,
            address,
            dailyRate,
            notes
        });
        const createdEmployee = yield employee.save();
        res.status(201).json({ success: true, data: createdEmployee });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
exports.createEmployee = createEmployee;
const updateEmployee = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const employee = yield Employee_1.default.findById(req.params.id);
        if (employee) {
            employee.name = req.body.name || employee.name;
            employee.mobile = req.body.mobile || employee.mobile;
            employee.address = req.body.address || employee.address;
            employee.dailyRate = req.body.dailyRate !== undefined ? req.body.dailyRate : employee.dailyRate;
            employee.status = req.body.status || employee.status;
            employee.notes = req.body.notes || employee.notes;
            const updatedEmployee = yield employee.save();
            res.json({ success: true, data: updatedEmployee });
        }
        else {
            res.status(404).json({ success: false, message: 'Employee not found' });
        }
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
exports.updateEmployee = updateEmployee;
