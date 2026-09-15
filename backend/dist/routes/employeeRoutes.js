"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const employeeController_1 = require("../controllers/employeeController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.route('/')
    .get(auth_1.protect, employeeController_1.getEmployees)
    .post(auth_1.protect, employeeController_1.createEmployee);
router.route('/:id')
    .get(auth_1.protect, employeeController_1.getEmployeeById)
    .patch(auth_1.protect, employeeController_1.updateEmployee);
exports.default = router;
