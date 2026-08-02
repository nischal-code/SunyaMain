import { Router } from "express";
import * as attendanceController from "../controllers/attendance.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  clockInSchema,
  attendanceHistoryQuerySchema,
  attendanceSummaryQuerySchema,
  attendanceListQuerySchema,
  createManualAttendanceSchema,
  updateAttendanceSchema,
  attendanceIdParamSchema,
  attendanceReportQuerySchema,
} from "../validators/attendance.validator.js";
import { ROLES } from "../utils/constants.js";

const router = Router();
const ADMIN_TIER = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER];

router.use(verifyJWT);

// Employee self-service
router.post("/clock-in", validate(clockInSchema), attendanceController.clockIn);
router.post("/clock-out", attendanceController.clockOut);
router.get("/me", validate(attendanceHistoryQuerySchema), attendanceController.getMyAttendanceHistory);
router.get("/me/today", attendanceController.getTodayAttendance);
router.get("/me/summary", validate(attendanceSummaryQuerySchema), attendanceController.getMySummary);

// Admin/Manager oversight
router.get("/today/all", authorizeRoles(...ADMIN_TIER), attendanceController.getAllAttendanceToday);
router.get(
  "/user/:userId",
  authorizeRoles(...ADMIN_TIER),
  validate(attendanceHistoryQuerySchema),
  attendanceController.getUserAttendanceHistory
);

// Admin/Manager: org-wide list
router.get("/", authorizeRoles(...ADMIN_TIER), validate(attendanceListQuerySchema), attendanceController.listAttendance);

// Admin/Manager: manual record management
router.post(
  "/manual",
  authorizeRoles(...ADMIN_TIER),
  validate(createManualAttendanceSchema),
  attendanceController.createManualAttendance
);

// Admin/Manager/Admin: reports (must be registered before "/:attendanceId" below)
router.get(
  "/reports",
  authorizeRoles(...ADMIN_TIER),
  validate(attendanceReportQuerySchema),
  attendanceController.getAttendanceReport
);
router.get(
  "/reports/export",
  authorizeRoles(...ADMIN_TIER),
  validate(attendanceReportQuerySchema),
  attendanceController.exportAttendanceReport
);

router.patch(
  "/:attendanceId",
  authorizeRoles(...ADMIN_TIER),
  validate(updateAttendanceSchema),
  attendanceController.updateAttendance
);
router.delete(
  "/:attendanceId",
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  validate(attendanceIdParamSchema),
  attendanceController.deleteAttendance
);

export default router;
