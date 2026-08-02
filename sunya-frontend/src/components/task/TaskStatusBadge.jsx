import Badge from "../common/Badge";

const STATUS_CONFIG = {
  pending: { label: "Pending", variant: "gray" },
  in_progress: { label: "In Progress", variant: "info" },
  review: { label: "In Review", variant: "warning" },
  completed: { label: "Completed", variant: "success" },
  cancelled: { label: "Cancelled", variant: "danger" },
};

const toTitleCase = (value) =>
  value
    .toString()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

/**
 * TaskStatusBadge
 * Small colored pill for a task's status. Wraps the common Badge
 * component with task-specific labels/colors so every screen (list,
 * board, detail) renders statuses identically.
 *
 * Props:
 *  - status:    string — "pending" | "in_progress" | "review" |
 *      "completed" | "cancelled" (snake_case OK) — required
 *  - size:      "sm" | "md" — passed through to Badge, default "md"
 *  - className: string
 */
const TaskStatusBadge = ({ status, size = "md", className = "" }) => {
  const key = status?.toString().toLowerCase();
  const config = STATUS_CONFIG[key];

  return (
    <Badge variant={config?.variant || "gray"} size={size} dot className={className}>
      {config?.label || toTitleCase(status || "Unknown")}
    </Badge>
  );
};

export default TaskStatusBadge;
