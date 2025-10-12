import { Request, Response } from "express";
import { PrismaClient, BookingStatus } from "@prisma/client";
import { addDays, differenceInDays, isBefore } from "date-fns";

const prisma = new PrismaClient();

export const rescheduleBooking = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    const { newStartDate, newEndDate, notes } = req.body;

    if (!user || user.role !== "USER") {
      return res.status(403).json({
        message: "Akses ditolak: hanya user yang dapat mengubah jadwal booking",
      });
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        service: true,
        slot: true,
      },
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking tidak ditemukan" });
    }

    if (booking.userId !== user.id) {
      return res.status(403).json({
        message: "Anda tidak memiliki izin untuk mengubah booking ini",
      });
    }

    if (booking.status !== BookingStatus.CONFIRMED) {
      return res.status(400).json({
        message:
          "Booking hanya dapat dijadwalkan ulang jika statusnya CONFIRMED",
      });
    }

    const start = new Date(newStartDate);
    let end = newEndDate ? new Date(newEndDate) : null;

    if (isNaN(start.getTime())) {
      return res
        .status(400)
        .json({ message: "Tanggal mulai baru tidak valid" });
    }

    if (!end) {
      if (!booking.service.durationDays) {
        return res.status(400).json({
          message: "Service tidak memiliki durasi peminjaman yang valid",
        });
      }
      end = addDays(start, booking.service.durationDays);
    }

    if (isBefore(end, start)) {
      return res.status(400).json({
        message: "Tanggal akhir harus setelah tanggal mulai",
      });
    }

    const conflict = await prisma.booking.findFirst({
      where: {
        id: { not: booking.id },
        serviceId: booking.serviceId,
        status: {
          in: [
            BookingStatus.PENDING,
            BookingStatus.CONFIRMED,
            BookingStatus.RESCHEDULED,
          ],
        },
        slot: {
          startTime: { lte: end },
          endTime: { gte: start },
        },
      },
    });

    if (conflict) {
      return res.status(400).json({
        message:
          "Tanggal baru bentrok dengan booking lain. Silakan pilih jadwal lain.",
      });
    }

    const newSlot = await prisma.slot.create({
      data: {
        serviceId: booking.serviceId,
        startTime: start,
        endTime: end,
        isBooked: true,
      },
    });

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        slotId: newSlot.id,
        status: BookingStatus.RESCHEDULED,
        notes: notes || booking.notes,
        updatedAt: new Date(),
      },
      include: {
        service: { select: { id: true, title: true } },
        slot: { select: { id: true, startTime: true, endTime: true } },
      },
    });

    await prisma.slot.update({
      where: { id: booking.slotId },
      data: { isCancelled: true, isBooked: false },
    });

    return res.status(200).json({
      message: "✅ Booking berhasil dijadwalkan ulang",
      data: updatedBooking,
    });
  } catch (err: any) {
    console.error("❌ ERROR rescheduleBooking:", err);
    return res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
};
