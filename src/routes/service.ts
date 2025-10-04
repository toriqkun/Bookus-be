import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { createBook } from "../controllers/service/service";

import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";

import multer from "multer";

const prisma = new PrismaClient();
const router = Router();

router.post("/services", authenticate, authorize("ADMIN"), createBook);

router.get("/", async (req, res) => {
  const books = await prisma.service.findMany({
    include: { provider: true, slots: true },
  });
  res.json(books);
});

export default router;
