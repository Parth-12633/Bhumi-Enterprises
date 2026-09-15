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
exports.updateSite = exports.createSite = exports.getSiteById = exports.getSites = void 0;
const Site_1 = __importDefault(require("../models/Site"));
const getSites = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sites = yield Site_1.default.find({}).sort({ name: 1 });
        res.json({ success: true, data: sites });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.getSites = getSites;
const getSiteById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const site = yield Site_1.default.findById(req.params.id);
        if (site) {
            res.json({ success: true, data: site });
        }
        else {
            res.status(404).json({ success: false, message: 'Site not found' });
        }
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.getSiteById = getSiteById;
const createSite = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, location, clientName, notes } = req.body;
        const site = new Site_1.default({
            name,
            location,
            clientName,
            notes
        });
        const createdSite = yield site.save();
        res.status(201).json({ success: true, data: createdSite });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
exports.createSite = createSite;
const updateSite = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const site = yield Site_1.default.findById(req.params.id);
        if (site) {
            site.name = req.body.name || site.name;
            site.location = req.body.location || site.location;
            site.clientName = req.body.clientName || site.clientName;
            site.status = req.body.status || site.status;
            site.notes = req.body.notes || site.notes;
            const updatedSite = yield site.save();
            res.json({ success: true, data: updatedSite });
        }
        else {
            res.status(404).json({ success: false, message: 'Site not found' });
        }
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
exports.updateSite = updateSite;
