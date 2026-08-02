import axiosClient from "./axiosClient";

/**
 * Notification API
 * Maps to /api/v1/notifications/* (notification.routes.js). Every route
 * requires an authenticated request and is always scoped server-side to
 * the requester's own notifications — there is no cross-user access here,
 * regardless of role.
 *
 * type (server-defined, non-exhaustive): "task_assigned" | "task_due" |
 *   "task_completed" | "project_update" | "attendance" | "announcement" |
 *   "system"
 */

/* ------------------------------------------------------------------ */
/* Listing / detail                                                    */
/* ------------------------------------------------------------------ */

// GET /notifications
// params: { isRead, type, page, limit, sortOrder }
export const listNotifications = (params = {}) =>
  axiosClient.get("/notifications", { params });

// GET /notifications/unread-count
// Response shape: { unreadCount: number }
export const getUnreadCount = () => axiosClient.get("/notifications/unread-count");

// GET /notifications/:notificationId
export const getNotificationById = (notificationId) =>
  axiosClient.get(`/notifications/${notificationId}`);

/* ------------------------------------------------------------------ */
/* Read state                                                          */
/* ------------------------------------------------------------------ */

// PATCH /notifications/:notificationId/read
export const markNotificationRead = (notificationId) =>
  axiosClient.patch(`/notifications/${notificationId}/read`);

// PATCH /notifications/:notificationId/unread
export const markNotificationUnread = (notificationId) =>
  axiosClient.patch(`/notifications/${notificationId}/unread`);

// PATCH /notifications/read-all
export const markAllNotificationsRead = () =>
  axiosClient.patch("/notifications/read-all");

/* ------------------------------------------------------------------ */
/* Deletion                                                             */
/* ------------------------------------------------------------------ */

// DELETE /notifications/:notificationId
export const deleteNotification = (notificationId) =>
  axiosClient.delete(`/notifications/${notificationId}`);

// DELETE /notifications/clear-read
// Removes every already-read notification for the requester.
export const clearReadNotifications = () =>
  axiosClient.delete("/notifications/clear-read");

/* ------------------------------------------------------------------ */
/* Preferences                                                         */
/* ------------------------------------------------------------------ */

// GET /notifications/settings
// Response shape: { channels: { email, push, inApp }, types: { taskAssigned,
// taskDue, taskCompleted, projectUpdates, attendance, announcements } }
export const getNotificationSettings = () => axiosClient.get("/notifications/settings");

// PATCH /notifications/settings
// body: partial { channels?, types? } — merged server-side with existing settings.
export const updateNotificationSettings = (payload = {}) =>
  axiosClient.patch("/notifications/settings", payload);

export default {
  listNotifications,
  getUnreadCount,
  getNotificationById,
  markNotificationRead,
  markNotificationUnread,
  markAllNotificationsRead,
  deleteNotification,
  clearReadNotifications,
  getNotificationSettings,
  updateNotificationSettings,
};
