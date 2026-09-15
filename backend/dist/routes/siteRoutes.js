"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const siteController_1 = require("../controllers/siteController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.route('/')
    .get(auth_1.protect, siteController_1.getSites)
    .post(auth_1.protect, siteController_1.createSite);
router.route('/:id')
    .get(auth_1.protect, siteController_1.getSiteById)
    .patch(auth_1.protect, siteController_1.updateSite);
exports.default = router;
