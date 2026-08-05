import { z } from "zod";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID");

export const notificationQuerySchema = z.object({
  body: z.object({}).optional(),
  query: z.object({
    page: z.coerce.number().min(1).optional().default(1),
    limit: z.coerce.number().min(1).max(100).optional().default(20),
    isRead: z.enum(["true", "false"]).optional(),
  }),
  params: z.object({}).optional(),
});

export const notificationIdParamSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({ notificationId: objectId }),
});

export const updateNotificationSettingsSchema = z.object({
  body: z.object({
    channels: z
      .object({
        email: z.boolean().optional(),
        push: z.boolean().optional(),
        inApp: z.boolean().optional(),
      })
      .optional(),
    types: z
      .object({
        taskAssigned: z.boolean().optional(),
        taskDue: z.boolean().optional(),
        taskCompleted: z.boolean().optional(),
        projectUpdates: z.boolean().optional(),
        attendance: z.boolean().optional(),
        announcements: z.boolean().optional(),
      })
      .optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});