import { useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth";
import taskApi from "../../api/task.api";
import userApi from "../../api/user.api";

import Button from "../../components/common/Button";
import Tabs from "../../components/common/Tabs";
import Modal from "../../components/common/Modal";
import TaskFilters from "../../components/task/TaskFilters";
import TaskList from "../../components/task/TaskList";
import TaskBoard from "../../components/task/TaskBoard";
import TaskCreateForm from "../../components/task/TaskCreateForm";
import TaskDetailModal from "../../components/task/TaskDetailModal";

const VIEW_TABS = [
  { id: "table", label: "Table" },
  { id: "card", label: "Cards" },
  { id: "board", label: "Board" },
];

const ADMIN_TIER_ROLES = ["super_admin", "admin", "manager"];
const PAGE_SIZE = 12;
const BOARD_PAGE_SIZE = 200; // Board view needs every status represented, not just one page.

/**
 * TasksPage
 * Lists tasks — GET /tasks (employees are always scoped server-side to
 * their own assigned tasks regardless of query params; super_admin/admin/
 * manager see everything and get an assignee filter + task creation).
 * Offers table, card, and kanban board views.
 */
const TasksPage = () => {
  const { user: currentUser } = useAuth();
  const canManage = ADMIN_TIER_ROLES.includes(currentUser?.role);

  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ search: "", status: "", priority: "", project: "", assignedTo: "" });
  const [view, setView] = useState("table");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [userOptions, setUserOptions] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const fetchTasks = () => {
    setIsLoading(true);
    setError("");

    return taskApi
      .listTasks({
        search: filters.search || undefined,
        status: filters.status || undefined,
        priority: filters.priority || undefined,
        project: filters.project || undefined,
        assignedTo: filters.assignedTo || undefined,
        page: view === "board" ? 1 : page,
        limit: view === "board" ? BOARD_PAGE_SIZE : PAGE_SIZE,
      })
      .then((res) => {
        const data = res?.data?.data;
        setTasks(data?.tasks ?? []);
        setTotalPages(data?.pagination?.totalPages ?? 1);
        setTotal(data?.pagination?.total ?? data?.tasks?.length ?? 0);
      })
      .catch((err) => {
        setError(err?.response?.data?.message || "Unable to load tasks.");
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    let isMounted = true;
    fetchTasks().catch(() => {});
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, page, view]);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  useEffect(() => {
    if (!canManage) return;
    userApi
      .listUsers({})
      .then((res) => {
        const users = res?.data?.data?.users ?? [];
        setUserOptions(users.map((u) => ({ value: u._id, label: `${u.name} (${u.email})` })));
      })
      .catch(() => {});
  }, [canManage]);

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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Tasks</h1>
          <p className="mt-1 text-sm text-gray-500">
            {total} task{total === 1 ? "" : "s"}
          </p>
        </div>
        {canManage && <Button onClick={() => setIsCreating(true)}>New task</Button>}
      </div>

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <TaskFilters
          filters={filters}
          onChange={setFilters}
          onReset={() => setFilters({ search: "", status: "", priority: "", project: "", assignedTo: "" })}
          assigneeOptions={canManage ? userOptions : undefined}
        />
        <Tabs tabs={VIEW_TABS} activeTab={view} onChange={setView} variant="pills" />
      </div>

      {view === "board" ? (
        <TaskBoard
          tasks={tasks}
          isLoading={isLoading}
          onTaskClick={setSelectedTask}
          onTaskUpdate={updateTaskInList}
          canDrag={canManage}
        />
      ) : (
        <TaskList
          tasks={tasks}
          view={view}
          isLoading={isLoading}
          onView={setSelectedTask}
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}

      <Modal isOpen={isCreating} onClose={() => setIsCreating(false)} title="New task" size="lg">
        <TaskCreateForm
          users={userOptions}
          onCancel={() => setIsCreating(false)}
          onSuccess={() => {
            setIsCreating(false);
            fetchTasks();
          }}
        />
      </Modal>

      <TaskDetailModal
        isOpen={Boolean(selectedTask)}
        onClose={() => setSelectedTask(null)}
        task={selectedTask}
        currentUser={currentUser}
        users={userOptions}
        onTaskUpdate={updateTaskInList}
        onTaskDeleted={removeTaskFromList}
      />
    </div>
  );
};

export default TasksPage;
