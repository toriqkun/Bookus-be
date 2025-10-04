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
exports.register = void 0;
const joi_1 = __importDefault(require("joi"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const registerSchema = joi_1.default.object({
    name: joi_1.default.string().min(3).max(50).required(),
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().min(6).required(),
    confirmPassword: joi_1.default.any().valid(joi_1.default.ref("password")).required().messages({
        "any.only": "Konfirmasi password tidak sama dengan password",
    }),
});
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { error } = registerSchema.validate(req.body, { abortEarly: false });
        if (error) {
            return res.status(400).json({
                message: "Validasi gagal",
                errors: error.details.map((d) => d.message),
            });
        }
        const { name, email, password } = req.body;
        const existingUser = yield prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "Email sudah digunakan" });
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const newUser = yield prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: "USER",
                isVerified: false,
            },
        });
        res.status(201).json({
            message: "Registrasi berhasil",
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
            },
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.register = register;
