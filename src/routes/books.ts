import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();

router.get("/", async (req, res) => {
  const books = await prisma.service.findMany({
    include: { provider: true, slots: true },
  });
  res.json(books);
});

export default router;
