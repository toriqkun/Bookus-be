import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { createBookSchema } from "../../validations/serviceSchema";

const prisma = new PrismaClient();

// Admin menambahkan buku
export const createBook = async (req: Request, res: Response) => {
  try {
    const { error, value } = createBookSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json({
        message: "Validasi gagal",
        errors: error.details.map((d) => d.message),
      });
    }

    const user = (req as any).user;
    if (!user || user.role !== "ADMIN") {
      return res
        .status(403)
        .json({ message: "Hanya admin yang bisa menambahkan buku" });
    }

    const newBook = await prisma.service.create({
      data: value,
    });

    res.status(201).json({
      message: "Buku berhasil ditambahkan",
      book: newBook,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};
