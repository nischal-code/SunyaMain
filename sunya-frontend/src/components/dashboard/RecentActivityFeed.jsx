import { useEffect, useState } from "react";
import Card from "../common/Card";
import Loader from "../common/Loader";
import Avatar from "../common/Avatar";
import * as dashboardApi from "../../api/dashboard.api";

const ACTION_LABELS = {
  created: "created",
  assigned: "assigned",
  reassigned: "reassigned",
  status_changed: "changed the status of",
  updated: "updated",
  commented: "commented on",
  completed: "completed",
};

const formatRelativeTime = (isoString) => {
  if (!isoString) return "";
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffMins = Math.round(diffMs / 60000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.round(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(isoString).toLocaleDateString();
};

/**
 * RecentActivityFeed
 * Timeline of recent task activity (created/assigned/status changes/etc.)
 * for the authenticated user. Backed by GET /dashboard/employee
 * (recentActivity).
 *
 * Props:
 *  - activity:  array — optional list of { taskId, taskTitle, action, at, actor }.
 *               If omitted, the component fetches the employee overview itself.
 *  - title:     string — default "Recent Activity"
 *  - limit:     number — max rows to display, default 8
 *  - className: string
 */
const RecentActivityFeed = ({ activity, title = "Recent Activity", limit = 8, className = "" }) => {
  const [items, setItems] = useState(activity || null);
  const [isLoading, setIsLoading] = useState(!activity);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (activity) {
      setItems(activity);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    dashboardApi
      .getEmployeeOverview()
      .then((res) => {
        if (isMounted) setItems(res?.data?.data?.recentActivity ?? []);
      })
      .catch((err) => {
        if (isMounted) setError(err?.response?.data?.message || "Unable to load recent activity");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activity]);

  if (isLoading) {
    return (
      <Card title={title} className={className}>
        <Loader text="Loading activity…" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card title={title} className={className}>
        <p className="py-6 text-center text-sm text-red-600">{error}</p>
      </Card>
    );
  }

  const rows = (items || []).slice(0, limit);

  if (!rows.length) {
    return (
      <Card title={title} className={className}>
        <p className="py-10 text-center text-sm text-gray-400">No recent activity.</p>
      </Card>
    );
  }

  return (
    <Card title={title} className={className}>
      <ul className="space-y-4">
        {rows.map((item, index) => (
          <li key={`${item.taskId}-${item.at}-${index}`} className="flex items-start gap-3">
            <Avatar name={item.actor?.name} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-700">
                <span className="font-medium text-gray-900">{item.actor?.name || "Someone"}</span>{" "}
                {ACTION_LABELS[item.action] || item.action || "updated"}{" "}
                <span className="font-medium text-gray-900">{item.taskTitle || "a task"}</span>
              </p>
              <p className="mt-0.5 text-xs text-gray-400">{formatRelativeTime(item.at)}</p>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
};

export default RecentActivityFeed;
