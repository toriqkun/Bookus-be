"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const router = (0, express_1.Router)();
// router.get("/", async (req, res) => {
//   const bookings = await prisma.booking.findMany({
//     include: { user: true, service: true, slot: true },
//   });
//   res.json(bookings);
// });
exports.default = router;
