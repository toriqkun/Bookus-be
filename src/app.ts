import dotenv from "dotenv";
dotenv.config();

import express from "express";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";
import cookieParser from "cookie-parser";
import cors from "cors";
import cron from "node-cron";
import { cleanupUnverifiedUsers } from "./utils/cleanupUnverifiedUsers";

import booksRouter from "./routes/service";
import usersRouter from "./routes/auth";
import bookingsRouter from "./routes/booking";

// dotenv.config();
const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
};

app.use(cors(corsOptions));

const swaggerPath = path.resolve(process.cwd(), "swagger.yaml");
const swaggerDocument = YAML.load(swaggerPath);
app.use(express.urlencoded({ extended: true }));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/api/v1/health", (req, res) => {
  console.log("🔥 Backend menerima permintaan /api/v1/health dari Frontend!");
  res.status(200).json({
    message: "Koneksi BE dan FE berhasil!",
    service: "Bookus Backend API",
    status: "Running",
  });
});

app.use("/api/v1/books", booksRouter);
app.use("/api/v1/auth", usersRouter);
app.use("/api/v1/bookings", bookingsRouter);

cron.schedule("0 0 * * *", async () => {
  console.log("⏳ Running daily cleanup job...");
  await cleanupUnverifiedUsers();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
  console.log(`📖 Swagger Docs at http://localhost:${PORT}/api-docs`);
});
