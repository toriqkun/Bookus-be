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
exports.getAllServices = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getAllServices = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const services = yield prisma.service.findMany({
            include: {
                provider: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                slots: {
                    select: {
                        id: true,
                        startTime: true,
                        endTime: true,
                        isBooked: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        return res.status(200).json({
            message: "Daftar semua buku berhasil diambil",
            count: services.length,
            data: services,
        });
    }
    catch (error) {
        console.error("ERROR getAllServices:", error);
        return res.status(500).json({
            message: "Gagal mengambil daftar buku",
            error: error.message,
        });
    }
});
exports.getAllServices = getAllServices;
