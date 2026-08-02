import { useState } from "react";
import Avatar from "../common/Avatar";
import TextArea from "../common/TextArea";
import Button from "../common/Button";
import taskApi from "../../api/task.api";

const formatDateTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
};

/**
 * TaskComments
 * Comment thread for a task — POST /tasks/:taskId/comments. Available to
 * anyone who can see the task (assignee, assigner, or admin tier); the
 * backend doesn't expose comment edit/delete, so this is add-and-list
 * only. Self-contained: posts the comment itself and reports the fresh
 * comment list back via `onCommentAdded` so the parent (TaskDetailModal /
 * TaskDetailPage) can keep the rest of the task in sync.
 *
 * Props:
 *  - taskId:          string — required
 *  - comments:        { _id, user, text, createdAt }[] — required, oldest-first
 *  - onCommentAdded:  fn(comments) — called with the updated comment list
 *  - className:       string
 */
const TaskComments = ({ taskId, comments = [], onCommentAdded, className = "" }) => {
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    setIsSubmitting(true);
    setError("");
    try {
      const { data } = await taskApi.addTaskComment(taskId, trimmed);
      const updatedComments = data?.data?.task?.comments ?? [...comments];
      onCommentAdded?.(updatedComments);
      setText("");
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to post this comment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={className}>
      <h3 className="mb-3 text-sm font-semibold text-gray-900">
        Comments {comments.length > 0 && <span className="text-gray-400">({comments.length})</span>}
      </h3>

      <ul className="space-y-4">
        {comments.map((comment) => (
          <li key={comment._id} className="flex items-start gap-2.5">
            <Avatar src={comment.user?.profilePicture?.url} name={comment.user?.name} size="sm" />
            <div className="min-w-0 flex-1 rounded-xl bg-gray-50 px-3.5 py-2.5">
              <div className="flex items-baseline justify-between gap-2">
                <p className="truncate text-sm font-medium text-gray-900">{comment.user?.name || "Unknown"}</p>
                <p className="shrink-0 text-[11px] text-gray-400">{formatDateTime(comment.createdAt)}</p>
              </div>
              <p className="mt-0.5 whitespace-pre-wrap break-words text-sm text-gray-600">{comment.text}</p>
            </div>
          </li>
        ))}

        {!comments.length && <p className="py-2 text-sm text-gray-400">No comments yet.</p>}
      </ul>

      <form onSubmit={handleSubmit} className="mt-4 space-y-2">
        {error && <p className="text-xs text-red-600">{error}</p>}
        <TextArea
          rows={2}
          placeholder="Write a comment…"
          value={text}
          onChange={(event) => setText(event.target.value)}
          maxLength={1000}
        />
        <div className="flex justify-end">
          <Button type="submit" size="sm" isLoading={isSubmitting} disabled={!text.trim()}>
            Post comment
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TaskComments;
