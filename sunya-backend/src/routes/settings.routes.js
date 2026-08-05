import { Router } from "express";
import * as settingsController from "../controllers/settings.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { updateSettingsSchema } from "../validators/attendance.validator.js";
import { ROLES } from "../utils/constants.js";

const router = Router();

router.use(verifyJWT);

router.get("/", authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER), settingsController.getSettings);
router.patch(
  "/",
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  validate(updateSettingsSchema),
  settingsController.updateSettings
);

export default router;
