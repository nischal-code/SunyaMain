import { Router } from "express";
import * as projectController from "../controllers/project.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { uploadProjectFiles } from "../middleware/upload.middleware.js";
import {
  createProjectSchema,
  updateProjectSchema,
  assignTeamSchema,
  assignProjectManagerSchema,
  setBudgetSchema,
  setDeadlineSchema,
  changeProjectStatusSchema,
  updateProjectProgressSchema,
  projectIdParamSchema,
  projectQuerySchema,
  createMilestoneSchema,
  updateMilestoneSchema,
  milestoneIdParamSchema,
  updateMilestoneProgressSchema,
} from "../validators/project.validator.js";
import { ROLES } from "../utils/constants.js";

const router = Router();
const ADMIN_ONLY = [ROLES.SUPER_ADMIN, ROLES.ADMIN];
// Managers can be assigned as a project's PM; broader management authorization
// (e.g. "is this the assigned PM?") is enforced in the service layer.
const ADMIN_AND_MANAGER = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER];

router.use(verifyJWT);

// ------------------ Shared (scoped per-role inside the controller/service) ------------------
router.get("/", validate(projectQuerySchema), projectController.listProjects);
router.get("/:projectId", validate(projectIdParamSchema), projectController.getProjectById);
router.post(
  "/:projectId/deliverables",
  validate(projectIdParamSchema),
  uploadProjectFiles.array("deliverables", 10),
  projectController.addDeliverables
);

// ------------------ Admin: Project CRUD ------------------
router.post("/", authorizeRoles(...ADMIN_ONLY), validate(createProjectSchema), projectController.createProject);
router.delete(
  "/:projectId",
  authorizeRoles(...ADMIN_ONLY),
  validate(projectIdParamSchema),
  projectController.deleteProject
);
router.patch(
  "/:projectId/manager",
  authorizeRoles(...ADMIN_ONLY),
  validate(assignProjectManagerSchema),
  projectController.assignProjectManager
);

// ------------------ Admin / Project Manager management ------------------
router.patch(
  "/:projectId",
  authorizeRoles(...ADMIN_AND_MANAGER),
  validate(updateProjectSchema),
  projectController.updateProject
);
router.patch(
  "/:projectId/team",
  authorizeRoles(...ADMIN_AND_MANAGER),
  validate(assignTeamSchema),
  projectController.assignTeam
);
router.patch(
  "/:projectId/budget",
  authorizeRoles(...ADMIN_AND_MANAGER),
  validate(setBudgetSchema),
  projectController.setBudget
);
router.patch(
  "/:projectId/deadline",
  authorizeRoles(...ADMIN_AND_MANAGER),
  validate(setDeadlineSchema),
  projectController.setDeadline
);
router.patch(
  "/:projectId/status",
  authorizeRoles(...ADMIN_AND_MANAGER),
  validate(changeProjectStatusSchema),
  projectController.changeStatus
);
router.patch(
  "/:projectId/progress",
  authorizeRoles(...ADMIN_AND_MANAGER),
  validate(updateProjectProgressSchema),
  projectController.updateProgress
);
router.post(
  "/:projectId/files",
  authorizeRoles(...ADMIN_AND_MANAGER),
  validate(projectIdParamSchema),
  uploadProjectFiles.array("files", 10),
  projectController.addFiles
);

// ------------------ Milestones (Admin / Project Manager) ------------------
router.post(
  "/:projectId/milestones",
  authorizeRoles(...ADMIN_AND_MANAGER),
  validate(createMilestoneSchema),
  projectController.addMilestone
);
router.patch(
  "/:projectId/milestones/:milestoneId",
  authorizeRoles(...ADMIN_AND_MANAGER),
  validate(updateMilestoneSchema),
  projectController.updateMilestone
);
router.delete(
  "/:projectId/milestones/:milestoneId",
  authorizeRoles(...ADMIN_AND_MANAGER),
  validate(milestoneIdParamSchema),
  projectController.deleteMilestone
);
router.patch(
  "/:projectId/milestones/:milestoneId/progress",
  authorizeRoles(...ADMIN_AND_MANAGER),
  validate(updateMilestoneProgressSchema),
  projectController.updateMilestoneProgress
);
router.patch(
  "/:projectId/milestones/:milestoneId/complete",
  authorizeRoles(...ADMIN_AND_MANAGER),
  validate(milestoneIdParamSchema),
  projectController.completeMilestone
);

export default router;
