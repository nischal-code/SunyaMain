import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import mongoSanitize from "express-mongo-sanitize";

import { env } from "./config/env.js";
import routes from "./routes/index.js";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware.js";
import { globalLimiter } from "./middleware/rateLimiter.middleware.js";
import { logger } from "./utils/logger.js";

const app = express();

// ---------------- Security middleware ----------------
app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);
app.use(mongoSanitize());
// app.use(globalLimiter);

// ---------------- Core middleware ----------------
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

app.use(
  morgan("combined", {
    stream: { write: (message) => logger.info(message.trim()) },
  })
);

// ---------------- Routes ----------------
app.use("/api/v1", routes);

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Sunya Creative Agency Management System API",
    data: { version: "1.0.0" },
  });
});

// ---------------- Error handling ----------------
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
