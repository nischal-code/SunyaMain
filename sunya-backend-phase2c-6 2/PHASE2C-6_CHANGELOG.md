# Phase 2C-6 — Analytics Module Performance Optimization

Scope: the Employee Dashboard analytics layer (`dashboard.*`), the
Productivity Analytics layer (`productivity.*`), and the models they read
from (`Task`, `Project`, `Attendance`). No response shapes, route
signatures (existing params), or business rules changed — only additive
query params and internal query-execution strategy.

## 1. MongoDB indexes added

**`src/models/Task.model.js`**
- `{ assignedTo: 1, isDeleted: 1, status: 1, dueDate: 1 }` — Today's
  Tasks / Upcoming Deadlines / Pending Tasks cards.
- `{ assignedTo: 1, isDeleted: 1, status: 1, completedAt: -1 }` —
  Completed Tasks card, Tasks Completed / Avg Completion Time / daily
  trend analytics.
- `{ assignedTo: 1, isDeleted: 1, project: 1 }` — Assigned Projects
  grouping in `task.service.getAssignedProjects`.
- `{ assignedBy: 1, isDeleted: 1 }` — Recent Activity feed's
  `assignedTo` / `assignedBy` `$or` match.

**`src/models/Project.model.js`**
- `{ isDeleted: 1, projectManager: 1, status: 1 }`
- `{ isDeleted: 1, team: 1, status: 1 }`
  — dashboard Assigned/Running Projects cards and Project Participation
  analytics all filter `isDeleted` alongside `projectManager`/`team`.

All existing indexes were left in place.

## 2. Aggregation pipeline optimization — Monthly Productivity

`productivity.service.getMonthlyProductivity` previously called three
already-exported helpers that, between them, issued **4 separate
queries** against the same date range:
- `getDailyTrend` → 1 Task aggregate + 1 Attendance aggregate
- `getTasksCompleted` → 1 Task aggregate (same match as above, different grouping)
- `getAttendanceRate` → 1 Attendance aggregate (same match as above, different grouping)

Added two new internal helpers (`getMonthlyTaskStats`,
`getMonthlyAttendanceStats`) that each use a single `$facet` to compute
both the daily breakdown and the summary grouping in one pass. The
monthly endpoint now issues **2 queries instead of 4**, with byte-for-byte
identical output. The standalone `getTasksCompleted`, `getAttendanceRate`,
and `getDailyTrend` exports (used by their own routes) are untouched.

## 3. Removed a full-collection hydration

`attendance.service.getMonthlySummary` (used by
`dashboard.getEmployeeDashboard`) used to `Attendance.find()` every
record for the month and reduce totals in JS. Replaced with a single
`$facet` aggregation (group by status + a totals group) so Mongo does the
summation and only the aggregated result crosses the wire. Return shape
unchanged.

## 4. `.lean()` applied to read-only paths

- `dashboard.service.getEmployeeDashboard`: the 4 `Task.find(...)` calls
  and the `Attendance.findOne(...)` call are serialized straight into the
  response and never mutated — added `.lean()` to all of them.
- `notification.service.getUserNotifications`: same reasoning, used by
  both the notifications list endpoint and the employee dashboard.

(The paginated dashboard card queries — Today's Tasks, Upcoming
Deadlines, Assigned/Running Projects — already used `.lean()`.)

## 5. Search support added

Added an optional `search` query param (same `$regex`/`$options: "i"`
convention already used by `task.service.listTasks` and
`project.service.listProjects`) to the four paginated dashboard cards:

- `GET /dashboard/employee/today-tasks?search=`
- `GET /dashboard/employee/upcoming-deadlines?search=`
- `GET /dashboard/employee/assigned-projects?search=`
- `GET /dashboard/employee/running-projects?search=`

Task cards search `title`/`description`; project cards search
`name`/`description`. Validators (`dashboard.validator.js`) updated to
accept the new optional field. Omitting `search` behaves exactly as
before — no behavior change for existing callers.

## 6. REST consistency

Pagination (`page`/`limit`/`totalPages`/`total`), sorting
(`sortBy`/`sortOrder`), and now search (`search`) follow the same shape
and query-param names across every list-returning analytics endpoint
(dashboard cards, task listing, project listing).

## Not changed

- No response field was renamed, added, or removed.
- No aggregation's business rule (which statuses count as "pending",
  date-range defaults, etc.) was altered.
- `productivity.controller.js` / `productivity.routes.js` /
  `productivity.validator.js` are single-object analytics endpoints (not
  lists) — pagination/search doesn't apply to them and they were left
  untouched.
