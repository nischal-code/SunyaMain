import { z } from "zod";

/**
 * Shared pagination/sort query shape for the Employee Dashboard's
 * task-based cards (Today's Tasks, Upcoming Deadlines).
 * sortBy: "deadline" sorts by nearest dueDate first (asc), "newest" sorts by
 * most recently created first (createdAt desc). sortOrder lets the caller
 * flip either one if needed.
 */
export const dashboardTaskQuerySchema = z.object({
  body: z.object({}).optional(),
  query: z.object({
    page: z.coerce.number().min(1).optional().default(1),
    limit: z.coerce.number().min(1).max(100).optional().default(10),
    sortBy: z.enum(["deadline", "newest"]).optional().default("deadline"),
    sortOrder: z.enum(["asc", "desc"]).optional(),
    search: z.string().optional(),
  }),
  params: z.object({}).optional(),
});

/**
 * Shared pagination/sort query shape for the Employee Dashboard's
 * project-based cards (Assigned Projects, Running Projects).
 * sortBy: "deadline" sorts by nearest project deadline first (asc),
 * "newest" sorts by most recently created first (createdAt desc).
 */
export const dashboardProjectQuerySchema = z.object({
  body: z.object({}).optional(),
  query: z.object({
    page: z.coerce.number().min(1).optional().default(1),
    limit: z.coerce.number().min(1).max(100).optional().default(10),
    sortBy: z.enum(["deadline", "newest"]).optional().default("newest"),
    sortOrder: z.enum(["asc", "desc"]).optional(),
    search: z.string().optional(),
  }),
  params: z.object({}).optional(),
});

/**
 * Query shape for the Employee Dashboard Summary card (Completed Tasks,
 * Pending Reviews, Attendance Summary). month/year default to the current
 * calendar month when omitted.
 */
export const dashboardSummaryQuerySchema = z.object({
  body: z.object({}).optional(),
  query: z.object({
    month: z.coerce.number().min(1).max(12).optional(),
    year: z.coerce.number().min(2000).max(2100).optional(),
  }),
  params: z.object({}).optional(),
});
