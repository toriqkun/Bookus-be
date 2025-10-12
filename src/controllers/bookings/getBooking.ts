import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getBookings = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    const { status } = req.query;

    let where: any = {};
    if (user.role === "USER") {
      where.userId = user.id;
    }
    if (status) {
      where.status = status;
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        user:
          user.role === "ADMIN"
            ? { select: { id: true, name: true, email: true } }
            : false,
        service: { select: { id: true, title: true } },
        slot: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      message: "Daftar booking berhasil diambil",
      count: bookings.length,
      bookings,
    });
  } catch (err: any) {
    console.error("❌ ERROR getBookings:", err);
    return res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
};
