import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const softDeleteBook = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    if (!user || user.role !== "ADMIN") {
      return res
        .status(403)
        .json({ message: "Hanya admin yang bisa menonaktifkan buku" });
    }

    const existingBook = await prisma.service.findUnique({
      where: { id },
    });

    if (!existingBook) {
      return res.status(404).json({ message: "Buku tidak ditemukan" });
    }

    const updatedBook = await prisma.service.update({
      where: { id },
      data: {
        isActive: false,
      },
    });

    return res.status(200).json({
      message: `Buku "${existingBook.title}" telah dinonaktifkan (soft delete)`,
      book: updatedBook,
    });
  } catch (err: any) {
    console.error("❌ ERROR softDeleteBook:", err);
    return res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
};
