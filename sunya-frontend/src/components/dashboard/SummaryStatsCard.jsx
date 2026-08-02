import Card from "../common/Card";

const COLOR_CLASSES = {
  primary: "bg-primary-50 text-primary-700",
  success: "bg-green-50 text-green-700",
  warning: "bg-amber-50 text-amber-700",
  danger: "bg-red-50 text-red-700",
  info: "bg-blue-50 text-blue-700",
  gray: "bg-gray-100 text-gray-700",
};

const TREND_CLASSES = {
  up: "text-green-600",
  down: "text-red-600",
  flat: "text-gray-400",
};

/**
 * SummaryStatsCard
 * Single stat tile for the dashboard's top row (e.g. "Total Employees",
 * "Completed Tasks", "Pending Reviews", "Present Today"). Render several
 * side-by-side in a grid — the data comes from the parent (dashboard.api.js
 * responses), this component is presentation-only.
 *
 * Props:
 *  - label:      string — stat name, required
 *  - value:      string | number — required
 *  - icon:       node — optional leading icon/emoji
 *  - color:      "primary" | "success" | "warning" | "danger" | "info" | "gray" — default "primary"
 *  - trend:      { direction: "up" | "down" | "flat", label: string } — optional
 *  - isLoading:  bool — shows a skeleton in place of the value
 *  - className:  string
 */
const SummaryStatsCard = ({
  label,
  value,
  icon,
  color = "primary",
  trend,
  isLoading = false,
  className = "",
}) => {
  return (
    <Card className={className}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>

          {isLoading ? (
            <div className="mt-2 h-7 w-16 animate-pulse rounded bg-gray-100" />
          ) : (
            <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
          )}

          {trend && !isLoading && (
            <p className={`mt-1 flex items-center gap-1 text-xs font-medium ${TREND_CLASSES[trend.direction] || TREND_CLASSES.flat}`}>
              {trend.direction === "up" && "▲"}
              {trend.direction === "down" && "▼"}
              {trend.label}
            </p>
          )}
        </div>

        {icon && (
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg ${
              COLOR_CLASSES[color] || COLOR_CLASSES.primary
            }`}
          >
            {icon}
          </span>
        )}
      </div>
    </Card>
  );
};

export default SummaryStatsCard;
