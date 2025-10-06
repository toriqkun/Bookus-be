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

    const { error } = createBookSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json({
        message: "Validasi gagal",
        details: error.details.map((d) => d.message),
      });
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
      totalPages,
      genre,
    } = req.body;

    // 📌 Parse genre (bisa string JSON atau array)
    let genreValue: string | null = null;
    if (genre) {
      if (Array.isArray(genre)) {
        if (genre.length > 3)
          return res.status(400).json({ message: "Genre maksimal 3 item" });
        genreValue = genre.join(", ");
      } else if (typeof genre === "string") {
        try {
          const parsed = JSON.parse(genre);
          if (Array.isArray(parsed)) {
            if (parsed.length > 3)
              return res.status(400).json({ message: "Genre maksimal 3 item" });
            genreValue = parsed.join(", ");
          } else {
            genreValue = genre;
          }
        } catch {
          genreValue = genre;
        }
      }
    }

    const coverImage = req.file ? `/uploads/book/${req.file.filename}` : null;

    const newBook = await prisma.service.create({
      data: {
        providerId: user.id,
        title,
        author,
        isbn: isbn || null,
        description: description || null,
        durationDays: durationDays ? Number(durationDays) : null,
        price: price ? Number(price) : null,
        copies: copies ? Number(copies) : 1,
        totalPages: totalPages ? Number(totalPages) : null,
        genre: genreValue,
        isActive: isActive === "false" ? false : true,
        coverImage,
      },
    });

    return res.status(201).json({
      message: "✅ Buku berhasil ditambahkan",
      book: newBook,
    });
  } catch (err: any) {
    console.error("❌ ERROR createBook:", err);

    if (err.code === "P2002" && err.meta?.target?.includes("isbn")) {
      return res.status(400).json({
        message: "ISBN sudah terdaftar. Gunakan ISBN lain untuk buku ini.",
      });
    }

    return res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
};
