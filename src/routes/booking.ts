import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();

router.get("/", async (req, res) => {
  const bookings = await prisma.booking.findMany({
    include: { user: true, service: true, slot: true },
  });
  res.json(bookings);
});

export default router;
