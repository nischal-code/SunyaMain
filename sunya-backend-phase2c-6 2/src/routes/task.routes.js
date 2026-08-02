import { Router } from "express";
import * as taskController from "../controllers/task.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { uploadTaskFiles } from "../middleware/upload.middleware.js";
import {
  createTaskSchema,
  updateTaskSchema,
  reassignTaskSchema,
  changeStatusSchema,
  updateProgressSchema,
  addCommentSchema,
  taskIdParamSchema,
  taskQuerySchema,
} from "../validators/task.validator.js";
import { ROLES } from "../utils/constants.js";

const router = Router();
const ADMIN_TIER = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER];

router.use(verifyJWT);

// ------------------ Shared (scoped per-role inside the controller) ------------------
router.get("/", validate(taskQuerySchema), taskController.listTasks);
router.get("/:taskId", validate(taskIdParamSchema), taskController.getTaskById);
router.post("/:taskId/comments", validate(addCommentSchema), taskController.addComment);

// ------------------ Employee self-service ------------------
router.patch("/:taskId/start", validate(taskIdParamSchema), taskController.startTask);
router.patch("/:taskId/progress", validate(updateProgressSchema), taskController.updateProgress);
router.patch("/:taskId/complete", validate(taskIdParamSchema), taskController.markComplete);
router.post(
  "/:taskId/deliverables",
  validate(taskIdParamSchema),
  uploadTaskFiles.array("deliverables", 5),
  taskController.addDeliverables
);

// ------------------ Admin/Manager management ------------------
router.post("/", authorizeRoles(...ADMIN_TIER), validate(createTaskSchema), taskController.createTask);
router.patch("/:taskId", authorizeRoles(...ADMIN_TIER), validate(updateTaskSchema), taskController.updateTask);
router.delete("/:taskId", authorizeRoles(...ADMIN_TIER), validate(taskIdParamSchema), taskController.deleteTask);
router.patch(
  "/:taskId/reassign",
  authorizeRoles(...ADMIN_TIER),
  validate(reassignTaskSchema),
  taskController.reassignTask
);
router.patch(
  "/:taskId/status",authorizeRoles(...ADMIN_TIER),validate(changeStatusSchema),taskController.changeStatus
);
router.post(
  "/:taskId/attachments",
  authorizeRoles(...ADMIN_TIER),
  validate(taskIdParamSchema),
  uploadTaskFiles.array("attachments", 5),
  taskController.addAttachments
);

export default router;
