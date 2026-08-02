import { Notification } from "../models/Notification.model.js";
import { User } from "../models/User.model.js";
import { ApiError } from "../utils/ApiError.js";
import { getIO } from "../socket/index.js";
import { logger } from "../utils/logger.js";

export const createNotification = async ({ recipient, type, title, message, task = null, project = null }) => {
  const notification = await Notification.create({ recipient, type, title, message, task, project });

  try {
    getIO().to(`user:${recipient}`).emit("notification:new", notification);
  } catch (error) {
    // Socket.io may not be initialized (e.g. scripts/tests) — notification
    // is still persisted, it just won't push in realtime.
    logger.warn(`Skipped realtime notification emit: ${error.message}`);
  }

  return notification;
};

/**
 * Fans a single notification payload out to multiple recipients,
 * de-duplicating in case a user appears more than once (e.g. reassign lists).
 */
export const notifyMany = async (recipients, payload) => {
  const uniqueRecipients = [...new Set(recipients.filter(Boolean).map(String))];
  return Promise.all(uniqueRecipients.map((recipient) => createNotification({ ...payload, recipient })));
};

export const getUserNotifications = async (userId, { page = 1, limit = 20, isRead } = {}) => {
  const filter = { recipient: userId };
  if (isRead !== undefined) filter.isRead = isRead === "true" || isRead === true;

  const skip = (page - 1) * limit;

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("task", "title status")
      .lean(),
    Notification.countDocuments(filter),
    Notification.countDocuments({ recipient: userId, isRead: false }),
  ]);

  return {
    notifications,
    unreadCount,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const markAsRead = async (userId, notificationId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, recipient: userId },
    { isRead: true },
    { new: true }
  );

  if (!notification) throw new ApiError(404, "Notification not found");
  return notification;
};

export const markAllAsRead = async (userId) => {
  await Notification.updateMany({ recipient: userId, isRead: false }, { isRead: true });
};

export const getUnreadCount = async (userId) => {
  const unreadCount = await Notification.countDocuments({ recipient: userId, isRead: false });
  return { unreadCount };
};

export const getNotificationById = async (userId, notificationId) => {
  const notification = await Notification.findOne({ _id: notificationId, recipient: userId })
    .populate("task", "title status")
    .lean();

  if (!notification) throw new ApiError(404, "Notification not found");
  return notification;
};

export const markAsUnread = async (userId, notificationId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, recipient: userId },
    { isRead: false },
    { new: true }
  );

  if (!notification) throw new ApiError(404, "Notification not found");
  return notification;
};

export const deleteNotification = async (userId, notificationId) => {
  const notification = await Notification.findOneAndDelete({ _id: notificationId, recipient: userId });
  if (!notification) throw new ApiError(404, "Notification not found");
};

export const clearReadNotifications = async (userId) => {
  const result = await Notification.deleteMany({ recipient: userId, isRead: true });
  return { deletedCount: result.deletedCount };
};

const DEFAULT_NOTIFICATION_SETTINGS = {
  channels: { email: true, push: true, inApp: true },
  types: {
    taskAssigned: true,
    taskDue: true,
    taskCompleted: true,
    projectUpdates: true,
    attendance: true,
    announcements: true,
  },
};

export const getNotificationSettings = async (userId) => {
  const user = await User.findById(userId).select("notificationSettings").lean();
  if (!user) throw new ApiError(404, "User not found");

  return user.notificationSettings || DEFAULT_NOTIFICATION_SETTINGS;
};

export const updateNotificationSettings = async (userId, { channels, types } = {}) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  const current = user.notificationSettings?.toObject
    ? user.notificationSettings.toObject()
    : user.notificationSettings || DEFAULT_NOTIFICATION_SETTINGS;

  user.notificationSettings = {
    channels: { ...DEFAULT_NOTIFICATION_SETTINGS.channels, ...current.channels, ...channels },
    types: { ...DEFAULT_NOTIFICATION_SETTINGS.types, ...current.types, ...types },
  };

  await user.save();
  return user.notificationSettings;
};