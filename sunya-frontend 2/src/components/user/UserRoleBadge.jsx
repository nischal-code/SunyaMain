import Badge from "../common/Badge";

const ROLE_CONFIG = {
  super_admin: { label: "Super Admin", variant: "danger" },
  admin: { label: "Admin", variant: "primary" },
  manager: { label: "Manager", variant: "info" },
  employee: { label: "Employee", variant: "gray" },
};

const toTitleCase = (value) =>
  value
    ?.toString()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

/**
 * UserRoleBadge
 * Colored badge for a user's role (super_admin/admin/manager/employee).
 *
 * Props:
 *  - role:      string — required, e.g. "super_admin"
 *  - size:      "sm" | "md" — passed through to Badge, default "md"
 *  - className: string
 */
const UserRoleBadge = ({ role, size = "md", className = "" }) => {
  const config = ROLE_CONFIG[role] || { label: toTitleCase(role) || "Unknown", variant: "gray" };

  return (
    <Badge variant={config.variant} size={size} className={className}>
      {config.label}
    </Badge>
  );
};

export default UserRoleBadge;
