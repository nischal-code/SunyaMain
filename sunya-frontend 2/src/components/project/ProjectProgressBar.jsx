import ProgressBar from "../common/ProgressBar";

/**
 * ProjectProgressBar
 * Project-specific wrapper around the common ProgressBar — derives the
 * bar color from status/deadline (green once complete, red if overdue
 * and unfinished, blue otherwise) and optionally shows a "N/M tasks"
 * caption alongside the percentage.
 *
 * Props:
 *  - progress:       number — 0-100, required
 *  - status:         string — project status; "completed" forces the
 *      success color regardless of progress value
 *  - deadline:       string | Date — used to detect an overdue project
 *  - completedTasks: number — optional, shown as "completed/total tasks"
 *  - totalTasks:     number — optional
 *  - size:           "sm" | "md" — passed through to ProgressBar, default "md"
 *  - className:      string
 */
const ProjectProgressBar = ({
  progress = 0,
  status,
  deadline,
  completedTasks,
  totalTasks,
  size = "md",
  className = "",
}) => {
  const isCompleted = status === "completed" || progress >= 100;
  const isOverdue = !isCompleted && deadline && new Date(deadline) < new Date();

  const color = isCompleted ? "success" : isOverdue ? "danger" : "primary";

  const hasTaskCounts = totalTasks !== undefined && completedTasks !== undefined;

  return (
    <div className={className}>
      <ProgressBar value={progress} color={color} size={size} showLabel />
      {hasTaskCounts && (
        <p className="mt-1 text-xs text-gray-400">
          {completedTasks}/{totalTasks} tasks complete
        </p>
      )}
    </div>
  );
};

export default ProjectProgressBar;
