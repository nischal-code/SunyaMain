const STATUS_CONFIG = {
  active: { label: "Active", classes: "bg-green-50 text-green-700" },
  inactive: { label: "Inactive", classes: "bg-gray-100 text-gray-600" },
  pending: { label: "Pending", classes: "bg-amber-50 text-amber-700" },
  approved: { label: "Approved", classes: "bg-green-50 text-green-700" },
  rejected: { label: "Rejected", classes: "bg-red-50 text-red-700" },
  completed: { label: "Completed", classes: "bg-green-50 text-green-700" },
  in_progress: { label: "In progress", classes: "bg-blue-50 text-blue-700" },
  on_hold: { label: "On hold", classes: "bg-amber-50 text-amber-700" },
  cancelled: { label: "Cancelled", classes: "bg-red-50 text-red-700" },
  present: { label: "Present", classes: "bg-green-50 text-green-700" },
  absent: { label: "Absent", classes: "bg-red-50 text-red-700" },
  late: { label: "Late", classes: "bg-amber-50 text-amber-700" },
  default: { label: "", classes: "bg-gray-100 text-gray-600" },
};

/**
 * StatusPill
 * Colored status indicator (dot + label) for entity states — attendance,
 * task/project status, approval flows, etc. Ships with sensible defaults
 * for common backend status strings but accepts a custom label so it can
 * represent any status.
 *
 * Props:
 *  - status:    string — e.g. "active", "pending", "in_progress" (snake_case OK) — required
 *  - label:     string — overrides the auto-generated label text
 *  - className: string
 */
const toTitleCase = (value) =>
  value
    .toString()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const StatusPill = ({ status, label, className = "" }) => {
  const key = status?.toString().toLowerCase();
  const config = STATUS_CONFIG[key] || STATUS_CONFIG.default;
  const displayLabel = label || config.label || toTitleCase(status || "Unknown");

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${config.classes} ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {displayLabel}
    </span>
  );
};

export default StatusPill;
