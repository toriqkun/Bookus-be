import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { getUsers } from "../controllers/auth/getUsers";
import { login, logout } from "../controllers/auth/login";
import { register, verifyEmail } from "../controllers/auth/register";

import { cleanupUnverifiedUsers } from "../utils/cleanupUnverifiedUsers";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";

import { upload } from "../middleware/multer";
import { updateProfile } from "../controllers/auth/updateProfile";

const prisma = new PrismaClient();
const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/verify", verifyEmail);
router.get("/me", authenticate, async (req, res) => {
  try {
    const { id } = (req as any).user;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/users", authenticate, authorize("ADMIN"), getUsers);
router.post("/cleanup", async (req, res) => {
  try {
    const result = await cleanupUnverifiedUsers();
    res.json({ message: "Cleanup complete", ...result });
  } catch (err) {
    res.status(500).json({ message: "Cleanup error" });
  }
});

router.get("/me", authenticate, (req, res) => {
  const user = (req as any).user;
  res.json({ user });
});

router.patch("/profile", authenticate, upload.single("avatar"), updateProfile);

export default router;
