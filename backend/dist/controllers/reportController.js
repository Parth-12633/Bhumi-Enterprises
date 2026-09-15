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
exports.getEmployeeReport = void 0;
const WorkRecord_1 = __importDefault(require("../models/WorkRecord"));
const Payment_1 = __importDefault(require("../models/Payment"));
const mongoose_1 = __importDefault(require("mongoose"));
const getEmployeeReport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { month } = req.query; // format YYYY-MM
        if (!month) {
            return res.status(400).json({ success: false, message: 'Month is required (YYYY-MM)' });
        }
        const employeeId = new mongoose_1.default.Types.ObjectId(id);
        // Aggregate work records
        const workRecords = yield WorkRecord_1.default.aggregate([
            {
                $match: {
                    employeeId,
                    status: 'ACTIVE',
                    date: { $regex: `^${month}` }
                }
            },
            {
                $group: {
                    _id: null,
                    totalHajri: { $sum: '$hajri' },
                    totalEarned: { $sum: '$amount' }
                }
            }
        ]);
        const workStats = workRecords.length > 0 ? workRecords[0] : { totalHajri: 0, totalEarned: 0 };
        // Aggregate payments
        const payments = yield Payment_1.default.aggregate([
            {
                $match: {
                    employeeId,
                    status: 'ACTIVE',
                    date: { $regex: `^${month}` }
                }
            },
            {
                $group: {
                    _id: '$type',
                    totalAmount: { $sum: '$amount' }
                }
            }
        ]);
        let advance = 0;
        let otherPayments = 0;
        payments.forEach(p => {
            if (p._id === 'ADVANCE')
                advance += p.totalAmount;
            else
                otherPayments += p.totalAmount;
        });
        const totalPaid = advance + otherPayments;
        const balance = workStats.totalEarned - totalPaid;
        res.json({
            success: true,
            data: {
                totalHajri: workStats.totalHajri,
                totalEarned: workStats.totalEarned,
                advance,
                totalPaid,
                balance
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.getEmployeeReport = getEmployeeReport;
