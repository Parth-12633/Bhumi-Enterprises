"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const paymentController_1 = require("../controllers/paymentController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.route('/')
    .get(auth_1.protect, paymentController_1.getPayments)
    .post(auth_1.protect, paymentController_1.createPayment);
router.route('/:id')
    .patch(auth_1.protect, paymentController_1.updatePayment);
exports.default = router;
