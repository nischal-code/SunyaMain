import Badge from "../common/Badge";

const STATUS_CONFIG = {
  present: { label: "Present", variant: "success" },
  late: { label: "Late", variant: "warning" },
  absent: { label: "Absent", variant: "danger" },
  half_day: { label: "Half Day", variant: "info" },
  on_leave: { label: "On Leave", variant: "primary" },
  work_from_home: { label: "WFH", variant: "info" },
  holiday: { label: "Holiday", variant: "gray" },
  weekend: { label: "Weekend", variant: "gray" },
};

const toTitleCase = (value) =>
  value
    .toString()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

/**
 * AttendanceStatusBadge
 * Small colored pill for an attendance record's status. Wraps the common
 * Badge component with attendance-specific labels/colors so every screen
 * (table, calendar, history modal, filters) renders statuses identically.
 *
 * Props:
 *  - status:    string — e.g. "present", "late", "on_leave" (snake_case OK) — required
 *  - size:      "sm" | "md" — passed through to Badge, default "md"
 *  - className: string
 */
const AttendanceStatusBadge = ({ status, size = "md", className = "" }) => {
  const key = status?.toString().toLowerCase();
  const config = STATUS_CONFIG[key];

  return (
    <Badge variant={config?.variant || "gray"} size={size} dot className={className}>
      {config?.label || toTitleCase(status || "Unknown")}
    </Badge>
  );
};

export default AttendanceStatusBadge;
