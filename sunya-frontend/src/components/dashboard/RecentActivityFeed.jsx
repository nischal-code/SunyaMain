import { useEffect, useState } from "react";
import DashboardCard from "./DashboardCard";
import Loader from "../common/Loader";
import Avatar from "../common/Avatar";
import { SparkleIcon, InboxIcon, AlertTriangleIcon } from "./dashboardIcons";
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

  const cardIcon = <SparkleIcon className="h-5 w-5" />;

  if (isLoading) {
    return (
      <DashboardCard title={title} icon={cardIcon} className={className}>
        <Loader text="Loading activity…" />
      </DashboardCard>
    );
  }

  if (error) {
    return (
      <DashboardCard title={title} icon={cardIcon} className={className}>
        <div className="flex flex-col items-center gap-2 py-6 text-center">
          <AlertTriangleIcon className="h-6 w-6 text-rose-400" />
          <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
        </div>
      </DashboardCard>
    );
  }

  const rows = (items || []).slice(0, limit);

  if (!rows.length) {
    return (
      <DashboardCard title={title} icon={cardIcon} className={className}>
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <InboxIcon className="h-7 w-7 text-slate-300 dark:text-slate-600" />
          <p className="text-sm text-slate-400 dark:text-slate-500">No recent activity.</p>
        </div>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard title={title} icon={cardIcon} className={className}>
      <ul className="relative space-y-5">
        {/* Connecting timeline line */}
        <div
          aria-hidden="true"
          className="absolute bottom-1 left-4 top-1 w-px bg-slate-100 dark:bg-slate-800"
        />
        {rows.map((item, index) => (
          <li key={`${item.taskId}-${item.at}-${index}`} className="relative flex items-start gap-3">
            <div className="relative z-10">
              <Avatar name={item.actor?.name} size="sm" />
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  {item.actor?.name || "Someone"}
                </span>{" "}
                {ACTION_LABELS[item.action] || item.action || "updated"}{" "}
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  {item.taskTitle || "a task"}
                </span>
              </p>
              <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                {formatRelativeTime(item.at)}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </DashboardCard>
  );
};

export default RecentActivityFeed;
