import { useMemo, useState } from "react";
import TaskColumn from "./TaskColumn";
import taskApi from "../../api/task.api";

const COLUMNS = [
  { status: "pending", label: "Pending" },
  { status: "in_progress", label: "In Progress" },
  { status: "review", label: "In Review" },
  { status: "completed", label: "Completed" },
  { status: "cancelled", label: "Cancelled" },
];

/**
 * TaskBoard
 * Kanban view grouping tasks into columns by status. Rendering is driven
 * entirely by the `tasks` prop (fetched/paginated by the parent, same as
 * TaskList); dragging a card into a different column is handled here —
 * it calls PATCH /tasks/:taskId/status itself (restricted server-side to
 * super_admin/admin/manager) and reports the result up via `onTaskUpdate`
 * so the parent can keep its own state in sync.
 *
 * Props:
 *  - tasks:         object[] — required, all tasks to distribute into columns
 *  - onTaskClick:   fn(task) — optional, opens a task's detail view
 *  - onTaskUpdate:  fn(task) — optional, called after a successful drag-drop
 *      status change with the updated task
 *  - canDrag:       bool — enables drag-and-drop status changes, default false
 *      (pass true only for super_admin/admin/manager viewers)
 *  - isLoading:     bool — shows a skeleton state in every column
 *  - className:     string
 */
const TaskBoard = ({ tasks = [], onTaskClick, onTaskUpdate, canDrag = false, isLoading = false, className = "" }) => {
  const [error, setError] = useState("");
  const [movingTaskId, setMovingTaskId] = useState(null);

  const tasksByStatus = useMemo(() => {
    const grouped = Object.fromEntries(COLUMNS.map((col) => [col.status, []]));
    tasks.forEach((task) => {
      if (grouped[task.status]) grouped[task.status].push(task);
    });
    return grouped;
  }, [tasks]);

  const handleDropTask = async (taskId, status) => {
    const task = tasks.find((t) => t._id === taskId);
    if (!task || task.status === status) return;

    setError("");
    setMovingTaskId(taskId);
    try {
      const { data } = await taskApi.changeTaskStatus(taskId, status);
      onTaskUpdate?.(data?.data?.task ?? { ...task, status });
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to move this task.");
    } finally {
      setMovingTaskId(null);
    }
  };

  return (
    <div className={className}>
      {error && (
        <div className="mb-3 rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex gap-4 overflow-x-auto pb-2">
        {COLUMNS.map((col) => (
          <TaskColumn
            key={col.status}
            status={col.status}
            label={col.label}
            tasks={tasksByStatus[col.status]}
            onTaskClick={onTaskClick}
            onDropTask={canDrag ? handleDropTask : undefined}
            isLoading={isLoading}
            movingTaskId={movingTaskId}
          />
        ))}
      </div>
    </div>
  );
};

export default TaskBoard;
