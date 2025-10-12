import { Request, Response } from "express";
import { PrismaClient, BookingStatus } from "@prisma/client";

const prisma = new PrismaClient();

export const updateBookingStatus = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    const { status, cancelReason } = req.body;

    if (!user || user.role !== "ADMIN") {
      return res.status(403).json({
        message:
          "Akses ditolak: hanya admin yang dapat mengubah status booking",
      });
    }

    if (!id) {
      return res.status(400).json({ message: "Booking ID wajib diisi" });
    }

    if (!status) {
      return res.status(400).json({ message: "Field status wajib diisi" });
    }
    const allowedStatuses = [
      BookingStatus.CONFIRMED,
      BookingStatus.CANCELED,
      BookingStatus.RESCHEDULED,
      BookingStatus.COMPLETED,
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: `Status tidak valid. Hanya bisa: ${allowedStatuses.join(
          ", "
        )}`,
      });
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { slot: true, service: true, user: true },
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking tidak ditemukan" });
    }

    if (
      booking.status === BookingStatus.CANCELED ||
      booking.status === BookingStatus.COMPLETED
    ) {
      return res.status(400).json({
        message: `Booking dengan status ${booking.status} tidak bisa diubah lagi`,
      });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status,
        cancelReason: status === BookingStatus.CANCELED ? cancelReason : null,
        updatedAt: new Date(),
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        service: { select: { id: true, title: true } },
        slot: { select: { id: true, startTime: true, endTime: true } },
      },
    });

    if (status === BookingStatus.CANCELED) {
      await prisma.service.update({
        where: { id: booking.serviceId },
        data: { copies: { increment: 1 } },
      });

      await prisma.slot.update({
        where: { id: booking.slotId },
        data: { isCancelled: true, isBooked: false },
      });
    }

    return res.status(200).json({
      message: `✅ Status booking berhasil diubah menjadi ${status}`,
      data: updatedBooking,
    });
  } catch (err: any) {
    console.error("❌ ERROR updateBookingStatus:", err);
    return res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
};
