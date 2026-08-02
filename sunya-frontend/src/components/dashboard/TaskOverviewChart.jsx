import { useEffect, useMemo, useState } from "react";
import Card from "../common/Card";
import Loader from "../common/Loader";
import * as dashboardApi from "../../api/dashboard.api";

const STATUS_CONFIG = [
  { key: "pending", label: "Pending", color: "bg-gray-400" },
  { key: "in_progress", label: "In Progress", color: "bg-blue-500" },
  { key: "review", label: "In Review", color: "bg-amber-500" },
  { key: "completed", label: "Completed", color: "bg-green-500" },
  { key: "cancelled", label: "Cancelled", color: "bg-red-400" },
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

  if (isLoading) {
    return (
      <Card title={title} className={className}>
        <Loader text="Loading tasks…" />
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

  if (!total) {
    return (
      <Card title={title} className={className}>
        <p className="py-10 text-center text-sm text-gray-400">No tasks assigned yet.</p>
      </Card>
    );
  }

  return (
    <Card title={title} subtitle={`${total} total tasks`} className={className}>
      <ul className="space-y-3">
        {rows.map((row) => {
          const percent = total ? Math.round((row.value / total) * 100) : 0;
          return (
            <li key={row.key}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-medium text-gray-600">{row.label}</span>
                <span className="text-gray-500">{row.value}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${row.color}`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
};

export default TaskOverviewChart;
