import { asyncHandler } from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/ApiResponse.js";
import * as notificationService from "../services/notification.service.js";

export const listNotifications = asyncHandler(async (req, res) => {
  const result = await notificationService.getUserNotifications(req.user._id, req.query);
  return sendResponse(res, 200, "Notifications fetched successfully", result);
});

export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markAsRead(req.user._id, req.params.notificationId);
  return sendResponse(res, 200, "Notification marked as read", { notification });
});

export const markAllAsRead = asyncHandler(async (req, res) => {
  await notificationService.markAllAsRead(req.user._id);
  return sendResponse(res, 200, "All notifications marked as read", null);
});

export const getUnreadCount = asyncHandler(async (req, res) => {
  const result = await notificationService.getUnreadCount(req.user._id);
  return sendResponse(res, 200, "Unread notification count fetched", result);
});

export const getNotificationById = asyncHandler(async (req, res) => {
  const notification = await notificationService.getNotificationById(req.user._id, req.params.notificationId);
  return sendResponse(res, 200, "Notification fetched successfully", { notification });
});

export const markAsUnread = asyncHandler(async (req, res) => {
  const notification = await notificationService.markAsUnread(req.user._id, req.params.notificationId);
  return sendResponse(res, 200, "Notification marked as unread", { notification });
});

export const deleteNotification = asyncHandler(async (req, res) => {
  await notificationService.deleteNotification(req.user._id, req.params.notificationId);
  return sendResponse(res, 200, "Notification deleted successfully", null);
});

export const clearReadNotifications = asyncHandler(async (req, res) => {
  const result = await notificationService.clearReadNotifications(req.user._id);
  return sendResponse(res, 200, "Read notifications cleared", result);
});

export const getNotificationSettings = asyncHandler(async (req, res) => {
  const settings = await notificationService.getNotificationSettings(req.user._id);
  return sendResponse(res, 200, "Notification settings fetched", settings);
});

export const updateNotificationSettings = asyncHandler(async (req, res) => {
  const settings = await notificationService.updateNotificationSettings(req.user._id, req.body);
  return sendResponse(res, 200, "Notification settings updated", settings);
});