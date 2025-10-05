import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const deleteBook = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    if (!user || user.role !== "ADMIN") {
      return res
        .status(403)
        .json({ message: "Hanya admin yang bisa menghapus buku" });
    }

    const existingBook = await prisma.service.findUnique({
      where: { id },
    });

    if (!existingBook) {
      return res.status(404).json({ message: "Buku tidak ditemukan" });
    }
    await prisma.booking.deleteMany({
      where: { serviceId: id },
    });
    await prisma.slot.deleteMany({
      where: { serviceId: id },
    });

    await prisma.service.delete({
      where: { id },
    });

    return res.status(200).json({
      message: `Buku "${existingBook.title}" berhasil dihapus`,
    });
  } catch (err: any) {
    console.error("ERROR deleteBook:", err);
    return res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
};
