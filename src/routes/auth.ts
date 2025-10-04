import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { getUsers } from "../controllers/auth/getUsers";
import { login, logout } from "../controllers/auth/login";
import { register } from "../controllers/auth/register";

import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";

const prisma = new PrismaClient();
const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/users", authenticate, authorize("ADMIN"), getUsers);

router.get("/me", authenticate, (req, res) => {
  const user = (req as any).user;
  res.json({ user });
});

export default router;
