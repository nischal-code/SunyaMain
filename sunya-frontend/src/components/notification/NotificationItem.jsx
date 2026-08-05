import Badge from "../common/Badge";

const TYPE_META = {
  task_assigned: { label: "Task", variant: "primary" },
  task_due: { label: "Due soon", variant: "warning" },
  task_completed: { label: "Completed", variant: "success" },
  project_update: { label: "Project", variant: "info" },
  attendance: { label: "Attendance", variant: "info" },
  announcement: { label: "Announcement", variant: "primary" },
  system: { label: "System", variant: "gray" },
};

const formatRelativeTime = (dateString) => {
  if (!dateString) return "";

  const date = new Date(dateString);
  const diffSec = Math.max(Math.floor((Date.now() - date.getTime()) / 1000), 0);

  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay}d ago`;

  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

/**
 * NotificationItem
 * Single notification row, used by NotificationList in both compact
 * (dropdown) and full (NotificationsPage) layouts.
 *
 * Props:
 *  - notification: { _id, type, title, message, isRead, link, createdAt } — required
 *  - compact:      bool — tighter padding/typography for the dropdown, default false
 *  - onClick:      fn — clicking the row body (parent treats this as "open", and
 *      marks the notification read if it wasn't already)
 *  - onMarkRead:   fn — explicit "mark as read" action, only rendered when unread
 *  - onDelete:     fn — remove this notification
 */
const NotificationItem = ({ notification, compact = false, onClick, onMarkRead, onDelete }) => {
  const meta = TYPE_META[notification.type] || TYPE_META.system;
  const isRead = Boolean(notification.isRead);

  return (
    <li
      className={`group relative flex items-start gap-2 transition-colors hover:bg-gray-50 ${
        compact ? "px-4 py-3" : "px-3 py-4 sm:px-4"
      } ${!isRead ? "bg-primary-50/40" : ""}`}
    >
      <button type="button" onClick={onClick} className="flex flex-1 items-start gap-3 text-left">
        <span
          aria-hidden="true"
          className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${isRead ? "bg-transparent" : "bg-primary-600"}`}
        />

        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span
              className={`text-sm ${isRead ? "font-medium text-gray-700" : "font-semibold text-gray-900"}`}
            >
              {notification.title || "Notification"}
            </span>
            <Badge variant={meta.variant} size="sm">
              {meta.label}
            </Badge>
          </span>

          {notification.message && (
            <span
              className={`mt-0.5 block text-sm text-gray-500 ${compact ? "line-clamp-2" : ""}`}
            >
              {notification.message}
            </span>
          )}

          <span className="mt-1 block text-xs text-gray-400">
            {formatRelativeTime(notification.createdAt)}
          </span>
        </span>
      </button>

      <span className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
        {!isRead && onMarkRead && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onMarkRead();
            }}
            aria-label="Mark as read"
            title="Mark as read"
            className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-primary-600"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </button>
        )}

        {onDelete && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onDelete();
            }}
            aria-label="Delete notification"
            title="Delete"
            className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 7h12M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m2 0v12a2 2 0 01-2 2H8a2 2 0 01-2-2V7h12z"
              />
            </svg>
          </button>
        )}
      </span>
    </li>
  );
};

export default NotificationItem;
