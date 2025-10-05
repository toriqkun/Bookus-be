import { Request, Response } from "express";
import { PrismaClient, BookingStatus } from "@prisma/client";

const prisma = new PrismaClient();

export const getBookings = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    let bookings;
    if (user.role === "ADMIN") {
      bookings = await prisma.booking.findMany({
        include: {
          user: { select: { id: true, name: true, email: true } },
          service: { select: { id: true, title: true } },
          slot: true,
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      bookings = await prisma.booking.findMany({
        where: { userId: user.id },
        include: {
          service: { select: { id: true, title: true } },
          slot: true,
        },
        orderBy: { createdAt: "desc" },
      });
    }

    return res.status(200).json({
      message: "Daftar booking berhasil diambil",
      bookings,
    });
  } catch (err: any) {
    console.error("ERROR getBookings:", err);
    return res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
};
