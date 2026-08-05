import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import taskApi from "../../api/task.api";
import userApi from "../../api/user.api";

import Card from "../../components/common/Card";
import Loader from "../../components/common/Loader";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import Avatar from "../../components/common/Avatar";
import ProgressBar from "../../components/common/ProgressBar";
import Select from "../../components/common/Select";
import TaskStatusBadge from "../../components/task/TaskStatusBadge";
import TaskPriorityBadge from "../../components/task/TaskPriorityBadge";
import TaskEditForm from "../../components/task/TaskEditForm";
import TaskChecklist from "../../components/task/TaskChecklist";
import TaskComments from "../../components/task/TaskComments";

const ADMIN_TIER_ROLES = ["super_admin", "admin", "manager"];
const PRIVILEGED_DELETE_ROLES = ["super_admin", "admin"];

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "review", label: "In Review" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const formatDate = (value) => {
  if (!value) return "No due date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No due date";
  return date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
};

/**
 * TaskDetailPage
 * GET /tasks/:taskId — the full, linkable task view (as opposed to
 * TaskDetailModal, which is the same information surfaced as a quick-look
 * overlay from the task list). Shows task meta, assignees, progress,
 * self-service actions for the assignee, admin-tier status/edit/delete
 * controls, the checklist, and the comment thread.
 */
const TaskDetailPage = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const canManage = ADMIN_TIER_ROLES.includes(currentUser?.role);
  const canDelete = PRIVILEGED_DELETE_ROLES.includes(currentUser?.role);

  const [task, setTask] = useState(null);
  const [userOptions, setUserOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const isAssignee = useMemo(
    () => (task?.assignedTo || []).some((u) => (typeof u === "string" ? u : u._id) === currentUser?._id),
    [task, currentUser]
  );

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError("");

    taskApi
      .getTaskById(taskId)
      .then((res) => {
        if (isMounted) setTask(res?.data?.data?.task ?? res?.data?.data ?? null);
      })
      .catch((err) => {
        if (isMounted) setError(err?.response?.data?.message || "Unable to load this task.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [taskId]);

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

  const applyUpdate = (updated) => {
    if (!updated) return;
    setTask((prev) => (prev ? { ...prev, ...updated } : updated));
  };

  const handleStart = async () => {
    setActionError("");
    setIsStarting(true);
    try {
      const { data } = await taskApi.startTask(task._id);
      applyUpdate(data?.data?.task);
    } catch (err) {
      setActionError(err?.response?.data?.message || "Unable to start this task.");
    } finally {
      setIsStarting(false);
    }
  };

  const handleComplete = async () => {
    setActionError("");
    setIsCompleting(true);
    try {
      const { data } = await taskApi.markTaskComplete(task._id);
      applyUpdate(data?.data?.task);
    } catch (err) {
      setActionError(err?.response?.data?.message || "Unable to mark this task complete.");
    } finally {
      setIsCompleting(false);
    }
  };

  const handleStatusChange = async (event) => {
    const status = event.target.value;
    setActionError("");
    setIsUpdatingStatus(true);
    try {
      const { data } = await taskApi.changeTaskStatus(task._id, status);
      applyUpdate(data?.data?.task);
    } catch (err) {
      setActionError(err?.response?.data?.message || "Unable to update the status.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setActionError("");
    try {
      await taskApi.deleteTask(task._id);
      navigate("/tasks", { replace: true });
    } catch (err) {
      setActionError(err?.response?.data?.message || "Unable to delete this task.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) return <Loader fullScreen text="Loading task…" />;

  if (error || !task) {
    return (
      <Card>
        <p className="py-6 text-center text-sm text-red-600">{error || "Task not found."}</p>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
        ← Back
      </Button>

      {actionError && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {actionError}
        </div>
      )}

      <Card>
        <div className="space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{task.title}</h1>
              {task.project && <p className="mt-1 text-sm text-gray-400">{task.project}</p>}
            </div>
            <div className="flex items-center gap-2">
              <TaskStatusBadge status={task.status} />
              <TaskPriorityBadge priority={task.priority} />
            </div>
          </div>

          {task.description && <p className="text-sm text-gray-600">{task.description}</p>}

          <p className="text-xs text-gray-400">Due {formatDate(task.dueDate)}</p>

          <div>
            <p className="mb-1.5 text-xs font-medium text-gray-500">Progress</p>
            <ProgressBar value={task.progress ?? 0} showLabel />
          </div>

          <div>
            <p className="mb-2 text-xs font-medium text-gray-500">Assigned to</p>
            <div className="flex flex-wrap gap-3">
              {(task.assignedTo || []).map((user) => (
                <div key={user._id} className="flex items-center gap-2">
                  <Avatar src={user.profilePicture?.url} name={user.name} size="sm" />
                  <span className="text-sm text-gray-700">{user.name}</span>
                </div>
              ))}
              {!task.assignedTo?.length && <p className="text-sm text-gray-400">Unassigned</p>}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 border-y border-gray-100 py-4">
            {isAssignee && task.status === "pending" && (
              <Button size="sm" onClick={handleStart} isLoading={isStarting}>
                Start task
              </Button>
            )}
            {isAssignee && task.status !== "completed" && task.status !== "cancelled" && (
              <Button size="sm" variant="outline" onClick={handleComplete} isLoading={isCompleting}>
                Mark complete
              </Button>
            )}

            {canManage && (
              <Select
                containerClassName="ml-auto w-40"
                options={STATUS_OPTIONS}
                value={task.status}
                onChange={handleStatusChange}
                disabled={isUpdatingStatus}
              />
            )}
          </div>

          <TaskChecklist taskId={task._id} onProgressSync={(progress) => applyUpdate({ progress })} />

          <TaskComments
            taskId={task._id}
            comments={task.comments || []}
            onCommentAdded={(comments) => applyUpdate({ comments })}
          />

          <div className="flex justify-end gap-2 pt-2">
            {canDelete && (
              <Button variant="danger" size="sm" onClick={() => setIsConfirmingDelete(true)}>
                Delete task
              </Button>
            )}
            {canManage && (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                Edit task
              </Button>
            )}
          </div>
        </div>
      </Card>

      <Modal isOpen={isEditing} onClose={() => setIsEditing(false)} title="Edit task" size="lg">
        <TaskEditForm
          task={task}
          users={userOptions}
          onCancel={() => setIsEditing(false)}
          onSuccess={(updated) => {
            applyUpdate(updated);
            setIsEditing(false);
          }}
        />
      </Modal>

      <ConfirmDialog
        isOpen={isConfirmingDelete}
        title="Delete task?"
        message={`This will permanently delete "${task.title}". This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setIsConfirmingDelete(false)}
      />
    </div>
  );
};

export default TaskDetailPage;
