import { Request, Response } from "express";
import { PrismaClient, BookingStatus } from "@prisma/client";

const prisma = new PrismaClient();

export const createBooking = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    if (!user || user.role !== "USER") {
      return res
        .status(403)
        .json({ message: "Hanya user yang bisa melakukan booking" });
    }

    const { serviceId, startDate, endDate, notes } = req.body;

    if (!serviceId || !startDate || !endDate) {
      return res.status(400).json({
        message: "Field serviceId, startDate, dan endDate wajib diisi",
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
          OR: [
            {
              startTime: { lte: new Date(endDate) },
              endTime: { gte: new Date(startDate) },
            },
          ],
        },
      },
      include: { slot: true },
    });

    if (conflictBooking) {
      return res.status(400).json({
        message:
          "Buku sedang dipinjam pada tanggal tersebut, silakan pilih tanggal lain",
      });
    }

    const slot = await prisma.slot.create({
      data: {
        serviceId,
        startTime: new Date(startDate),
        endTime: new Date(endDate),
      },
    });

    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        serviceId,
        slotId: slot.id,
        notes: notes || null,
        status: BookingStatus.PENDING,
      },
    });

    await prisma.service.update({
      where: { id: serviceId },
      data: { copies: service.copies - 1 },
    });

    return res.status(201).json({
      message: "Booking berhasil dibuat",
      booking,
    });
  } catch (err: any) {
    console.error("ERROR createBooking:", err);
    return res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
};
