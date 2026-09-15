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
exports.updatePayment = exports.createPayment = exports.getPayments = void 0;
const Payment_1 = __importDefault(require("../models/Payment"));
const ActivityLog_1 = __importDefault(require("../models/ActivityLog"));
const getPayments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { employeeId, date, month } = req.query;
        let query = { status: 'ACTIVE' };
        if (employeeId)
            query.employeeId = employeeId;
        if (date)
            query.date = date;
        if (month) {
            query.date = { $regex: `^${month}` };
        }
        const payments = yield Payment_1.default.find(query)
            .populate('createdBy', 'name')
            .populate('updatedBy', 'name')
            .sort({ date: -1, createdAt: -1 });
        res.json({ success: true, data: payments });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.getPayments = getPayments;
const createPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { employeeId, amount, type, paymentMethod, date, note } = req.body;
        const payment = new Payment_1.default({
            employeeId,
            amount,
            type,
            paymentMethod,
            date,
            note,
            createdBy: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id
        });
        const createdPayment = yield payment.save();
        yield ActivityLog_1.default.create({
            userId: (_b = req.user) === null || _b === void 0 ? void 0 : _b._id,
            action: 'PAYMENT_CREATE',
            entityType: 'Payment',
            entityId: createdPayment._id,
            employeeId,
            after: createdPayment
        });
        res.status(201).json({ success: true, data: createdPayment });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
exports.createPayment = createPayment;
const updatePayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const payment = yield Payment_1.default.findById(req.params.id);
        if (!payment) {
            return res.status(404).json({ success: false, message: 'Payment not found' });
        }
        if (req.body.version !== undefined && payment.version !== req.body.version) {
            return res.status(409).json({ success: false, message: 'This record was updated by another user.' });
        }
        const before = payment.toObject();
        if (req.body.amount !== undefined)
            payment.amount = req.body.amount;
        if (req.body.type)
            payment.type = req.body.type;
        if (req.body.paymentMethod)
            payment.paymentMethod = req.body.paymentMethod;
        if (req.body.date)
            payment.date = req.body.date;
        if (req.body.note !== undefined)
            payment.note = req.body.note;
        payment.updatedBy = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        const updatedPayment = yield payment.save();
        yield ActivityLog_1.default.create({
            userId: (_b = req.user) === null || _b === void 0 ? void 0 : _b._id,
            action: 'PAYMENT_UPDATE',
            entityType: 'Payment',
            entityId: updatedPayment._id,
            employeeId: updatedPayment.employeeId,
            before,
            after: updatedPayment,
            reason: req.body.reason
        });
        res.json({ success: true, data: updatedPayment });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
exports.updatePayment = updatePayment;
