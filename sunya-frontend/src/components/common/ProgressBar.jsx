const COLOR_CLASSES = {
  primary: "bg-primary-600",
  success: "bg-green-500",
  warning: "bg-amber-500",
  danger: "bg-red-500",
};

/**
 * ProgressBar
 * Horizontal progress indicator (e.g. project/task completion,
 * productivity score).
 *
 * Props:
 *  - value:     number — required, current value
 *  - max:       number — default 100
 *  - color:     "primary" | "success" | "warning" | "danger" — default "primary"
 *  - size:      "sm" | "md" — default "md"
 *  - showLabel: bool — shows "N%" to the right of the bar, default false
 */
const ProgressBar = ({
  value = 0,
  max = 100,
  color = "primary",
  size = "md",
  showLabel = false,
  className = "",
}) => {
  const percent = Math.min(100, Math.max(0, (value / max) * 100 || 0));

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        role="progressbar"
        aria-valuenow={Math.round(percent)}
        aria-valuemin={0}
        aria-valuemax={100}
        className={`w-full overflow-hidden rounded-full bg-gray-100 ${
          size === "sm" ? "h-1.5" : "h-2.5"
        }`}
      >
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            COLOR_CLASSES[color] || COLOR_CLASSES.primary
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>
      {showLabel && (
        <span className="shrink-0 text-xs font-medium text-gray-500">{Math.round(percent)}%</span>
      )}
    </div>
  );
};

export default ProgressBar;
