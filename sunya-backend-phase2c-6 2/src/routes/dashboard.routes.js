import { Router } from "express";
import * as dashboardController from "../controllers/dashboard.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  dashboardTaskQuerySchema,
  dashboardProjectQuerySchema,
  dashboardSummaryQuerySchema,
} from "../validators/dashboard.validator.js";
import { ROLES } from "../utils/constants.js";

const router = Router();

router.use(verifyJWT);

router.get(
  "/",
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER),
  dashboardController.getDashboardStats
);

// Any authenticated user can view their own employee dashboard.
router.get("/employee", dashboardController.getEmployeeDashboard);

// ------------------ Employee Dashboard cards (own data only, paginated) ------------------
router.get("/employee/today-tasks", validate(dashboardTaskQuerySchema), dashboardController.getTodaysTasks);
router.get(
  "/employee/upcoming-deadlines",
  validate(dashboardTaskQuerySchema),
  dashboardController.getUpcomingDeadlines
);
router.get(
  "/employee/assigned-projects",
  validate(dashboardProjectQuerySchema),
  dashboardController.getAssignedProjects
);
router.get(
  "/employee/running-projects",
  validate(dashboardProjectQuerySchema),
  dashboardController.getRunningProjects
);
router.get(
  "/employee/summary",
  validate(dashboardSummaryQuerySchema),
  dashboardController.getDashboardSummary
);

export default router;
