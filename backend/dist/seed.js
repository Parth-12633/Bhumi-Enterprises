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
const dotenv_1 = __importDefault(require("dotenv"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const User_1 = __importDefault(require("./models/User"));
const db_1 = __importDefault(require("./config/db"));
dotenv_1.default.config();
const seedUsers = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, db_1.default)();
        yield User_1.default.deleteMany();
        const passwordHash = yield bcrypt_1.default.hash('password123', 10);
        const users = [
            {
                name: 'Father',
                email: 'father@example.com',
                passwordHash,
                role: 'OWNER'
            },
            {
                name: 'Friend 1',
                email: 'friend1@example.com',
                passwordHash,
                role: 'OWNER'
            },
            {
                name: 'Friend 2',
                email: 'friend2@example.com',
                passwordHash,
                role: 'OWNER'
            }
        ];
        yield User_1.default.insertMany(users);
        console.log('Users seeded successfully');
        process.exit();
    }
    catch (error) {
        console.error('Error seeding users:', error);
        process.exit(1);
    }
});
seedUsers();
