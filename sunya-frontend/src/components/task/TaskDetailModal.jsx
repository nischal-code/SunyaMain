import { useMemo, useState } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import ConfirmDialog from "../common/ConfirmDialog";
import Avatar from "../common/Avatar";
import ProgressBar from "../common/ProgressBar";
import Select from "../common/Select";
import TaskPriorityBadge from "./TaskPriorityBadge";
import TaskStatusBadge from "./TaskStatusBadge";
import TaskEditForm from "./TaskEditForm";
import TaskComments from "./TaskComments";
import TaskChecklist from "./TaskChecklist";
import taskApi from "../../api/task.api";

const ADMIN_TIER_ROLES = ["super_admin", "admin", "manager"];

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
 * TaskDetailModal
 * Full task detail as a modal overlay — used from TasksPage/MyTasksPage
 * so a task can be inspected/acted on without leaving the list. Bundles
 * self-service actions (start/complete, tracked via progress %), admin
 * management (edit, reassign via TaskEditForm, status change, delete),
 * plus the checklist and comment thread. For a shareable/linkable full
 * page equivalent, see TaskDetailPage.
 *
 * Props:
 *  - isOpen:        bool — required
 *  - onClose:       fn — required
 *  - task:          object — required, the task being viewed
 *  - currentUser:   object — required, drives which actions are shown
 *  - users:         { value, label }[] — assignable employee directory, for editing
 *  - onTaskUpdate:  fn(task) — called whenever the task changes
 *  - onTaskDeleted: fn(taskId) — called after a successful delete
 */
const TaskDetailModal = ({ isOpen, onClose, task, currentUser, users = [], onTaskUpdate, onTaskDeleted }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionError, setActionError] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const canManage = ADMIN_TIER_ROLES.includes(currentUser?.role);
  const canDelete = ["super_admin", "admin"].includes(currentUser?.role);

  const isAssignee = useMemo(
    () => (task?.assignedTo || []).some((u) => (typeof u === "string" ? u : u._id) === currentUser?._id),
    [task, currentUser]
  );

  if (!task) return null;

  const handleTaskChange = (updated) => {
    if (updated) onTaskUpdate?.(updated);
  };

  const handleStart = async () => {
    setActionError("");
    setIsStarting(true);
    try {
      const { data } = await taskApi.startTask(task._id);
      handleTaskChange(data?.data?.task);
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
      handleTaskChange(data?.data?.task);
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
      handleTaskChange(data?.data?.task);
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
      onTaskDeleted?.(task._id);
      setIsConfirmingDelete(false);
      onClose?.();
    } catch (err) {
      setActionError(err?.response?.data?.message || "Unable to delete this task.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen && !isConfirmingDelete}
        onClose={onClose}
        title={isEditing ? "Edit task" : task.title}
        size="lg"
      >
        {actionError && (
          <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {actionError}
          </div>
        )}

        {isEditing ? (
          <TaskEditForm
            task={task}
            users={users}
            onCancel={() => setIsEditing(false)}
            onSuccess={(updated) => {
              handleTaskChange(updated);
              setIsEditing(false);
            }}
          />
        ) : (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <TaskStatusBadge status={task.status} />
              <TaskPriorityBadge priority={task.priority} />
              {task.project && (
                <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  {task.project}
                </span>
              )}
              <span className="ml-auto text-xs text-gray-400">Due {formatDate(task.dueDate)}</span>
            </div>

            {task.description && <p className="text-sm text-gray-600">{task.description}</p>}

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

            <TaskChecklist
              taskId={task._id}
              onProgressSync={(progress) => handleTaskChange({ ...task, progress })}
            />

            <TaskComments
              taskId={task._id}
              comments={task.comments || []}
              onCommentAdded={(comments) => handleTaskChange({ ...task, comments })}
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
        )}
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
    </>
  );
};

export default TaskDetailModal;
