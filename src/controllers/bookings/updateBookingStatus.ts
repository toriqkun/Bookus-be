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

    if (!id || !status) {
      return res.status(400).json({
        message: "Booking ID dan status wajib diisi",
      });
    }

    const allowedStatuses = [
      BookingStatus.CONFIRMED,
      BookingStatus.BORROWED,
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
      include: {
        user: true,
        service: true,
        slot: true,
      },
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

    if (
      status === BookingStatus.CONFIRMED &&
      booking.status === BookingStatus.PENDING
    ) {
      await prisma.slot.update({
        where: { id: booking.slotId },
        data: { isBooked: true, isCancelled: false },
      });

      const updated = await prisma.booking.update({
        where: { id },
        data: { status: BookingStatus.CONFIRMED, updatedAt: new Date() },
      });

      return res.status(200).json({
        message:
          "✅ Booking berhasil dikonfirmasi, user dapat mengambil buku di perpustakaan",
        data: updated,
      });
    }

    if (
      status === BookingStatus.BORROWED &&
      booking.status === BookingStatus.CONFIRMED
    ) {
      const updated = await prisma.booking.update({
        where: { id },
        data: {
          status: BookingStatus.BORROWED,
          updatedAt: new Date(),
        },
      });

      return res.status(200).json({
        message: "📚 Buku telah diambil oleh user (status: BORROWED)",
        data: updated,
      });
    }

    if (
      status === BookingStatus.COMPLETED &&
      booking.status === BookingStatus.BORROWED
    ) {
      const now = new Date();
      const isLate = now > booking.slot.endTime;

      await prisma.service.update({
        where: { id: booking.serviceId },
        data: { copies: { increment: 1 } },
      });

      await prisma.slot.update({
        where: { id: booking.slotId },
        data: { isBooked: false, isCancelled: false },
      });

      const updatedBooking = await prisma.booking.update({
        where: { id },
        data: {
          status: BookingStatus.COMPLETED,
          returnedAt: now,
          isLate,
          updatedAt: now,
        },
        include: {
          service: { select: { title: true, price: true } },
          slot: { select: { startTime: true, endTime: true } },
          user: { select: { id: true, name: true, email: true } },
        },
      });

      let penalty = 0;
      if (isLate && updatedBooking.service?.price) {
        const lateDays = Math.ceil(
          (now.getTime() - booking.slot.endTime.getTime()) /
            (1000 * 60 * 60 * 24)
        );
        const dailyPenalty = updatedBooking.service.price * 0.1;
        penalty = lateDays * dailyPenalty;
      }

      return res.status(200).json({
        message: `✅ Buku telah dikembalikan dan booking ditandai selesai${
          isLate ? " (TERLAMBAT)" : ""
        }`,
        data: {
          ...updatedBooking,
          penalty,
        },
      });
    }

    if (
      booking.status === BookingStatus.RESCHEDULED &&
      status === BookingStatus.CONFIRMED
    ) {
      await prisma.slot.update({
        where: { id: booking.slotId },
        data: { isBooked: true, isCancelled: false },
      });

      const updated = await prisma.booking.update({
        where: { id },
        data: {
          status: BookingStatus.CONFIRMED,
          cancelReason: null,
          updatedAt: new Date(),
        },
      });

      return res.status(200).json({
        message:
          "✅ Booking hasil reschedule telah dikonfirmasi kembali oleh admin",
        data: updated,
      });
    }

    if (status === BookingStatus.CANCELED) {
      await prisma.service.update({
        where: { id: booking.serviceId },
        data: { copies: { increment: 1 } },
      });

      await prisma.slot.update({
        where: { id: booking.slotId },
        data: { isCancelled: true, isBooked: false },
      });

      const updated = await prisma.booking.update({
        where: { id },
        data: {
          status: BookingStatus.CANCELED,
          cancelReason: cancelReason || "Dibatalkan oleh admin",
          updatedAt: new Date(),
        },
      });

      return res.status(200).json({
        message: "❌ Booking berhasil dibatalkan",
        data: updated,
      });
    }

    return res.status(400).json({
      message: `Transisi status dari ${booking.status} ke ${status} tidak diizinkan`,
    });
  } catch (err: any) {
    console.error("❌ ERROR updateBookingStatus:", err);
    return res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
};
