import { useEffect, useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer } from "recharts";
import DashboardCard from "./DashboardCard";
import Loader from "../common/Loader";
import { ClipboardIcon, InboxIcon, AlertTriangleIcon } from "./dashboardIcons";
import * as dashboardApi from "../../api/dashboard.api";

const STATUS_CONFIG = [
  { key: "pending", label: "Pending", color: "#94a3b8", bar: "bg-slate-400", dot: "bg-slate-400" },
  { key: "in_progress", label: "In Progress", color: "#0ea5e9", bar: "bg-sky-500", dot: "bg-sky-500" },
  { key: "review", label: "In Review", color: "#f59e0b", bar: "bg-amber-500", dot: "bg-amber-500" },
  { key: "completed", label: "Completed", color: "#10b981", bar: "bg-emerald-500", dot: "bg-emerald-500" },
  { key: "cancelled", label: "Cancelled", color: "#fb7185", bar: "bg-rose-400", dot: "bg-rose-400" },
];

const ChartTooltip = ({ active, payload, total }) => {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  const percent = total ? Math.round((row.value / total) * 100) : 0;
  return (
    <div className="rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-xs shadow-lg backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/95">
      <p className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-100">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: row.color }} />
        {row.label}
      </p>
      <p className="mt-0.5 text-slate-500 dark:text-slate-400">
        {row.value} task{row.value === 1 ? "" : "s"} · {percent}%
      </p>
    </div>
  );
};

/**
 * TaskOverviewChart
 * Horizontal bar breakdown of the authenticated user's tasks by status
 * (pending / in progress / review / completed / cancelled). Backed by
 * GET /dashboard/employee (taskSummary.counts). Rendered with a Recharts
 * horizontal bar chart — bars animate in and highlight on hover, with a
 * tooltip showing the exact count/percentage.
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
  const [activeKey, setActiveKey] = useState(null);

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

      <div className="h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={rows}
            layout="vertical"
            margin={{ top: 0, right: 16, bottom: 0, left: 0 }}
            barCategoryGap={10}
            onMouseLeave={() => setActiveKey(null)}
          >
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="label"
              width={92}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "#64748b" }}
            />
            <Tooltip cursor={{ fill: "rgba(148,163,184,0.08)" }} content={<ChartTooltip total={total} />} />
            <Bar
              dataKey="value"
              radius={[6, 6, 6, 6]}
              isAnimationActive
              animationDuration={700}
              animationEasing="ease-out"
              onMouseEnter={(row) => setActiveKey(row.key)}
              className="cursor-pointer"
            >
              {rows.map((row) => (
                <Cell
                  key={row.key}
                  fill={row.color}
                  fillOpacity={activeKey === null || activeKey === row.key ? 1 : 0.45}
                  style={{ transition: "fill-opacity 150ms ease" }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <ul className="mt-1 space-y-3.5">
        {rows.map((row) => {
          const percent = total ? Math.round((row.value / total) * 100) : 0;
          return (
            <li
              key={row.key}
              className="flex items-center gap-3"
              onMouseEnter={() => setActiveKey(row.key)}
              onMouseLeave={() => setActiveKey(null)}
            >
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
