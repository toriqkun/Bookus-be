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
const prisma = new client_1.PrismaClient();
const createBook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user || user.role !== "ADMIN") {
            return res
                .status(403)
                .json({ message: "Hanya admin yang bisa menambahkan buku" });
        }
        const { title, author, isbn, description, durationDays, price, copies, isActive, } = req.body;
        if (!title || !author || !price) {
            return res
                .status(400)
                .json({ message: "Field title, author, dan price wajib diisi" });
        }
        const coverImage = req.file ? `/uploads/book/${req.file.filename}` : null;
        const bookData = {
            title,
            author,
            isbn: isbn || null,
            description: description || null,
            durationDays: durationDays ? Number(durationDays) : null,
            price: price ? Number(price) : null,
            copies: copies ? Number(copies) : 1,
            isActive: isActive === "false" ? false : true,
            coverImage,
            providerId: user.id,
        };
        const newBook = yield prisma.service.create({
            data: bookData,
        });
        return res.status(201).json({
            message: "Buku berhasil ditambahkan",
            book: newBook,
        });
    }
    catch (err) {
        console.error("❌ ERROR createBook:", err);
        return res.status(500).json({
            message: "Internal server error",
            error: err.message,
        });
    }
});
exports.createBook = createBook;
