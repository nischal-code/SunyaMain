import Badge from "../common/Badge";

const STATUS_CONFIG = {
  planning: { label: "Planning", variant: "gray" },
  in_progress: { label: "In Progress", variant: "info" },
  on_hold: { label: "On Hold", variant: "warning" },
  completed: { label: "Completed", variant: "success" },
  cancelled: { label: "Cancelled", variant: "danger" },
};

const toTitleCase = (value) =>
  value
    .toString()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

/**
 * ProjectStatusBadge
 * Small colored pill for a project's status. Wraps the common Badge
 * component with project-specific labels/colors so every screen (list,
 * card, detail header) renders statuses identically.
 *
 * Props:
 *  - status:    string — "planning" | "in_progress" | "on_hold" |
 *      "completed" | "cancelled" (snake_case OK) — required
 *  - size:      "sm" | "md" — passed through to Badge, default "md"
 *  - className: string
 */
const ProjectStatusBadge = ({ status, size = "md", className = "" }) => {
  const key = status?.toString().toLowerCase();
  const config = STATUS_CONFIG[key];

  return (
    <Badge variant={config?.variant || "gray"} size={size} dot className={className}>
      {config?.label || toTitleCase(status || "Unknown")}
    </Badge>
  );
};

export default ProjectStatusBadge;
