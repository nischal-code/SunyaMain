import { useEffect, useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer } from "recharts";
import DashboardCard from "./DashboardCard";
import Loader from "../common/Loader";
import StatusPill from "../common/StatusPill";
import { FolderIcon, InboxIcon, AlertTriangleIcon } from "./dashboardIcons";
import * as dashboardApi from "../../api/dashboard.api";

const STATUS_COLORS = {
  planning: "#94a3b8",
  active: "#6366f1",
  on_hold: "#f59e0b",
  completed: "#10b981",
  cancelled: "#fb7185",
  default: "#6366f1",
};

const ChartTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <div className="max-w-[200px] rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-xs shadow-lg backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/95">
      <p className="truncate font-semibold text-slate-800 dark:text-slate-100">{row.name}</p>
      <p className="mt-0.5 text-slate-500 dark:text-slate-400">{row.value}% complete</p>
      {row.deadline && <p className="mt-0.5 text-slate-400 dark:text-slate-500">Due {row.deadline}</p>}
    </div>
  );
};

/**
 * ProjectOverviewChart
 * Per-project progress breakdown for the authenticated user's projects.
 * Backed by GET /dashboard/employee/assigned-projects (or /running-projects).
 * Rendered as a Recharts horizontal bar chart (progress %) colored by
 * status, with an animated fill and a hover tooltip, plus a compact list
 * underneath for status/deadline detail.
 *
 * Props:
 *  - projects:  array — optional list of { name/project, status, progress, deadline }.
 *               If omitted, the component fetches assigned projects itself.
 *  - source:    "assigned" | "running" — which dashboard.api.js endpoint to
 *               call when `projects` isn't supplied. Default "assigned".
 *  - title:     string — default "Project Overview"
 *  - limit:     number — how many rows to fetch/show. Default 5.
 *  - className: string
 */
const ProjectOverviewChart = ({
  projects,
  source = "assigned",
  title = "Project Overview",
  limit = 5,
  className = "",
}) => {
  const [rows, setRows] = useState(projects || null);
  const [isLoading, setIsLoading] = useState(!projects);
  const [error, setError] = useState(null);
  const [activeKey, setActiveKey] = useState(null);

  useEffect(() => {
    if (projects) {
      setRows(projects);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    const fetcher =
      source === "running" ? dashboardApi.getRunningProjects : dashboardApi.getAssignedProjects;

    fetcher({ page: 1, limit, sortBy: "deadline" })
      .then((res) => {
        if (isMounted) setRows(res?.data?.data?.projects ?? []);
      })
      .catch((err) => {
        if (isMounted) setError(err?.response?.data?.message || "Unable to load projects");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [projects, source, limit]);

  const chartRows = useMemo(() => {
    return (rows || []).map((project) => {
      const name = project.name || project.project?.name || "Untitled project";
      const key = project._id || project.project?._id || name;
      const status = project.status;
      const deadline = project.deadline ? new Date(project.deadline).toLocaleDateString() : null;
      return {
        key,
        name,
        status,
        value: project.progress ?? 0,
        deadline,
        color: STATUS_COLORS[status] || STATUS_COLORS.default,
        raw: project,
      };
    });
  }, [rows]);

  const cardIcon = <FolderIcon className="h-5 w-5" />;

  if (isLoading) {
    return (
      <DashboardCard title={title} icon={cardIcon} className={className}>
        <Loader text="Loading projects…" />
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

  if (!chartRows.length) {
    return (
      <DashboardCard title={title} icon={cardIcon} className={className}>
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <InboxIcon className="h-7 w-7 text-slate-300 dark:text-slate-600" />
          <p className="text-sm text-slate-400 dark:text-slate-500">No projects to show.</p>
        </div>
      </DashboardCard>
    );
  }

  const chartHeight = Math.max(140, chartRows.length * 40);

  return (
    <DashboardCard
      title={title}
      subtitle={`${chartRows.length} project${chartRows.length === 1 ? "" : "s"}`}
      icon={cardIcon}
      className={className}
    >
      <div style={{ height: chartHeight }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartRows}
            layout="vertical"
            margin={{ top: 0, right: 20, bottom: 0, left: 0 }}
            barCategoryGap={14}
            onMouseLeave={() => setActiveKey(null)}
          >
            <XAxis type="number" domain={[0, 100]} hide />
            <YAxis
              type="category"
              dataKey="name"
              width={110}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "#64748b" }}
              tickFormatter={(value) => (value.length > 14 ? `${value.slice(0, 13)}…` : value)}
            />
            <Tooltip cursor={{ fill: "rgba(148,163,184,0.08)" }} content={<ChartTooltip />} />
            <Bar
              dataKey="value"
              radius={[6, 6, 6, 6]}
              isAnimationActive
              animationDuration={750}
              animationEasing="ease-out"
              onMouseEnter={(row) => setActiveKey(row.key)}
              className="cursor-pointer"
              background={{ fill: "rgba(148,163,184,0.08)", radius: 6 }}
            >
              {chartRows.map((row) => (
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

      <ul className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
        {chartRows.map((row) => (
          <li
            key={row.key}
            className="flex items-center justify-between gap-2 py-2.5 first:pt-0 last:pb-0"
            onMouseEnter={() => setActiveKey(row.key)}
            onMouseLeave={() => setActiveKey(null)}
          >
            <span className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">{row.name}</span>
            <div className="flex shrink-0 items-center gap-2">
              {row.status && <StatusPill status={row.status} />}
              {row.deadline && (
                <span className="text-xs text-slate-400 dark:text-slate-500">Due {row.deadline}</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </DashboardCard>
  );
};

export default ProjectOverviewChart;
