import { z } from "zod";
import { TASK_STATUS, TASK_PRIORITY } from "../utils/constants.js";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID");

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1, "Title is required").max(200),
    description: z.string().trim().max(5000).optional().default(""),
    project: z.string().trim().max(150).optional(),
    assignedTo: z.array(objectId).min(1, "Assign at least one employee"),
    priority: z.enum(Object.values(TASK_PRIORITY)).optional(),
    dueDate: z.coerce.date().optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const updateTaskSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1).max(200).optional(),
    description: z.string().trim().max(5000).optional(),
    project: z.string().trim().max(150).nullable().optional(),
    priority: z.enum(Object.values(TASK_PRIORITY)).optional(),
    dueDate: z.coerce.date().nullable().optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({ taskId: objectId }),
});

export const reassignTaskSchema = z.object({
  body: z.object({
    assignedTo: z.array(objectId).min(1, "Assign at least one employee"),
  }),
  query: z.object({}).optional(),
  params: z.object({ taskId: objectId }),
});

export const changeStatusSchema = z.object({
  body: z.object({
    status: z.enum(Object.values(TASK_STATUS)),
  }),
  query: z.object({}).optional(),
  params: z.object({ taskId: objectId }),
});

export const updateProgressSchema = z.object({
  body: z.object({
    progress: z.coerce.number().min(0).max(100),
  }),
  query: z.object({}).optional(),
  params: z.object({ taskId: objectId }),
});

export const addCommentSchema = z.object({
  body: z.object({
    text: z.string().trim().min(1, "Comment cannot be empty").max(1000),
  }),
  query: z.object({}).optional(),
  params: z.object({ taskId: objectId }),
});

export const taskIdParamSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({ taskId: objectId }),
});

export const taskQuerySchema = z.object({
  body: z.object({}).optional(),
  query: z.object({
    status: z.enum(Object.values(TASK_STATUS)).optional(),
    priority: z.enum(Object.values(TASK_PRIORITY)).optional(),
    project: z.string().optional(),
    assignedTo: objectId.optional(),
    assignedBy: objectId.optional(),
    search: z.string().optional(),
    dueBefore: z.string().optional(),
    dueAfter: z.string().optional(),
    page: z.coerce.number().min(1).optional().default(1),
    limit: z.coerce.number().min(1).max(100).optional().default(20),
    sortBy: z.enum(["createdAt", "dueDate", "priority", "status", "title"]).optional().default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  }),
  params: z.object({}).optional(),
});
