const VARIANT_CLASSES = {
  gray: "bg-gray-100 text-gray-700",
  primary: "bg-primary-50 text-primary-700",
  success: "bg-green-50 text-green-700",
  warning: "bg-amber-50 text-amber-700",
  danger: "bg-red-50 text-red-700",
  info: "bg-blue-50 text-blue-700",
};

const SIZE_CLASSES = {
  sm: "px-2 py-0.5 text-[11px]",
  md: "px-2.5 py-1 text-xs",
};

/**
 * Badge
 * Small pill label for statuses, roles, counts, tags, etc.
 *
 * Props:
 *  - variant: "gray" | "primary" | "success" | "warning" | "danger" | "info" — default "gray"
 *  - size:    "sm" | "md" — default "md"
 *  - dot:     bool — shows a small leading dot in the badge color, default false
 */
const Badge = ({ children, variant = "gray", size = "md", dot = false, className = "" }) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${
        VARIANT_CLASSES[variant] || VARIANT_CLASSES.gray
      } ${SIZE_CLASSES[size] || SIZE_CLASSES.md} ${className}`}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
};

export default Badge;
