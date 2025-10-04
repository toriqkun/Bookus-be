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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBook = void 0;
const client_1 = require("@prisma/client");
const serviceSchema_1 = require("../../validations/serviceSchema");
const prisma = new client_1.PrismaClient();
// Admin menambahkan buku
const createBook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { error, value } = serviceSchema_1.createBookSchema.validate(req.body, {
            abortEarly: false,
        });
        if (error) {
            return res.status(400).json({
                message: "Validasi gagal",
                errors: error.details.map((d) => d.message),
            });
        }
        const user = req.user;
        if (!user || user.role !== "ADMIN") {
            return res
                .status(403)
                .json({ message: "Hanya admin yang bisa menambahkan buku" });
        }
        const newBook = yield prisma.service.create({
            data: value,
        });
        res.status(201).json({
            message: "Buku berhasil ditambahkan",
            book: newBook,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.createBook = createBook;
