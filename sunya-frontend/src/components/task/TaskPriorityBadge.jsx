import Badge from "../common/Badge";

const PRIORITY_CONFIG = {
  low: { label: "Low", variant: "gray" },
  medium: { label: "Medium", variant: "info" },
  high: { label: "High", variant: "warning" },
  critical: { label: "Critical", variant: "danger" },
};

const toTitleCase = (value) =>
  value
    .toString()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

/**
 * TaskPriorityBadge
 * Small colored pill for a task's priority. Wraps the common Badge
 * component with task-specific labels/colors so every screen (list,
 * board, detail) renders priorities identically.
 *
 * Props:
 *  - priority:  string — "low" | "medium" | "high" | "critical" — required
 *  - size:      "sm" | "md" — passed through to Badge, default "md"
 *  - className: string
 */
const TaskPriorityBadge = ({ priority, size = "md", className = "" }) => {
  const key = priority?.toString().toLowerCase();
  const config = PRIORITY_CONFIG[key];

  return (
    <Badge variant={config?.variant || "gray"} size={size} dot className={className}>
      {config?.label || toTitleCase(priority || "Unknown")}
    </Badge>
  );
};

export default TaskPriorityBadge;
