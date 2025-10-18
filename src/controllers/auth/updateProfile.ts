import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { supabase } from "../../utils/supabase";

const prisma = new PrismaClient();

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { name, phone } = req.body;
    const file = (req as any).file;

    if (!user) {
      return res
        .status(401)
        .json({ message: "Unauthorized: user tidak ditemukan" });
    }

    let avatarUrl: string | null = null;

    if (file) {
      const fileName = `avatars/${Date.now()}-${file.originalname}`;

      const { error: uploadError } = await supabase.storage
        .from(process.env.SUPABASE_BUCKET!)
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
        });

      if (uploadError) {
        console.error("❌ Gagal upload avatar:", uploadError.message);
        return res.status(500).json({
          message: "Gagal mengunggah avatar ke Supabase",
          error: uploadError.message,
        });
      }

      const { data: publicUrl } = supabase.storage
        .from(process.env.SUPABASE_BUCKET!)
        .getPublicUrl(fileName);

      avatarUrl = publicUrl.publicUrl;
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(name && { name }),
        ...(phone && { phone }),
        ...(avatarUrl && { avatarImage: avatarUrl }),
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatarImage: true,
        updatedAt: true,
      },
    });

    return res.status(200).json({
      message: "✅ Profil berhasil diperbarui",
      data: updatedUser,
    });
  } catch (err: any) {
    console.error("❌ ERROR updateProfile:", err);
    return res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
};
