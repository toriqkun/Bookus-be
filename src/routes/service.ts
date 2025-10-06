import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { createBook } from "../controllers/service/createService";
import { getAllServices } from "../controllers/service/getService";
import { updateBook } from "../controllers/service/editServices";

import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { upload } from "../middleware/multer";

import multer from "multer";
import { deleteBook } from "../controllers/service/deleteService";
import { softDeleteBook } from "../controllers/service/softDeleteService";
import { restoreBook } from "../controllers/service/restoreService";

const prisma = new PrismaClient();
const router = Router();

router.get("/services", authenticate, getAllServices);

router.post(
  "/services",
  authenticate,
  authorize("ADMIN"),
  upload.single("cover"),
  createBook
);

router.put(
  "/services/:id",
  authenticate,
  authorize("ADMIN"),
  upload.single("cover"),
  updateBook
);

router.delete("/services/:id", authenticate, authorize("ADMIN"), deleteBook);
router.patch("/services/:id", authenticate, authorize("ADMIN"), softDeleteBook);
router.patch(
  "/services/restore/:id",
  authenticate,
  authorize("ADMIN"),
  restoreBook
);

export default router;
