"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const workRecordController_1 = require("../controllers/workRecordController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.route('/')
    .get(auth_1.protect, workRecordController_1.getWorkRecords)
    .post(auth_1.protect, workRecordController_1.createWorkRecord);
router.route('/:id')
    .patch(auth_1.protect, workRecordController_1.updateWorkRecord);
router.route('/:id/void')
    .post(auth_1.protect, workRecordController_1.voidWorkRecord);
exports.default = router;
