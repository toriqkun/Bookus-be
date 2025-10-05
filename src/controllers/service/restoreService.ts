import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const restoreBook = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    if (!user || user.role !== "ADMIN") {
      return res
        .status(403)
        .json({ message: "Hanya admin yang bisa mengaktifkan kembali buku" });
    }

    const existingBook = await prisma.service.findUnique({
      where: { id },
    });

    if (!existingBook) {
      return res.status(404).json({ message: "Buku tidak ditemukan" });
    }

    if (existingBook.isActive) {
      return res
        .status(400)
        .json({ message: "Buku ini sudah dalam keadaan aktif" });
    }

    const restoredBook = await prisma.service.update({
      where: { id },
      data: {
        isActive: true,
      },
    });

    return res.status(200).json({
      message: `Buku "${existingBook.title}" berhasil diaktifkan kembali`,
      book: restoredBook,
    });
  } catch (err: any) {
    console.error("ERROR restoreBook:", err);
    return res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
};
