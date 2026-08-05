import { z } from "zod";
import { PROJECT_STATUS } from "../utils/constants.js";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID");

const clientSchema = z.object({
  name: z.string().trim().min(1, "Client name is required").max(150),
  company: z.string().trim().max(150).optional(),
  email: z.string().trim().email("Invalid client email").optional().or(z.literal("")),
  phone: z.string().trim().max(30).optional(),
});

export const createProjectSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, "Project name is required").max(200),
    description: z.string().trim().max(5000).optional().default(""),
    client: clientSchema,
    budget: z
      .object({
        amount: z.coerce.number().min(0).optional(),
        currency: z.string().trim().max(10).optional(),
      })
      .optional(),
    deadline: z.coerce.date().optional(),
    startDate: z.coerce.date().optional(),
    projectManager: objectId.optional(),
    team: z.array(objectId).optional().default([]),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const updateProjectSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1).max(200).optional(),
    description: z.string().trim().max(5000).optional(),
    client: clientSchema.optional(),
    startDate: z.coerce.date().nullable().optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({ projectId: objectId }),
});

export const assignTeamSchema = z.object({
  body: z.object({
    team: z.array(objectId).default([]),
  }),
  query: z.object({}).optional(),
  params: z.object({ projectId: objectId }),
});

export const assignProjectManagerSchema = z.object({
  body: z.object({
    projectManager: objectId.nullable(),
  }),
  query: z.object({}).optional(),
  params: z.object({ projectId: objectId }),
});

export const setBudgetSchema = z.object({
  body: z.object({
    amount: z.coerce.number().min(0).optional(),
    currency: z.string().trim().max(10).optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({ projectId: objectId }),
});

export const setDeadlineSchema = z.object({
  body: z.object({
    deadline: z.coerce.date(),
  }),
  query: z.object({}).optional(),
  params: z.object({ projectId: objectId }),
});

export const changeProjectStatusSchema = z.object({
  body: z.object({
    status: z.enum(Object.values(PROJECT_STATUS)),
  }),
  query: z.object({}).optional(),
  params: z.object({ projectId: objectId }),
});

export const updateProjectProgressSchema = z.object({
  body: z.object({
    progress: z.coerce.number().min(0).max(100),
  }),
  query: z.object({}).optional(),
  params: z.object({ projectId: objectId }),
});

export const projectIdParamSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({ projectId: objectId }),
});

export const projectQuerySchema = z.object({
  body: z.object({}).optional(),
  query: z.object({
    status: z.enum(Object.values(PROJECT_STATUS)).optional(),
    search: z.string().optional(),
    projectManager: objectId.optional(),
    team: objectId.optional(),
    deadlineBefore: z.string().optional(),
    deadlineAfter: z.string().optional(),
    page: z.coerce.number().min(1).optional().default(1),
    limit: z.coerce.number().min(1).max(100).optional().default(20),
    sortBy: z.enum(["createdAt", "deadline", "name", "status", "progress"]).optional().default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  }),
  params: z.object({}).optional(),
});

// ------------------ Milestones ------------------

export const createMilestoneSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1, "Milestone title is required").max(200),
    description: z.string().trim().max(2000).optional().default(""),
    dueDate: z.coerce.date().optional(),
    assignedTo: z.array(objectId).optional().default([]),
  }),
  query: z.object({}).optional(),
  params: z.object({ projectId: objectId }),
});

export const updateMilestoneSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1).max(200).optional(),
    description: z.string().trim().max(2000).optional(),
    dueDate: z.coerce.date().nullable().optional(),
    assignedTo: z.array(objectId).optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({ projectId: objectId, milestoneId: objectId }),
});

export const milestoneIdParamSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({ projectId: objectId, milestoneId: objectId }),
});

export const updateMilestoneProgressSchema = z.object({
  body: z.object({
    progress: z.coerce.number().min(0).max(100),
  }),
  query: z.object({}).optional(),
  params: z.object({ projectId: objectId, milestoneId: objectId }),
});
