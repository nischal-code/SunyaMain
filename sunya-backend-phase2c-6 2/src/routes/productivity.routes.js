import { Router } from "express";
import * as productivityController from "../controllers/productivity.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { ROLES } from "../utils/constants.js";
import {
  productivityRangeQuerySchema,
  productivityUserQuerySchema,
  productivityDailyQuerySchema,
  productivityWeeklyQuerySchema,
  productivityMonthlyQuerySchema,
  productivityOrgQuerySchema,
  productivityLeaderboardQuerySchema,
  productivitySummaryQuerySchema,
  productivityUserSummaryQuerySchema,
  productivityTrendQuerySchema,
  productivityUserTrendQuerySchema,
} from "../validators/productivity.validator.js";

const router = Router();
const ADMIN_TIER = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER];

// Every analytics endpoint requires authentication. Employees are scoped
// to their own data by default; admin-tier roles may pass ?userId= to
// view another employee (enforced in the controller).
router.use(verifyJWT);

router.get("/tasks-completed", validate(productivityRangeQuerySchema), productivityController.getTasksCompleted);
router.get("/tasks-pending", validate(productivityUserQuerySchema), productivityController.getTasksPending);
router.get(
  "/average-completion-time",
  validate(productivityRangeQuerySchema),
  productivityController.getAverageCompletionTime
);
router.get(
  "/project-participation",
  validate(productivityUserQuerySchema),
  productivityController.getProjectParticipation
);
router.get("/attendance-rate", validate(productivityRangeQuerySchema), productivityController.getAttendanceRate);
router.get("/daily", validate(productivityDailyQuerySchema), productivityController.getDailyProductivity);
router.get("/weekly", validate(productivityWeeklyQuerySchema), productivityController.getWeeklyProductivity);
router.get("/monthly", validate(productivityMonthlyQuerySchema), productivityController.getMonthlyProductivity);

// ------------------ Org-wide (privileged) ------------------
router.get(
  "/",
  authorizeRoles(...ADMIN_TIER),
  validate(productivityOrgQuerySchema),
  productivityController.getOrgProductivity
);
router.get(
  "/leaderboard",
  authorizeRoles(...ADMIN_TIER),
  validate(productivityLeaderboardQuerySchema),
  productivityController.getLeaderboard
);

// ------------------ Employee summary / trend (self-service) ------------------
// NOTE: these must be registered before the /employee/:userId(/trend) routes
// below so "trend" isn't matched as a :userId.
router.get(
  "/employee/trend",
  validate(productivityTrendQuerySchema),
  productivityController.getMyProductivityTrend
);
router.get("/employee", validate(productivitySummaryQuerySchema), productivityController.getMyProductivity);

// ------------------ Admin/Manager: single employee lookup ------------------
router.get(
  "/employee/:userId/trend",
  authorizeRoles(...ADMIN_TIER),
  validate(productivityUserTrendQuerySchema),
  productivityController.getUserProductivityTrend
);
router.get(
  "/employee/:userId",
  authorizeRoles(...ADMIN_TIER),
  validate(productivityUserSummaryQuerySchema),
  productivityController.getUserProductivity
);

export default router;
