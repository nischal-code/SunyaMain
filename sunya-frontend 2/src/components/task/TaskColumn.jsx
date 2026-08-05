import { useState } from "react";
import TaskCard from "./TaskCard";

/**
 * TaskColumn
 * A single status column on the TaskBoard kanban view. Supports HTML5
 * drag-and-drop: dropping a card here calls `onDropTask` with the
 * dragged task's id, which the parent (TaskBoard) turns into a
 * PATCH /tasks/:taskId/status call.
 *
 * Props:
 *  - status:     string — the task status this column represents — required
 *  - label:      string — column header text — required
 *  - tasks:      object[] — required, tasks currently in this status
 *  - onTaskClick: fn(task) — optional, opens a task's detail view
 *  - onDropTask: fn(taskId, status) — optional, called when a card from
 *      another column is dropped here
 *  - isLoading:  bool — shows a skeleton state
 *  - className:  string
 */
const TaskColumn = ({
  status,
  label,
  tasks = [],
  onTaskClick,
  onDropTask,
  isLoading = false,
  movingTaskId,
  className = "",
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragOver(false);
    const taskId = event.dataTransfer.getData("text/task-id");
    if (taskId) onDropTask?.(taskId, status);
  };

  return (
    <div
      onDragOver={(event) => {
        if (!onDropTask) return;
        event.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={onDropTask ? handleDrop : undefined}
      className={`flex w-72 shrink-0 flex-col rounded-2xl border bg-slate-50/60 p-3 transition-colors duration-200 dark:bg-slate-900/40 ${
        isDragOver
          ? "border-primary-400 bg-primary-50/50 dark:border-primary-500/60 dark:bg-primary-500/10"
          : "border-slate-200/70 dark:border-slate-800/80"
      } ${className}`}
    >
      <div className="mb-3 flex items-center justify-between px-1">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</h3>
        <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-slate-600 shadow-sm dark:bg-slate-800 dark:text-slate-300">
          {tasks.length}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
        {isLoading &&
          Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="h-32 w-full animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800/60" />
          ))}

        {!isLoading && tasks.length === 0 && (
          <p className="rounded-xl border border-dashed border-slate-200 py-8 text-center text-xs text-slate-400 dark:border-slate-700 dark:text-slate-500">
            No tasks
          </p>
        )}

        {!isLoading &&
          tasks.map((task) => (
            <div
              key={task._id}
              draggable={Boolean(onDropTask)}
              onDragStart={(event) => event.dataTransfer.setData("text/task-id", task._id)}
              className={movingTaskId === task._id ? "opacity-50" : ""}
            >
              <TaskCard task={task} onClick={onTaskClick} showStatus={false} />
            </div>
          ))}
      </div>
    </div>
  );
};

export default TaskColumn;
