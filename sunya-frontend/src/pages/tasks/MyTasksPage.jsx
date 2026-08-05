import { useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth";
import taskApi from "../../api/task.api";

import Tabs from "../../components/common/Tabs";
import TaskFilters from "../../components/task/TaskFilters";
import TaskList from "../../components/task/TaskList";
import TaskDetailModal from "../../components/task/TaskDetailModal";
import { CheckCircleIcon, AlertTriangleIcon } from "../../components/dashboard/dashboardIcons";

const VIEW_TABS = [
  { id: "card", label: "Cards" },
  { id: "table", label: "Table" },
];

const PAGE_SIZE = 12;

/**
 * MyTasksPage
 * The current user's own assigned tasks — GET /tasks with assignedTo
 * fixed to the logged-in user (the backend enforces this scoping
 * automatically for non-admin roles, but it's set explicitly here so
 * admin/manager accounts also see "my tasks" rather than everyone's).
 * No create/board/assignee-filter controls here — those live on
 * TasksPage — this is purely the self-service view: start, track
 * progress, complete, comment, and check off sub-items.
 */
const MyTasksPage = () => {
  const { user: currentUser } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ search: "", status: "", priority: "", project: "" });
  const [view, setView] = useState("card");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedTask, setSelectedTask] = useState(null);

  const fetchTasks = () => {
    if (!currentUser?._id) return Promise.resolve();
    setIsLoading(true);
    setError("");

    return taskApi
      .listTasks({
        assignedTo: currentUser._id,
        search: filters.search || undefined,
        status: filters.status || undefined,
        priority: filters.priority || undefined,
        project: filters.project || undefined,
        page,
        limit: PAGE_SIZE,
        sortBy: "dueDate",
        sortOrder: "asc",
      })
      .then((res) => {
        const data = res?.data?.data;
        setTasks(data?.tasks ?? []);
        setTotalPages(data?.pagination?.totalPages ?? 1);
        setTotal(data?.pagination?.total ?? data?.tasks?.length ?? 0);
      })
      .catch((err) => {
        setError(err?.response?.data?.message || "Unable to load your tasks.");
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchTasks().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, page, currentUser?._id]);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  const updateTaskInList = (updatedTask) => {
    if (!updatedTask?._id) return;
    setTasks((prev) => prev.map((t) => (t._id === updatedTask._id ? { ...t, ...updatedTask } : t)));
    setSelectedTask((prev) => (prev && prev._id === updatedTask._id ? { ...prev, ...updatedTask } : prev));
  };

  const removeTaskFromList = (taskId) => {
    setTasks((prev) => prev.filter((t) => t._id !== taskId));
    setSelectedTask(null);
  };

  return (
    <div className="space-y-7">
      {/* Hero header — mirrors the dashboard's premium banner treatment */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-gradient-to-br from-primary-600 via-primary-600 to-indigo-700 px-6 py-7 shadow-[0_10px_30px_-12px_rgba(79,70,229,0.45)] dark:border-slate-800 sm:px-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-14 -top-16 h-56 w-56 rounded-full bg-white/10 blur-3xl"
        />
        <div className="relative flex items-start gap-3">
          <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white backdrop-blur-sm">
            <CheckCircleIcon className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-[1.75rem]">My tasks</h1>
            <p className="mt-1 text-sm text-primary-100/90">
              {total} task{total === 1 ? "" : "s"} assigned to you
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3.5 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400">
          <AlertTriangleIcon className="mt-0.5 h-5 w-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white/90 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_30px_-16px_rgba(15,23,42,0.12)] backdrop-blur-sm dark:border-slate-800/80 dark:bg-slate-900/70 sm:flex-row sm:items-end sm:justify-between">
        <TaskFilters
          filters={filters}
          onChange={setFilters}
          onReset={() => setFilters({ search: "", status: "", priority: "", project: "" })}
        />
        <Tabs tabs={VIEW_TABS} activeTab={view} onChange={setView} variant="pills" />
      </div>

      <TaskList
        tasks={tasks}
        view={view}
        isLoading={isLoading}
        onView={setSelectedTask}
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        emptyMessage="No tasks assigned to you yet"
      />

      <TaskDetailModal
        isOpen={Boolean(selectedTask)}
        onClose={() => setSelectedTask(null)}
        task={selectedTask}
        currentUser={currentUser}
        users={[]}
        onTaskUpdate={updateTaskInList}
        onTaskDeleted={removeTaskFromList}
      />
    </div>
  );
};

export default MyTasksPage;
