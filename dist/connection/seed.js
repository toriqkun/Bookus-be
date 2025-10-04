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
const client_1 = require("@prisma/client");
const enum_1 = require("../enum");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const hashedPassword = yield bcrypt_1.default.hash("123456", 10);
        const admin = yield prisma.user.create({
            data: {
                email: "bookus@library.com",
                password: hashedPassword,
                name: "Central Library",
                role: enum_1.Role.ADMIN,
            },
        });
        const user = yield prisma.user.create({
            data: {
                email: "madara@gmail.com",
                password: hashedPassword,
                name: "Madara Uchiha",
                role: enum_1.Role.USER,
            },
        });
        yield prisma.service.createMany({
            data: [
                {
                    providerId: admin.id,
                    title: "Bulan",
                    author: "Tere Liye",
                    isbn: "9786020314112",
                    description: "Petualangan Raib, Seli, dan Ali ke Klan Matahari yang penuh bahaya.",
                    coverUrl: "/uploads/book/bulan.jpeg",
                    durationDays: 7,
                    price: 0,
                    copies: 3,
                },
                {
                    providerId: admin.id,
                    title: "Laskar Pelangi",
                    author: "Andrea Hirata",
                    isbn: "9789793062797",
                    description: "Kisah inspiratif anak-anak Belitung yang penuh perjuangan dalam pendidikan.",
                    coverUrl: "/uploads/book/laskar-pelangi.jpg",
                    durationDays: 10,
                    price: 0,
                    copies: 5,
                },
                {
                    providerId: admin.id,
                    title: "Clean Code",
                    author: "Robert C. Martin",
                    isbn: "9780132350884",
                    description: "Panduan menulis kode yang bersih, rapi, dan maintainable.",
                    coverUrl: "/uploads/book/cleancode.jpg",
                    durationDays: 14,
                    price: 0,
                    copies: 2,
                },
            ],
        });
        const book = yield prisma.service.findFirst({
            where: { title: "Bulan" },
        });
        if (book) {
            const slot = yield prisma.slot.create({
                data: {
                    serviceId: book.id,
                    startTime: new Date("2025-10-05T09:00:00.000Z"),
                    endTime: new Date("2025-10-12T09:00:00.000Z"),
                },
            });
            yield prisma.booking.create({
                data: {
                    userId: user.id,
                    serviceId: book.id,
                    slotId: slot.id,
                    status: enum_1.BookingStatus.PENDING,
                },
            });
        }
        console.log("✅ Seeder selesai, data awal masuk ke database.");
    });
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}));
