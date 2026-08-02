import { z } from "zod";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID");

/**
 * `userId` is accepted on every analytics endpoint but only admin-tier
 * roles are permitted to use it for someone other than themselves — that
 * check happens in the controller (resolveTargetUserId), not here.
 */
export const productivityRangeQuerySchema = z.object({
  body: z.object({}).optional(),
  query: z.object({
    userId: objectId.optional(),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
  }),
  params: z.object({}).optional(),
});

export const productivityUserQuerySchema = z.object({
  body: z.object({}).optional(),
  query: z.object({
    userId: objectId.optional(),
  }),
  params: z.object({}).optional(),
});

export const productivityDailyQuerySchema = z.object({
  body: z.object({}).optional(),
  query: z.object({
    userId: objectId.optional(),
    date: z.coerce.date().optional(),
  }),
  params: z.object({}).optional(),
});

export const productivityWeeklyQuerySchema = z.object({
  body: z.object({}).optional(),
  query: z.object({
    userId: objectId.optional(),
    weekStart: z.coerce.date().optional(),
  }),
  params: z.object({}).optional(),
});

const periodEnum = z.enum(["week", "month", "quarter"]);

export const productivityOrgQuerySchema = z.object({
  body: z.object({}).optional(),
  query: z.object({
    period: periodEnum.optional(),
    department: z.string().optional(),
  }),
  params: z.object({}).optional(),
});

export const productivityLeaderboardQuerySchema = z.object({
  body: z.object({}).optional(),
  query: z.object({
    period: periodEnum.optional(),
    department: z.string().optional(),
    page: z.coerce.number().min(1).optional().default(1),
    limit: z.coerce.number().min(1).max(100).optional().default(20),
    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  }),
  params: z.object({}).optional(),
});

export const productivitySummaryQuerySchema = z.object({
  body: z.object({}).optional(),
  query: z.object({
    period: periodEnum.optional(),
    month: z.coerce.number().min(1).max(12).optional(),
    year: z.coerce.number().min(2000).max(2100).optional(),
  }),
  params: z.object({}).optional(),
});

export const productivityUserSummaryQuerySchema = z.object({
  body: z.object({}).optional(),
  query: z.object({
    period: periodEnum.optional(),
    month: z.coerce.number().min(1).max(12).optional(),
    year: z.coerce.number().min(2000).max(2100).optional(),
  }),
  params: z.object({ userId: objectId }),
});

export const productivityTrendQuerySchema = z.object({
  body: z.object({}).optional(),
  query: z.object({
    period: z.enum(["weekly", "monthly"]).optional(),
    range: z.coerce.number().min(1).max(52).optional(),
  }),
  params: z.object({}).optional(),
});

export const productivityUserTrendQuerySchema = z.object({
  body: z.object({}).optional(),
  query: z.object({
    period: z.enum(["weekly", "monthly"]).optional(),
    range: z.coerce.number().min(1).max(52).optional(),
  }),
  params: z.object({ userId: objectId }),
});

export const productivityMonthlyQuerySchema = z.object({
  body: z.object({}).optional(),
  query: z.object({
    userId: objectId.optional(),
    month: z.coerce.number().min(1).max(12).optional(),
    year: z.coerce.number().min(2000).max(2100).optional(),
  }),
  params: z.object({}).optional(),
});