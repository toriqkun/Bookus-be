import { Request, Response } from "express";
import Joi from "joi";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { generateToken } from "../../utils/jwt";

const prisma = new PrismaClient();

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

export const login = async (req: Request, res: Response) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ message: "Password salah" });

    if (!user.isVerified) {
      return res.status(403).json({ message: "Email belum diverifikasi, silakan cek inbox Anda." });
    }

    const token = generateToken({ id: user.id, role: user.role });

    res.cookie("user_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({
      message: "Login berhasil",
      user: { id: user.id, email: user.email, role: user.role },
      token,
    });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie("user_token");
  res.json({ message: "Logout berhasil" });
};
