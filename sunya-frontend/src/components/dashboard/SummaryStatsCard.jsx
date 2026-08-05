import DashboardCard from "./DashboardCard";
import { TrendUpIcon, TrendDownIcon, MinusIcon } from "./dashboardIcons";

// Icon badge + accent glow per stat color. Kept local to this card so the
// shared Badge/color tokens elsewhere in the app aren't touched.
const COLOR_CLASSES = {
  primary: {
    icon: "bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400",
    glow: "from-primary-500/10",
  },
  success: {
    icon: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
    glow: "from-emerald-500/10",
  },
  warning: {
    icon: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
    glow: "from-amber-500/10",
  },
  danger: {
    icon: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400",
    glow: "from-rose-500/10",
  },
  info: {
    icon: "bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400",
    glow: "from-sky-500/10",
  },
  gray: {
    icon: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    glow: "from-slate-500/10",
  },
};

const TREND_CLASSES = {
  up: "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10",
  down: "text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-500/10",
  flat: "text-slate-500 bg-slate-100 dark:text-slate-400 dark:bg-slate-800",
};

const TREND_ICONS = { up: TrendUpIcon, down: TrendDownIcon, flat: MinusIcon };

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
  const palette = COLOR_CLASSES[color] || COLOR_CLASSES.primary;
  const TrendIcon = trend ? TREND_ICONS[trend.direction] || TREND_ICONS.flat : null;

  return (
    <DashboardCard className={className} bodyClassName="relative">
      {/* Soft radial accent, purely decorative */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -right-6 -top-10 h-28 w-28 rounded-full bg-gradient-to-br ${palette.glow} to-transparent blur-2xl`}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {label}
          </p>

          {isLoading ? (
            <div className="mt-2.5 h-8 w-20 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
          ) : (
            <p className="mt-1 text-[1.75rem] font-semibold leading-tight tracking-tight text-slate-900 dark:text-slate-50">
              {value}
            </p>
          )}

          {trend && !isLoading && (
            <span
              className={`mt-2.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                TREND_CLASSES[trend.direction] || TREND_CLASSES.flat
              }`}
            >
              {TrendIcon && <TrendIcon className="h-3 w-3" />}
              {trend.label}
            </span>
          )}
        </div>

        {icon && (
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg ${palette.icon}`}
          >
            {icon}
          </span>
        )}
      </div>
    </DashboardCard>
  );
};

export default SummaryStatsCard;
