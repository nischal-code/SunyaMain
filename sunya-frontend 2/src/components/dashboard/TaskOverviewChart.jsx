import { useEffect, useMemo, useState } from "react";
import DashboardCard from "./DashboardCard";
import Loader from "../common/Loader";
import { ClipboardIcon, InboxIcon, AlertTriangleIcon } from "./dashboardIcons";
import * as dashboardApi from "../../api/dashboard.api";

const STATUS_CONFIG = [
  { key: "pending", label: "Pending", bar: "bg-slate-400", dot: "bg-slate-400" },
  { key: "in_progress", label: "In Progress", bar: "bg-sky-500", dot: "bg-sky-500" },
  { key: "review", label: "In Review", bar: "bg-amber-500", dot: "bg-amber-500" },
  { key: "completed", label: "Completed", bar: "bg-emerald-500", dot: "bg-emerald-500" },
  { key: "cancelled", label: "Cancelled", bar: "bg-rose-400", dot: "bg-rose-400" },
];

/**
 * TaskOverviewChart
 * Horizontal bar breakdown of the authenticated user's tasks by status
 * (pending / in progress / review / completed / cancelled). Backed by
 * GET /dashboard/employee (taskSummary.counts).
 *
 * Props:
 *  - counts:    { pending, in_progress, review, completed, cancelled } — optional.
 *               If omitted, the component fetches the employee overview itself.
 *  - title:     string — default "Task Overview"
 *  - className: string
 */
const TaskOverviewChart = ({ counts, title = "Task Overview", className = "" }) => {
  const [data, setData] = useState(counts || null);
  const [isLoading, setIsLoading] = useState(!counts);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (counts) {
      setData(counts);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    dashboardApi
      .getEmployeeOverview()
      .then((res) => {
        if (isMounted) setData(res?.data?.data?.taskSummary?.counts ?? null);
      })
      .catch((err) => {
        if (isMounted) setError(err?.response?.data?.message || "Unable to load task overview");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [counts]);

  const { rows, total } = useMemo(() => {
    const totalCount = STATUS_CONFIG.reduce((sum, s) => sum + (data?.[s.key] || 0), 0);
    return {
      rows: STATUS_CONFIG.map((s) => ({ ...s, value: data?.[s.key] || 0 })),
      total: totalCount,
    };
  }, [data]);

  const cardIcon = <ClipboardIcon className="h-5 w-5" />;

  if (isLoading) {
    return (
      <DashboardCard title={title} icon={cardIcon} className={className}>
        <Loader text="Loading tasks…" />
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

  if (!total) {
    return (
      <DashboardCard title={title} icon={cardIcon} className={className}>
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <InboxIcon className="h-7 w-7 text-slate-300 dark:text-slate-600" />
          <p className="text-sm text-slate-400 dark:text-slate-500">No tasks assigned yet.</p>
        </div>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard
      title={title}
      subtitle={`${total} total task${total === 1 ? "" : "s"}`}
      icon={cardIcon}
      className={className}
    >
      {/* Stacked overview bar */}
      <div className="mb-5 flex h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        {rows.map((row) =>
          row.value ? (
            <div
              key={row.key}
              className={`${row.bar} h-full transition-all duration-300 first:rounded-l-full last:rounded-r-full`}
              style={{ width: `${(row.value / total) * 100}%` }}
              title={`${row.label}: ${row.value}`}
            />
          ) : null
        )}
      </div>

      <ul className="space-y-3.5">
        {rows.map((row) => {
          const percent = total ? Math.round((row.value / total) * 100) : 0;
          return (
            <li key={row.key} className="flex items-center gap-3">
              <span className={`h-2 w-2 shrink-0 rounded-full ${row.dot}`} />
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-600 dark:text-slate-300">
                {row.label}
              </span>
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{row.value}</span>
              <span className="w-10 shrink-0 text-right text-xs text-slate-400 dark:text-slate-500">
                {percent}%
              </span>
            </li>
          );
        })}
      </ul>
    </DashboardCard>
  );
};

export default TaskOverviewChart;
