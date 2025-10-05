import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { createBooking } from "../controllers/bookings/createBooking";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { getBookings } from "../controllers/bookings/getBooking";

const prisma = new PrismaClient();
const router = Router();

router.post("/", authenticate, authorize("USER"), createBooking);
router.get("/", authenticate, authorize("USER"), getBookings);

export default router;
