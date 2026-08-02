import { z } from "zod";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID");

export const activityLogQuerySchema = z.object({
  body: z.object({}).optional(),
  query: z.object({
    page: z.coerce.number().min(1).optional().default(1),
    limit: z.coerce.number().min(1).max(100).optional().default(20),
    user: objectId.optional(),
    module: z.string().trim().min(1).optional(),
    action: z.string().trim().min(1).optional(),
    resourceId: z.string().trim().min(1).optional(),
    search: z.string().trim().min(1).max(200).optional(),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
    sortBy: z.enum(["timestamp", "module", "action", "user"]).optional().default("timestamp"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  }),
  params: z.object({}).optional(),
});

export const activityLogIdParamSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({ logId: objectId }),
});
