import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getAllServices = async (req: Request, res: Response) => {
  try {
    const services = await prisma.service.findMany({
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        slots: {
          select: {
            id: true,
            startTime: true,
            endTime: true,
            isBooked: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      message: "Daftar semua buku berhasil diambil",
      count: services.length,
      data: services,
    });
  } catch (error: any) {
    console.error("ERROR getAllServices:", error);
    return res.status(500).json({
      message: "Gagal mengambil daftar buku",
      error: error.message,
    });
  }
};
