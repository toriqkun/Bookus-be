import { Request, Response } from "express";
import { PrismaClient, BookingStatus } from "@prisma/client";

const prisma = new PrismaClient();

export const cancelBooking = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    const { cancelReason } = req.body;

    if (!user || user.role !== "USER") {
      return res.status(403).json({
        message: "Akses ditolak: hanya user yang dapat membatalkan booking",
      });
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { slot: true, service: true },
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking tidak ditemukan" });
    }

    if (booking.userId !== user.id) {
      return res.status(403).json({
        message: "Anda tidak memiliki izin untuk membatalkan booking ini",
      });
    }

    if (
      booking.status === BookingStatus.CANCELED ||
      booking.status === BookingStatus.COMPLETED
    ) {
      return res.status(400).json({
        message: `Booking dengan status ${booking.status} tidak bisa dibatalkan`,
      });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: BookingStatus.CANCELED,
        cancelReason: cancelReason || "Dibatalkan oleh user",
        updatedAt: new Date(),
      },
      include: {
        service: { select: { id: true, title: true } },
        slot: { select: { id: true, startTime: true, endTime: true } },
      },
    });

    await prisma.service.update({
      where: { id: booking.serviceId },
      data: { copies: { increment: 1 } },
    });

    await prisma.slot.update({
      where: { id: booking.slotId },
      data: { isCancelled: true, isBooked: false },
    });

    return res.status(200).json({
      message: "✅ Booking berhasil dibatalkan",
      data: updatedBooking,
    });
  } catch (err: any) {
    console.error("❌ ERROR cancelBooking:", err);
    return res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
};
