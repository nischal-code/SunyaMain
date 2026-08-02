import { z } from "zod";
import { ROLES } from "../utils/constants.js";

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    phone: z.string().optional(),
    department: z.string().optional(),
    designation: z.string().optional(),
    joiningDate: z.coerce.date().optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const updateUserRoleSchema = z.object({
  body: z.object({
    role: z.enum(Object.values(ROLES)),
  }),
  query: z.object({}).optional(),
  params: z.object({
    userId: z.string().min(1),
  }),
});
