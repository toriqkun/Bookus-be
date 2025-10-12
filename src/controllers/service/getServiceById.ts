import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getServiceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const book = await prisma.service.findUnique({
      where: { id },
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
          orderBy: { startTime: "asc" },
        },
      },
    });

    if (!book) {
      return res.status(404).json({
        message: "Buku tidak ditemukan",
      });
    }

    return res.status(200).json({
      message: "Detail buku berhasil diambil",
      data: book,
    });
  } catch (error: any) {
    console.error("❌ ERROR getServiceById:", error);
    return res.status(500).json({
      message: "Gagal mengambil detail buku",
      error: error.message,
    });
  }
};
