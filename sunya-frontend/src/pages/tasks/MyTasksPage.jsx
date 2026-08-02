import { useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth";
import taskApi from "../../api/task.api";

import Tabs from "../../components/common/Tabs";
import TaskFilters from "../../components/task/TaskFilters";
import TaskList from "../../components/task/TaskList";
import TaskDetailModal from "../../components/task/TaskDetailModal";

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
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">My tasks</h1>
        <p className="mt-1 text-sm text-gray-500">
          {total} task{total === 1 ? "" : "s"} assigned to you
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
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
