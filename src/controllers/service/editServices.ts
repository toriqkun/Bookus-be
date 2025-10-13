import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { supabase } from "../../utils/supabase";

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
      totalPages,
      genre,
    } = req.body;

    const existingBook = await prisma.service.findUnique({ where: { id } });
    if (!existingBook) {
      return res.status(404).json({ message: "Buku tidak ditemukan" });
    }

    let genreValue: string | null = existingBook.genre;
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

    let coverImage = existingBook.coverImage;
    if (req.file) {
      const fileName = `books/${Date.now()}-${req.file.originalname}`;

      if (
        existingBook.coverImage &&
        existingBook.coverImage.includes("supabase.co")
      ) {
        const oldPath = existingBook.coverImage.split("/bookus-images/")[1];
        await supabase.storage
          .from(process.env.SUPABASE_BUCKET!)
          .remove([oldPath])
          .catch(() =>
            console.warn("⚠️ Gagal hapus cover lama, lanjut upload baru")
          );
      }

      const { error: uploadError } = await supabase.storage
        .from(process.env.SUPABASE_BUCKET!)
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
        });

      if (uploadError) {
        console.error("❌ Gagal upload cover baru:", uploadError.message);
        return res.status(500).json({
          message: "Gagal mengunggah cover baru ke Supabase",
          error: uploadError.message,
        });
      }

      const { data: publicUrl } = supabase.storage
        .from(process.env.SUPABASE_BUCKET!)
        .getPublicUrl(fileName);

      coverImage = publicUrl.publicUrl;
      // console.log("🪣 Cover baru diupload ke:", coverImage);
    }

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
        totalPages: totalPages ? Number(totalPages) : existingBook.totalPages,
        genre: genreValue,
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
      message: "✅ Buku berhasil diperbarui",
      book: updatedBook,
    });
  } catch (err: any) {
    console.error("❌ ERROR updateBook:", err);
    return res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
};
