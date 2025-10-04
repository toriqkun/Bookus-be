import express from "express";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";
import cookieParser from "cookie-parser";

import booksRouter from "./routes/books";
import usersRouter from "./routes/auth";
import bookingsRouter from "./routes/booking";

const app = express();
app.use(express.json());

app.use(cookieParser());

const swaggerPath = path.resolve(process.cwd(), "swagger.yaml");
const swaggerDocument = YAML.load(swaggerPath);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/api/v1/books", booksRouter);
app.use("/api/v1/auth", usersRouter);
app.use("/api/v1/bookings", bookingsRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
  console.log(`📖 Swagger Docs at http://localhost:${PORT}/api-docs`);
});
