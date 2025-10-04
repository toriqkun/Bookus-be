import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { createBookSchema } from "../../validations/serviceSchema";

const prisma = new PrismaClient();

export const createBook = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user || user.role !== "ADMIN") {
      return res
        .status(403)
        .json({ message: "Hanya admin yang bisa menambahkan buku" });
    }

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

    if (!title || !author || !price) {
      return res
        .status(400)
        .json({ message: "Field title, author, dan price wajib diisi" });
    }

    const coverImage = req.file ? `/uploads/book/${req.file.filename}` : null;

    const bookData = {
      title,
      author,
      isbn: isbn || null,
      description: description || null,
      durationDays: durationDays ? Number(durationDays) : null,
      price: price ? Number(price) : null,
      copies: copies ? Number(copies) : 1,
      isActive: isActive === "false" ? false : true,
      coverImage,
      providerId: user.id,
    };

    const newBook = await prisma.service.create({
      data: bookData,
    });

    return res.status(201).json({
      message: "Buku berhasil ditambahkan",
      book: newBook,
    });
  } catch (err: any) {
    console.error("❌ ERROR createBook:", err);
    return res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
};
