// Self-contained styled pill (does not use components/common/Badge) so
// light/dark colors can be tuned for the attendance screens without
// touching the shared Badge used across the rest of the app — same
// pattern as components/dashboard's local color tokens.
const STATUS_CONFIG = {
  present: { label: "Present", classes: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" },
  late: { label: "Late", classes: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400" },
  absent: { label: "Absent", classes: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400" },
  half_day: { label: "Half Day", classes: "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400" },
  on_leave: { label: "On Leave", classes: "bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-400" },
  leave: { label: "On Leave", classes: "bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-400" },
  work_from_home: { label: "WFH", classes: "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400" },
  remote: { label: "Remote", classes: "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400" },
  holiday: { label: "Holiday", classes: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300" },
  weekend: { label: "Weekend", classes: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300" },
};

const SIZE_CLASSES = {
  sm: "px-2 py-0.5 text-[11px]",
  md: "px-2.5 py-1 text-xs",
};

const toTitleCase = (value) =>
  value
    .toString()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

/**
 * AttendanceStatusBadge
 * Small colored pill for an attendance record's status. Local to the
 * attendance screens (ClockInOutWidget, AttendanceTable, AttendanceCalendar,
 * AttendanceHistoryModal) so every one of them renders statuses identically,
 * with full light/dark support.
 *
 * Props:
 *  - status:    string — e.g. "present", "late", "on_leave" (snake_case OK) — required
 *  - size:      "sm" | "md" — default "md"
 *  - className: string
 */
const AttendanceStatusBadge = ({ status, size = "md", className = "" }) => {
  const key = status?.toString().toLowerCase();
  const config = STATUS_CONFIG[key];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${
        config?.classes || "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
      } ${SIZE_CLASSES[size] || SIZE_CLASSES.md} ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {config?.label || toTitleCase(status || "Unknown")}
    </span>
  );
};

export default AttendanceStatusBadge;
