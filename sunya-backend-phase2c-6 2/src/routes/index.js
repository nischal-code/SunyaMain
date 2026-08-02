import { Router } from "express";
import authRoutes from "./auth.routes.js";
import sessionRoutes from "./session.routes.js";
import userRoutes from "./user.routes.js";
import attendanceRoutes from "./attendance.routes.js";
import settingsRoutes from "./settings.routes.js";
import dashboardRoutes from "./dashboard.routes.js";
import taskRoutes from "./task.routes.js";
import projectRoutes from "./project.routes.js";
import notificationRoutes from "./notification.routes.js";
import activityLogRoutes from "./activityLog.routes.js";
import productivityRoutes from "./productivity.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/sessions", sessionRoutes);
router.use("/users", userRoutes);
router.use("/attendance", attendanceRoutes);
router.use("/settings", settingsRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/tasks", taskRoutes);
router.use("/projects", projectRoutes);
router.use("/notifications", notificationRoutes);
router.use("/activity-logs", activityLogRoutes);
router.use("/productivity", productivityRoutes);

router.get("/health", (_req, res) => {
  res.status(200).json({ success: true, message: "Sunya API is healthy", data: null });
});

export default router;
