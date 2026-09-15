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
exports.voidWorkRecord = exports.updateWorkRecord = exports.createWorkRecord = exports.getWorkRecords = void 0;
const WorkRecord_1 = __importDefault(require("../models/WorkRecord"));
const Employee_1 = __importDefault(require("../models/Employee"));
const ActivityLog_1 = __importDefault(require("../models/ActivityLog"));
const getWorkRecords = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { employeeId, date, month } = req.query;
        let query = { status: 'ACTIVE' };
        if (employeeId)
            query.employeeId = employeeId;
        if (date)
            query.date = date;
        if (month) {
            // month format YYYY-MM
            query.date = { $regex: `^${month}` };
        }
        const records = yield WorkRecord_1.default.find(query)
            .populate('siteId', 'name')
            .populate('createdBy', 'name')
            .populate('updatedBy', 'name')
            .sort({ date: -1, createdAt: -1 });
        res.json({ success: true, data: records });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.getWorkRecords = getWorkRecords;
const createWorkRecord = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { employeeId, siteId, date, hajri, workDescription, notes } = req.body;
        const employee = yield Employee_1.default.findById(employeeId);
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }
        const rate = employee.dailyRate;
        const amount = Math.round(hajri * rate);
        const record = new WorkRecord_1.default({
            employeeId,
            siteId,
            date,
            hajri,
            rate,
            amount,
            workDescription,
            notes,
            createdBy: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id
        });
        const createdRecord = yield record.save();
        yield ActivityLog_1.default.create({
            userId: (_b = req.user) === null || _b === void 0 ? void 0 : _b._id,
            action: 'CREATE',
            entityType: 'WorkRecord',
            entityId: createdRecord._id,
            employeeId,
            siteId,
            after: createdRecord
        });
        res.status(201).json({ success: true, data: createdRecord });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
exports.createWorkRecord = createWorkRecord;
const updateWorkRecord = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const record = yield WorkRecord_1.default.findById(req.params.id);
        if (!record) {
            return res.status(404).json({ success: false, message: 'Work record not found' });
        }
        // Optimistic concurrency check
        if (req.body.version !== undefined && record.version !== req.body.version) {
            return res.status(409).json({ success: false, message: 'This record was updated by another user. Please refresh and review the latest data.' });
        }
        const before = record.toObject();
        if (req.body.hajri !== undefined) {
            record.hajri = req.body.hajri;
            // Recalculate amount using the snapped rate
            record.amount = Math.round(record.hajri * record.rate);
        }
        if (req.body.siteId)
            record.siteId = req.body.siteId;
        if (req.body.date)
            record.date = req.body.date;
        if (req.body.workDescription !== undefined)
            record.workDescription = req.body.workDescription;
        if (req.body.notes !== undefined)
            record.notes = req.body.notes;
        record.updatedBy = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        const updatedRecord = yield record.save();
        yield ActivityLog_1.default.create({
            userId: (_b = req.user) === null || _b === void 0 ? void 0 : _b._id,
            action: 'UPDATE',
            entityType: 'WorkRecord',
            entityId: updatedRecord._id,
            employeeId: updatedRecord.employeeId,
            siteId: updatedRecord.siteId,
            before,
            after: updatedRecord,
            reason: req.body.reason
        });
        res.json({ success: true, data: updatedRecord });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
exports.updateWorkRecord = updateWorkRecord;
const voidWorkRecord = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const record = yield WorkRecord_1.default.findById(req.params.id);
        if (!record) {
            return res.status(404).json({ success: false, message: 'Work record not found' });
        }
        record.status = 'VOIDED';
        record.updatedBy = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        const voidedRecord = yield record.save();
        yield ActivityLog_1.default.create({
            userId: (_b = req.user) === null || _b === void 0 ? void 0 : _b._id,
            action: 'VOID',
            entityType: 'WorkRecord',
            entityId: record._id,
            employeeId: record.employeeId,
            siteId: record.siteId,
            reason: req.body.reason
        });
        res.json({ success: true, data: voidedRecord });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
exports.voidWorkRecord = voidWorkRecord;
