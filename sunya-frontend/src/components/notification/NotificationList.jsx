import { useCallback, useEffect, useState } from "react";
import Loader from "../common/Loader";
import Pagination from "../common/Pagination";
import Tabs from "../common/Tabs";
import Button from "../common/Button";
import NotificationItem from "./NotificationItem";
import * as notificationApi from "../../api/notification.api";

const FILTER_TABS = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
];

/**
 * NotificationList
 * Fetches and renders the authenticated user's notifications via
 * notification.api.js. Two modes:
 *  - compact (used inside NotificationDropdown): no filter tabs or
 *    pagination, just the most recent `pageSize` notifications.
 *  - full (used on NotificationsPage): All/Unread filter tabs, pagination,
 *    and a "Mark all as read" action.
 *
 * Props:
 *  - compact:      bool — default false
 *  - pageSize:     number — page size (or item cap when compact), default 10
 *  - onSelectNotification: fn(notification) — called after a row is clicked
 *      (and marked read, if it wasn't already)
 *  - onUnreadCountChange:  fn(count) — called whenever the unread count
 *      changes locally (mark-read, mark-all-read, delete of an unread item)
 *      so a parent like NotificationBell can keep its badge in sync
 *  - className
 */
const NotificationList = ({
  compact = false,
  pageSize = 10,
  onSelectNotification,
  onUnreadCountChange,
  className = "",
}) => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const fetchNotifications = useCallback(() => {
    let isCancelled = false;
    setIsLoading(true);
    setError(null);

    const params = { page, limit: pageSize };
    if (!compact && filter === "unread") params.isRead = false;

    notificationApi
      .listNotifications(params)
      .then((res) => {
        if (isCancelled) return;
        const data = res?.data?.data;
        setNotifications(data?.notifications ?? []);
        setTotalPages(data?.totalPages ?? 1);
      })
      .catch((err) => {
        if (!isCancelled) {
          setError(err?.response?.data?.message || "Unable to load notifications");
        }
      })
      .finally(() => {
        if (!isCancelled) setIsLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [compact, filter, page, pageSize]);

  useEffect(() => fetchNotifications(), [fetchNotifications]);

  useEffect(() => {
    setPage(1);
  }, [filter]);

  const countRemainingUnread = (excludeId) =>
    notifications.filter((n) => n._id !== excludeId && !n.isRead).length;

  const handleMarkRead = (notificationId) => {
    onUnreadCountChange?.(countRemainingUnread(notificationId));
    setNotifications((prev) =>
      prev.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n))
    );
    notificationApi.markNotificationRead(notificationId).catch(() => fetchNotifications());
  };

  const handleDelete = (notificationId) => {
    const target = notifications.find((n) => n._id === notificationId);
    if (target && !target.isRead) {
      onUnreadCountChange?.(countRemainingUnread(notificationId));
    }
    setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
    notificationApi.deleteNotification(notificationId).catch(() => fetchNotifications());
  };

  const handleMarkAllRead = async () => {
    setIsMarkingAll(true);
    try {
      await notificationApi.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      onUnreadCountChange?.(0);
    } catch {
      // Leave the list as-is; the user can retry the action.
    } finally {
      setIsMarkingAll(false);
    }
  };

  const handleSelect = (notification) => {
    if (!notification.isRead) handleMarkRead(notification._id);
    onSelectNotification?.(notification);
  };

  const hasUnread = notifications.some((n) => !n.isRead);

  return (
    <div className={className}>
      {!compact && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <Tabs tabs={FILTER_TABS} activeTab={filter} onChange={setFilter} variant="pills" />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={!hasUnread}
            isLoading={isMarkingAll}
          >
            Mark all as read
          </Button>
        </div>
      )}

      {isLoading ? (
        <Loader text="Loading notifications…" />
      ) : error ? (
        <p className="py-8 text-center text-sm text-red-600">{error}</p>
      ) : notifications.length === 0 ? (
        <p className={`text-center text-sm text-gray-400 ${compact ? "py-8" : "py-14"}`}>
          {filter === "unread" ? "You're all caught up." : "No notifications yet."}
        </p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification._id}
              notification={notification}
              compact={compact}
              onClick={() => handleSelect(notification)}
              onMarkRead={() => handleMarkRead(notification._id)}
              onDelete={() => handleDelete(notification._id)}
            />
          ))}
        </ul>
      )}

      {!compact && !isLoading && !error && totalPages > 1 && (
        <div className="mt-4">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
};

export default NotificationList;
