import { useEffect, useState } from "react";
import Input from "../common/Input";
import Button from "../common/Button";
import taskApi from "../../api/task.api";

const STORAGE_PREFIX = "sunya_task_checklist:";

const loadItems = (taskId) => {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${taskId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveItems = (taskId, items) => {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${taskId}`, JSON.stringify(items));
  } catch {
    // Storage can fail (quota, private browsing) — checklist state simply
    // won't persist across reloads in that case.
  }
};

/**
 * TaskChecklist
 * Sub-task checklist for a task. The Task model has no dedicated
 * checklist schema, so items are kept client-side (persisted to
 * localStorage per task) rather than round-tripped through the API.
 * What *does* sync to the backend is the overall completion percentage:
 * whenever items are checked/unchecked this calls
 * PATCH /tasks/:taskId/progress so the task's `progress` field (visible
 * everywhere else — TaskCard, TaskList, TaskDetailModal) stays in step
 * with the checklist.
 *
 * Props:
 *  - taskId:          string — required
 *  - editable:        bool — allows adding/removing/checking items,
 *      default true (pass false for read-only viewers)
 *  - onProgressSync:  fn(progress) — called after a successful progress
 *      sync so the parent can update its local task state
 *  - className:       string
 */
const TaskChecklist = ({ taskId, editable = true, onProgressSync, className = "" }) => {
  const [items, setItems] = useState(() => loadItems(taskId));
  const [newItemText, setNewItemText] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setItems(loadItems(taskId));
  }, [taskId]);

  const commit = async (nextItems) => {
    setItems(nextItems);
    saveItems(taskId, nextItems);

    if (!nextItems.length) return;
    const percent = Math.round(
      (nextItems.filter((item) => item.done).length / nextItems.length) * 100
    );

    setIsSyncing(true);
    setError("");
    try {
      const { data } = await taskApi.updateTaskProgress(taskId, percent);
      const updatedProgress = data?.data?.task?.progress ?? percent;
      onProgressSync?.(updatedProgress);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to sync progress.");
    } finally {
      setIsSyncing(false);
    }
  };

  const addItem = (event) => {
    event.preventDefault();
    const label = newItemText.trim();
    if (!label) return;
    commit([...items, { id: `${Date.now()}`, label, done: false }]);
    setNewItemText("");
  };

  const toggleItem = (id) => {
    commit(items.map((item) => (item.id === id ? { ...item, done: !item.done } : item)));
  };

  const removeItem = (id) => {
    commit(items.filter((item) => item.id !== id));
  };

  const doneCount = items.filter((item) => item.done).length;

  return (
    <div className={className}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Checklist</h3>
        {items.length > 0 && (
          <span className="text-xs text-gray-400">
            {doneCount}/{items.length} done{isSyncing ? " · syncing…" : ""}
          </span>
        )}
      </div>

      {error && <p className="mb-2 text-xs text-red-600">{error}</p>}

      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id} className="flex items-center gap-2.5">
            <input
              type="checkbox"
              checked={item.done}
              disabled={!editable}
              onChange={() => toggleItem(item.id)}
              className="h-4 w-4 shrink-0 accent-primary-600"
            />
            <span className={`flex-1 text-sm ${item.done ? "text-gray-400 line-through" : "text-gray-700"}`}>
              {item.label}
            </span>
            {editable && (
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                aria-label={`Remove ${item.label}`}
                className="text-gray-300 hover:text-red-500"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </li>
        ))}

        {!items.length && <p className="py-2 text-sm text-gray-400">No checklist items yet.</p>}
      </ul>

      {editable && (
        <form onSubmit={addItem} className="mt-3 flex items-center gap-2">
          <Input
            containerClassName="flex-1"
            placeholder="Add a checklist item…"
            value={newItemText}
            onChange={(event) => setNewItemText(event.target.value)}
          />
          <Button type="submit" size="sm" variant="outline" disabled={!newItemText.trim()}>
            Add
          </Button>
        </form>
      )}
    </div>
  );
};

export default TaskChecklist;
