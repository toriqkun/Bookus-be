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
exports.logout = exports.login = void 0;
const joi_1 = __importDefault(require("joi"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const client_1 = require("@prisma/client");
const jwt_1 = require("../../utils/jwt");
const prisma = new client_1.PrismaClient();
const loginSchema = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().min(6).required(),
});
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { error } = loginSchema.validate(req.body);
        if (error)
            return res.status(400).json({ message: error.message });
        const { email, password } = req.body;
        const user = yield prisma.user.findUnique({ where: { email } });
        if (!user)
            return res.status(404).json({ message: "User tidak ditemukan" });
        const validPassword = yield bcrypt_1.default.compare(password, user.password);
        if (!validPassword)
            return res.status(401).json({ message: "Password salah" });
        const token = (0, jwt_1.generateToken)({ id: user.id, role: user.role });
        res.cookie("user_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 24 * 60 * 60 * 1000,
        });
        res.json({
            message: "Login berhasil",
            user: { id: user.id, email: user.email, role: user.role },
            token,
        });
    }
    catch (err) {
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.login = login;
const logout = (req, res) => {
    res.clearCookie("user_token");
    res.json({ message: "Logout berhasil" });
};
exports.logout = logout;
