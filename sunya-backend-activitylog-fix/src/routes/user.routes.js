import { Router } from "express";
import * as userController from "../controllers/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { uploadProfilePicture } from "../middleware/upload.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { updateProfileSchema, updateUserRoleSchema } from "../validators/user.validator.js";
import { ROLES } from "../utils/constants.js";

const router = Router();

router.use(verifyJWT);

// Self-service profile routes
router.get("/me", userController.getProfile);
router.patch("/me", validate(updateProfileSchema), userController.updateProfile);
router.patch("/me/profile-picture", uploadProfilePicture.single("profilePicture"), userController.updateProfilePicture);

// Admin/Manager user management routes
router.get("/", authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER), userController.listUsers);
router.get("/:userId", authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER), userController.getUserById);
router.patch(
  "/:userId/role",
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  validate(updateUserRoleSchema),
  userController.updateUserRole
);
router.patch(
  "/:userId/toggle-active",
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  userController.toggleUserActiveStatus
);

export default router;
