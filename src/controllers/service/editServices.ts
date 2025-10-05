import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const updateBook = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    if (!user || user.role !== "ADMIN") {
      return res
        .status(403)
        .json({ message: "Hanya admin yang bisa mengedit buku" });
    }

    const { id } = req.params;
    const {
      title,
      author,
      isbn,
      description,
      durationDays,
      price,
      copies,
      isActive,
    } = req.body;

    const existingBook = await prisma.service.findUnique({
      where: { id },
    });

    if (!existingBook) {
      return res.status(404).json({ message: "Buku tidak ditemukan" });
    }

    const coverImage = req.file
      ? `/uploads/book/${req.file.filename}`
      : existingBook.coverImage;

    const updatedBook = await prisma.service.update({
      where: { id },
      data: {
        title: title ?? existingBook.title,
        author: author ?? existingBook.author,
        isbn: isbn ?? existingBook.isbn,
        description: description ?? existingBook.description,
        durationDays: durationDays
          ? Number(durationDays)
          : existingBook.durationDays,
        price: price ? Number(price) : existingBook.price,
        copies: copies ? Number(copies) : existingBook.copies,
        isActive:
          typeof isActive !== "undefined"
            ? isActive === "false"
              ? false
              : true
            : existingBook.isActive,
        coverImage,
      },
    });

    return res.status(200).json({
      message: "Buku berhasil diperbarui",
      book: updatedBook,
    });
  } catch (err: any) {
    console.error("ERROR updateBook:", err);
    return res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
};
