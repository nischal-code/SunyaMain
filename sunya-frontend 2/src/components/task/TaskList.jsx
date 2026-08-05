import Pagination from "../common/Pagination";
import Avatar from "../common/Avatar";
import Table from "../common/Table";
import ProgressBar from "../common/ProgressBar";
import TaskCard from "./TaskCard";
import TaskPriorityBadge from "./TaskPriorityBadge";
import TaskStatusBadge from "./TaskStatusBadge";

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
};

const MAX_VISIBLE_ASSIGNEES = 3;

/**
 * TaskList
 * Renders a page of tasks as either a table (default) or a card grid.
 * Purely presentational — fetching, filtering, and pagination state all
 * live in the parent (TasksPage/MyTasksPage); this component just
 * renders what it's given.
 *
 * Props:
 *  - tasks:              object[] — required, the current page of tasks to render
 *  - view:                "table" | "card" — default "table"
 *  - isLoading:           bool — shows a skeleton state
 *  - onView:              fn(task) — required, opens a task's detail
 *  - currentPage / totalPages / onPageChange — optional pagination controls
 *  - emptyMessage:        string — default "No tasks found"
 */
const TaskList = ({
  tasks = [],
  view = "table",
  isLoading = false,
  onView,
  currentPage,
  totalPages,
  onPageChange,
  emptyMessage = "No tasks found",
}) => {
  if (view === "card") {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-48 w-full animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800/60" />
          ))}
        </div>
      );
    }

    if (!tasks.length) {
      return (
        <div className="rounded-2xl border border-slate-200/70 bg-white/90 px-4 py-14 text-center text-sm text-slate-400 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_30px_-16px_rgba(15,23,42,0.12)] dark:border-slate-800/80 dark:bg-slate-900/70 dark:text-slate-500">
          {emptyMessage}
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tasks.map((task) => (
            <TaskCard key={task._id} task={task} onClick={onView} />
          ))}
        </div>
        {currentPage && totalPages > 1 && (
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
        )}
      </div>
    );
  }

  const columns = [
    {
      key: "title",
      header: "Task",
      render: (row) => (
        <div className="max-w-xs">
          <p className="truncate font-medium text-slate-900">{row.title}</p>
          {row.project && <p className="truncate text-xs text-slate-400">{row.project}</p>}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <TaskStatusBadge status={row.status} />,
    },
    {
      key: "priority",
      header: "Priority",
      render: (row) => <TaskPriorityBadge priority={row.priority} />,
    },
    {
      key: "progress",
      header: "Progress",
      className: "min-w-[140px]",
      render: (row) => <ProgressBar value={row.progress ?? 0} size="sm" showLabel />,
    },
    {
      key: "assignedTo",
      header: "Assignees",
      render: (row) => {
        const assignees = row.assignedTo || [];
        const visible = assignees.slice(0, MAX_VISIBLE_ASSIGNEES);
        const extra = assignees.length - visible.length;
        return (
          <div className="flex -space-x-2">
            {visible.map((user) => (
              <Avatar
                key={user._id}
                src={user.profilePicture?.url}
                name={user.name}
                size="xs"
                className="ring-2 ring-white"
              />
            ))}
            {extra > 0 && (
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-[10px] font-medium text-slate-600 ring-2 ring-white">
                +{extra}
              </span>
            )}
          </div>
        );
      },
    },
    { key: "dueDate", header: "Due date", render: (row) => formatDate(row.dueDate) },
  ];

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white/90 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_30px_-16px_rgba(15,23,42,0.12)] backdrop-blur-sm dark:border-slate-800/80 dark:bg-slate-900/70">
        <Table
          columns={columns}
          data={tasks}
          isLoading={isLoading}
          emptyMessage={emptyMessage}
          onRowClick={onView}
          keyExtractor={(row, index) => row._id ?? index}
        />
      </div>
      {currentPage && totalPages > 1 && (
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
      )}
    </div>
  );
};

export default TaskList;
