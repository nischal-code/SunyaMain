import Card from "../common/Card";
import Avatar from "../common/Avatar";
import ProgressBar from "../common/ProgressBar";
import TaskPriorityBadge from "./TaskPriorityBadge";
import TaskStatusBadge from "./TaskStatusBadge";

const formatDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
};

const MAX_VISIBLE_ASSIGNEES = 3;

/**
 * TaskCard
 * Compact card representation of a task, used by TaskList in "card" view
 * and by TaskColumn on the kanban TaskBoard.
 *
 * Props:
 *  - task:       object — required (title, description, status, priority,
 *      progress, project, dueDate, assignedTo)
 *  - onClick:    fn(task) — optional, makes the card clickable
 *  - showStatus: bool — hide when the card already lives inside a status
 *      column (TaskBoard), default true
 *  - draggable:  bool — sets the native draggable attribute for TaskBoard
 *      drag-and-drop, default false
 *  - className:  string
 */
const TaskCard = ({ task, onClick, showStatus = true, draggable = false, className = "" }) => {
  const dueDate = formatDate(task.dueDate);
  const isOverdue =
    task.dueDate && task.status !== "completed" && task.status !== "cancelled" && new Date(task.dueDate) < new Date();
  const assignees = task.assignedTo || [];
  const visibleAssignees = assignees.slice(0, MAX_VISIBLE_ASSIGNEES);
  const extraCount = assignees.length - visibleAssignees.length;

  return (
    <Card
      draggable={draggable}
      className={`transition-shadow ${onClick ? "cursor-pointer hover:shadow-md" : ""} ${className}`}
    >
      <div onClick={onClick ? () => onClick(task) : undefined} className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-sm font-semibold text-gray-900">{task.title}</h3>
          <TaskPriorityBadge priority={task.priority} size="sm" />
        </div>

        {task.description && <p className="line-clamp-2 text-xs text-gray-500">{task.description}</p>}

        <ProgressBar value={task.progress ?? 0} size="sm" showLabel />

        <div className="flex items-center justify-between pt-1">
          <div className="flex -space-x-2">
            {visibleAssignees.map((user) => (
              <Avatar
                key={user._id}
                src={user.profilePicture?.url}
                name={user.name}
                size="xs"
                className="ring-2 ring-white"
              />
            ))}
            {extraCount > 0 && (
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-[10px] font-medium text-gray-600 ring-2 ring-white">
                +{extraCount}
              </span>
            )}
          </div>

          {dueDate && (
            <p className={`text-xs ${isOverdue ? "font-medium text-red-500" : "text-gray-400"}`}>
              Due {dueDate}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          {task.project && (
            <p className="truncate text-xs font-medium uppercase tracking-wide text-gray-400">
              {task.project}
            </p>
          )}
          {showStatus && <TaskStatusBadge status={task.status} size="sm" />}
        </div>
      </div>
    </Card>
  );
};

export default TaskCard;
