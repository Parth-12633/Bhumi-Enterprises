"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const employeeRoutes_1 = __importDefault(require("./routes/employeeRoutes"));
const siteRoutes_1 = __importDefault(require("./routes/siteRoutes"));
const workRecordRoutes_1 = __importDefault(require("./routes/workRecordRoutes"));
const paymentRoutes_1 = __importDefault(require("./routes/paymentRoutes"));
const reportRoutes_1 = __importDefault(require("./routes/reportRoutes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api/auth', authRoutes_1.default);
app.use('/api/employees', employeeRoutes_1.default);
app.use('/api/sites', siteRoutes_1.default);
app.use('/api/work-records', workRecordRoutes_1.default);
app.use('/api/payments', paymentRoutes_1.default);
app.use('/api/reports', reportRoutes_1.default);
app.get('/', (req, res) => {
    res.send('API is running...');
});
exports.default = app;
