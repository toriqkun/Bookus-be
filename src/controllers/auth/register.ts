import { Request, Response } from "express";
import Joi from "joi";
import bcrypt from "bcrypt";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const registerSchema = Joi.object({
  name: Joi.string().min(4).max(50).required().messages({ "string.empty": "Fullname is required", "string.min": "Fullname minimum 4-20 characters", "string.max": "Fullname minimum 4-20 characters" }),
  email: Joi.string().email().required().messages({ "string.empty": "Email is required", "string.email": "Please enter a valid email address" }),
  password: Joi.string().min(8).required().messages({ "string.empty": "Password is required", "string.min": "Password minimum 8 characters" }),
  confirmPassword: Joi.any().valid(Joi.ref("password")).required().messages({ "any.only": "Passwords do not match", "any.required": "Confirm password is required" }),
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const register = async (req: Request, res: Response) => {
  try {
    const { error } = registerSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        message: "Validasi gagal",
        errors: error.details.map((d) => d.message),
      });
    }

    const { name, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email sudah digunakan" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "USER",
        isVerified: false,
      },
    });

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60);

    await prisma.verificationToken.create({
      data: {
        token,
        userId: newUser.id,
        expiresAt,
      },
    });

    const verifyUrl = `${process.env.FRONTEND_URL}/verify?token=${token}`;
    await transporter.sendMail({
      from: `"Slotify Auth" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify your email",
      html: `<p>Hello ${name},</p>
             <p>Please verify your account by clicking link below:</p>
             <a href="${verifyUrl}">${verifyUrl}</a>
             <p>This link will expire in 1 hour.</p>`,
    });

    res.status(201).json({
      message: "Registrasi berhasil",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.query;

    const foundToken = await prisma.verificationToken.findUnique({
      where: { token: String(token) },
      include: { user: true },
    });

    if (!foundToken) {
      return res.status(400).json({ message: "Token tidak valid" });
    }

    if (foundToken.expiresAt < new Date()) {
      return res.status(400).json({ message: "Token sudah expired" });
    }

    await prisma.user.update({
      where: { id: foundToken.userId },
      data: { isVerified: true },
    });

    await prisma.verificationToken.delete({ where: { id: foundToken.id } });

    res.json({ message: "Email berhasil diverifikasi, silakan login." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};
