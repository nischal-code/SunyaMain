export const ROLES = Object.freeze({
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  MANAGER: "manager",
  EMPLOYEE: "employee",
});

export const ROLE_HIERARCHY = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN,
  ROLES.MANAGER,
  ROLES.EMPLOYEE,
];

export const ATTENDANCE_STATUS = Object.freeze({
  PRESENT: "present",
  LATE: "late",
  HALF_DAY: "half_day",
  ABSENT: "absent",
  LEAVE: "leave",
  REMOTE: "remote",
});

export const OTP_PURPOSE = Object.freeze({
  EMAIL_VERIFICATION: "email_verification",
  PASSWORD_RESET: "password_reset",
});

export const MIN_CLOCK_OUT_HOURS = 3; // Minimum hours before an employee can clock out

export const TASK_STATUS = Object.freeze({
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  REVIEW: "review",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
});

export const TASK_PRIORITY = Object.freeze({
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
});

export const NOTIFICATION_TYPE = Object.freeze({
  TASK_ASSIGNED: "task_assigned",
  TASK_REASSIGNED: "task_reassigned",
  TASK_UPDATED: "task_updated",
  TASK_STATUS_CHANGED: "task_status_changed",
  TASK_COMMENT_ADDED: "task_comment_added",
  TASK_DUE_SOON: "task_due_soon",
  PROJECT_ASSIGNED: "project_assigned",
  PROJECT_MANAGER_ASSIGNED: "project_manager_assigned",
  PROJECT_UPDATED: "project_updated",
  PROJECT_STATUS_CHANGED: "project_status_changed",
  MILESTONE_ASSIGNED: "milestone_assigned",
  MILESTONE_COMPLETED: "milestone_completed",
  PROJECT_DEADLINE_SOON: "project_deadline_soon",
});

export const UPCOMING_DEADLINE_WINDOW_DAYS = 7; // How far ahead "upcoming deadlines" looks

export const PROJECT_STATUS = Object.freeze({
  PLANNING: "planning",
  DESIGN: "design",
  DEVELOPMENT: "development",
  TESTING: "testing",
  PRODUCTION: "production",
  COMPLETED: "completed",
});

export const MILESTONE_STATUS = Object.freeze({
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
});
// Projects considered "running" (actively in flight) for the Employee
// Dashboard's "Running Projects" card. Excludes PLANNING (not started yet)
// and COMPLETED (finished).
export const RUNNING_PROJECT_STATUSES = [
  PROJECT_STATUS.DESIGN,
  PROJECT_STATUS.DEVELOPMENT,
  PROJECT_STATUS.TESTING,
  PROJECT_STATUS.PRODUCTION,
];