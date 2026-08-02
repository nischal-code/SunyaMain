import { z } from "zod";

export const clockInSchema = z.object({
  body: z.object({
    isRemote: z.boolean().optional().default(false),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const attendanceHistoryQuerySchema = z.object({
  body: z.object({}).optional(),
  query: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    page: z.coerce.number().min(1).optional().default(1),
    limit: z.coerce.number().min(1).max(100).optional().default(30),
  }),
  params: z.object({}).optional(),
});

export const attendanceSummaryQuerySchema = z.object({
  body: z.object({}).optional(),
  query: z.object({
    month: z.coerce.number().min(1).max(12).optional(),
    year: z.coerce.number().min(2000).max(2100).optional(),
  }),
  params: z.object({}).optional(),
});

export const attendanceListQuerySchema = z.object({
  body: z.object({}).optional(),
  query: z.object({
    userId: z.string().optional(),
    department: z.string().optional(),
    status: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    search: z.string().optional(),
    page: z.coerce.number().min(1).optional().default(1),
    limit: z.coerce.number().min(1).max(200).optional().default(30),
  }),
  params: z.object({}).optional(),
});

export const createManualAttendanceSchema = z.object({
  body: z.object({
    userId: z.string().min(1, "userId is required"),
    date: z.coerce.date(),
    status: z.string().min(1, "status is required"),
    checkIn: z.coerce.date().optional(),
    checkOut: z.coerce.date().optional(),
    remarks: z.string().max(1000).optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const updateAttendanceSchema = z.object({
  body: z.object({
    status: z.string().min(1).optional(),
    checkIn: z.coerce.date().nullable().optional(),
    checkOut: z.coerce.date().nullable().optional(),
    remarks: z.string().max(1000).nullable().optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({ attendanceId: z.string().min(1) }),
});

export const attendanceIdParamSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({ attendanceId: z.string().min(1) }),
});

export const attendanceReportQuerySchema = z.object({
  body: z.object({}).optional(),
  query: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    department: z.string().optional(),
    groupBy: z.enum(["status", "department", "day"]).optional().default("status"),
  }),
  params: z.object({}).optional(),
});

export const updateSettingsSchema = z.object({
  body: z.object({
    officeStartTime: z
      .string()
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Must be in HH:mm format")
      .optional(),
    officeEndTime: z
      .string()
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Must be in HH:mm format")
      .optional(),
    minWorkingHours: z.coerce.number().min(1).max(24).optional(),
    gracePeriodMinutes: z.coerce.number().min(0).max(120).optional(),
    halfDayThresholdHours: z.coerce.number().min(1).max(12).optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});