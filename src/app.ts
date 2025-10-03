import express from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const app = express();

app.use(express.json());

const api = express.Router();

api.get("/books", async (req, res) => {
  const books = await prisma.service.findMany({
    include: {
      provider: true,
      slots: true,
    },
  });
  res.json(books);
});

api.get("/users", async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

api.get("/bookings", async (req, res) => {
  const bookings = await prisma.booking.findMany({
    include: { user: true, service: true, slot: true },
  });
  res.json(bookings);
});

app.use("/api/v1", api);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
