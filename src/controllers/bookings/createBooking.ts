import { Request, Response } from "express";
import { PrismaClient, BookingStatus } from "@prisma/client";
import { addDays, differenceInDays, isBefore } from "date-fns";

const prisma = new PrismaClient();

export const createBooking = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    if (!user || user.role !== "USER") {
      return res.status(403).json({
        message: "Hanya user yang bisa melakukan booking",
      });
    }

    const { serviceId, startDate, endDate, notes } = req.body;

    if (!serviceId || !startDate) {
      return res.status(400).json({
        message: "Field serviceId dan startDate wajib diisi",
      });
    }

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return res.status(404).json({ message: "Buku tidak ditemukan" });
    }

    if (service.copies <= 0) {
      return res.status(400).json({ message: "Stok buku sedang kosong" });
    }

    const start = new Date(startDate);
    if (isNaN(start.getTime())) {
      return res.status(400).json({ message: "Tanggal mulai tidak valid" });
    }

    let end = endDate ? new Date(endDate) : null;
    if (!end) {
      if (!service.durationDays || service.durationDays <= 0) {
        return res.status(400).json({
          message:
            "Service ini tidak memiliki batas durasi peminjaman yang valid",
        });
      }
      end = addDays(start, service.durationDays);
    }

    if (isBefore(end, start)) {
      return res.status(400).json({
        message: "Tanggal akhir harus setelah tanggal mulai",
      });
    }

    const diffDays = differenceInDays(end, start);
    if (service.durationDays && diffDays > service.durationDays) {
      return res.status(400).json({
        message: `Durasi peminjaman maksimal ${service.durationDays} hari`,
      });
    }

    const conflictBooking = await prisma.booking.findFirst({
      where: {
        serviceId,
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

    if (conflictBooking) {
      return res.status(400).json({
        message:
          "Buku sedang dipinjam pada tanggal tersebut, silakan pilih tanggal lain",
      });
    }

    const booking = await prisma.$transaction(async (tx) => {
      const slot = await tx.slot.create({
        data: {
          serviceId,
          startTime: start,
          endTime: end,
        },
      });

      const newBooking = await tx.booking.create({
        data: {
          userId: user.id,
          serviceId,
          slotId: slot.id,
          notes: notes || null,
          status: BookingStatus.PENDING,
        },
        include: {
          slot: true,
          service: true,
        },
      });

      await tx.service.update({
        where: { id: serviceId },
        data: { copies: { decrement: 1 } },
      });

      return newBooking;
    });

    return res.status(201).json({
      message: "✅ Booking berhasil dibuat",
      booking,
      autoEndDateUsed: !endDate,
    });
  } catch (err: any) {
    console.error("❌ ERROR createBooking:", err);
    return res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
};
