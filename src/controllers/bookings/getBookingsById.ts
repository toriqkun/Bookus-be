import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getBookingById = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Booking ID wajib diisi" });
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
          },
        },
        service: {
          select: {
            id: true,
            title: true,
            author: true,
            genre: true,
            durationDays: true,
            copies: true,
            provider: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        slot: {
          select: {
            id: true,
            startTime: true,
            endTime: true,
            isBooked: true,
            isCancelled: true,
          },
        },
      },
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking tidak ditemukan" });
    }

    if (user.role !== "ADMIN" && booking.userId !== user.id) {
      return res.status(403).json({
        message: "Anda tidak memiliki izin untuk melihat booking ini",
      });
    }

    return res.status(200).json({
      message: "✅ Detail booking berhasil diambil",
      data: booking,
    });
  } catch (err: any) {
    console.error("❌ ERROR getBookingById:", err);
    return res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
};
