import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { createBook } from "../controllers/service/createService";
import { getAllServices } from "../controllers/service/getService";

import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { upload } from "../middleware/multer";

import multer from "multer";

const prisma = new PrismaClient();
const router = Router();

router.post(
  "/services",
  authenticate,
  authorize("ADMIN"),
  upload.single("cover"),
  createBook
);

router.get("/services", authenticate, getAllServices);

export default router;
