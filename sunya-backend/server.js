import http from "http";
import app from "./src/app.js";
import { env } from "./src/config/env.js";
import { connectDB } from "./src/config/db.js";
import { logger } from "./src/utils/logger.js";
import { initSocket } from "./src/socket/index.js";
import { scheduleAbsentMarkerJob } from "./src/jobs/absentMarker.job.js";

const httpServer = http.createServer(app);

const startServer = async () => {
  await connectDB();

  initSocket(httpServer);
  scheduleAbsentMarkerJob();

  httpServer.listen(env.PORT, () => {
    logger.info(`Sunya API server running on port ${env.PORT} [${env.NODE_ENV}]`);
  });
};

startServer();

// ---------------- Process-level safety nets ----------------
process.on("unhandledRejection", (reason) => {
  logger.error(`Unhandled Rejection: ${reason instanceof Error ? reason.stack : reason}`);
  process.exit(1);
});

process.on("uncaughtException", (error) => {
  logger.error(`Uncaught Exception: ${error.stack}`);
  process.exit(1);
});

process.on("SIGTERM", () => {
  logger.info("SIGTERM received. Shutting down gracefully...");
  httpServer.close(() => process.exit(0));
});
