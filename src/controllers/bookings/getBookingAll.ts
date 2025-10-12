import { Request, Response } from "express";
import { PrismaClient, BookingStatus } from "@prisma/client";

const prisma = new PrismaClient();

export const getAllBookings = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    if (!user || user.role !== "ADMIN") {
      return res.status(403).json({
        message: "Akses ditolak: hanya admin yang dapat melihat semua booking",
      });
    }

    const { status, userId, serviceId, page = "1", limit = "10" } = req.query;

    const pageNum = Math.max(parseInt(page as string, 10), 1);
    const pageSize = Math.max(parseInt(limit as string, 10), 1);
    const skip = (pageNum - 1) * pageSize;

    const where: any = {};

    if (
      status &&
      Object.values(BookingStatus).includes(status as BookingStatus)
    ) {
      where.status = status as BookingStatus;
    }
    if (userId) where.userId = userId as string;
    if (serviceId) where.serviceId = serviceId as string;

    const totalBookings = await prisma.booking.count({ where });

    const bookings = await prisma.booking.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
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

    const totalPages = Math.ceil(totalBookings / pageSize);

    return res.status(200).json({
      message: "✅ Daftar semua booking berhasil diambil",
      pagination: {
        totalData: totalBookings,
        currentPage: pageNum,
        totalPages,
        limit: pageSize,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
      data: bookings,
    });
  } catch (err: any) {
    console.error("❌ ERROR getAllBookings:", err);
    return res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
};
