import { Router } from "express";
import * as activityLogController from "../controllers/activityLog.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { activityLogQuerySchema, activityLogIdParamSchema } from "../validators/activityLog.validator.js";
import { ROLES } from "../utils/constants.js";

const router = Router();

router.use(verifyJWT);
router.use(authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN));

router.get("/", validate(activityLogQuerySchema), activityLogController.listActivityLogs);
router.get("/:logId", validate(activityLogIdParamSchema), activityLogController.getActivityLogById);

export default router;
