import { Router } from "express";
import * as notificationController from "../controllers/notification.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  notificationQuerySchema,
  notificationIdParamSchema,
  updateNotificationSettingsSchema,
} from "../validators/notification.validator.js";

const router = Router();

router.use(verifyJWT);

// NOTE: static routes (unread-count, read-all, clear-read, settings) must
// come before the "/:notificationId" routes so they aren't swallowed as an id.
router.get("/", validate(notificationQuerySchema), notificationController.listNotifications);
router.get("/unread-count", notificationController.getUnreadCount);
router.get("/settings", notificationController.getNotificationSettings);
router.patch("/settings", validate(updateNotificationSettingsSchema), notificationController.updateNotificationSettings);
router.patch("/read-all", notificationController.markAllAsRead);
router.delete("/clear-read", notificationController.clearReadNotifications);

router.get("/:notificationId", validate(notificationIdParamSchema), notificationController.getNotificationById);
router.patch("/:notificationId/read", validate(notificationIdParamSchema), notificationController.markAsRead);
router.patch("/:notificationId/unread", validate(notificationIdParamSchema), notificationController.markAsUnread);
router.delete("/:notificationId", validate(notificationIdParamSchema), notificationController.deleteNotification);

export default router;
