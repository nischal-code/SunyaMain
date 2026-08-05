import { useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth";
import useGsapReveal from "../../hooks/useGsapReveal";
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
import { ClipboardIcon, AlertTriangleIcon } from "../../components/dashboard/dashboardIcons";

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

  const listRevealRef = useGsapReveal({ y: 20, duration: 0.5, deps: [tasks, view, isLoading] });

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
    <div className="space-y-7">
      {/* Hero header — mirrors the dashboard's premium banner treatment */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-gradient-to-br from-primary-600 via-primary-600 to-indigo-700 px-6 py-7 shadow-[0_10px_30px_-12px_rgba(79,70,229,0.45)] dark:border-slate-800 sm:px-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-14 -top-16 h-56 w-56 rounded-full bg-white/10 blur-3xl"
        />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white backdrop-blur-sm">
              <ClipboardIcon className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-[1.75rem]">Tasks</h1>
              <p className="mt-1 text-sm text-primary-100/90">
                {total} task{total === 1 ? "" : "s"} across your workspace
              </p>
            </div>
          </div>
          {canManage && (
            <Button
              onClick={() => setIsCreating(true)}
              className="!bg-white !text-primary-700 hover:!bg-primary-50"
            >
              New task
            </Button>
          )}
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
          onReset={() => setFilters({ search: "", status: "", priority: "", project: "", assignedTo: "" })}
          assigneeOptions={canManage ? userOptions : undefined}
        />
        <Tabs tabs={VIEW_TABS} activeTab={view} onChange={setView} variant="pills" />
      </div>

      <div ref={listRevealRef}>
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
      </div>

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
