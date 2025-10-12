import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { createBooking } from "../controllers/bookings/createBooking";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { getBookings } from "../controllers/bookings/getBooking";
import { getAllBookings } from "../controllers/bookings/getBookingAll";
import { getBookingById } from "../controllers/bookings/getBookingsById";
import { updateBookingStatus } from "../controllers/bookings/updateBookingStatus";
import { cancelBooking } from "../controllers/bookings/cancelBooking";
import { rescheduleBooking } from "../controllers/bookings/rescheduleBooking";

const prisma = new PrismaClient();
const router = Router();

router.get("/all", authenticate, authorize("ADMIN"), getAllBookings);
router.get("/:id", authenticate, getBookingById);

router.post("/", authenticate, authorize("USER"), createBooking);
router.get("/", authenticate, authorize("USER"), getBookings);
router.patch("/cancel/:id", authenticate, authorize("USER"), cancelBooking);
router.patch(
  "/reschedule/:id",
  authenticate,
  authorize("USER"),
  rescheduleBooking
);

router.patch(
  "/status/:id",
  authenticate,
  authorize("ADMIN"),
  updateBookingStatus
);

export default router;
