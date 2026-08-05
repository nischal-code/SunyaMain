import { useEffect, useMemo, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Sector, ResponsiveContainer } from "recharts";
import DashboardCard from "./DashboardCard";
import Loader from "../common/Loader";
import { CalendarIcon, InboxIcon, AlertTriangleIcon } from "./dashboardIcons";
import * as dashboardApi from "../../api/dashboard.api";

// Mirrors attendance.service.getDashboardStats: presentEmployees already
// folds in present/late/remote/half-day, so the three segments below sum
// exactly to totalEmployees.
const SEGMENTS = [
  { key: "present", label: "Present", color: "#10b981", track: "bg-emerald-500" }, // emerald-500
  { key: "onLeave", label: "On Leave", color: "#6366f1", track: "bg-primary-500" }, // primary-500
  { key: "absent", label: "Absent", color: "#f43f5e", track: "bg-rose-500" }, // rose-500
];

// Custom shape rendered for the hovered slice — slightly thicker + a hair
// larger outer radius so the segment "pops" toward the cursor.
const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - 2}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        cornerRadius={8}
      />
    </g>
  );
};

const ChartTooltip = ({ active, payload, total }) => {
  if (!active || !payload?.length) return null;
  const { name, value, payload: raw } = payload[0];
  const percent = total ? Math.round((value / total) * 100) : 0;
  return (
    <div className="rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-xs shadow-lg backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/95">
      <p className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-100">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: raw.color }} />
        {name}
      </p>
      <p className="mt-0.5 text-slate-500 dark:text-slate-400">
        {value} employee{value === 1 ? "" : "s"} · {percent}%
      </p>
    </div>
  );
};

/**
 * AttendanceOverviewChart
 * Donut chart summarizing today's org-wide attendance (present/late/on
 * leave/absent). Backed by GET /dashboard (super_admin/admin/manager only).
 * Rendered with Recharts: animates in on load, and each slice grows
 * slightly + shows a tooltip on hover.
 *
 * Props:
 *  - data:     { totalEmployees, presentEmployees, absentEmployees, onLeave, lateEmployees? }
 *              — optional. If omitted, the component fetches it itself via dashboard.api.js.
 *  - title:    string — default "Attendance Overview"
 *  - className: string
 */
const AttendanceOverviewChart = ({ data, title = "Attendance Overview", className = "" }) => {
  const [stats, setStats] = useState(data || null);
  const [isLoading, setIsLoading] = useState(!data);
  const [error, setError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(null);

  useEffect(() => {
    if (data) {
      setStats(data);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    dashboardApi
      .getOrgOverview()
      .then((res) => {
        if (isMounted) setStats(res?.data?.data ?? null);
      })
      .catch((err) => {
        if (isMounted) setError(err?.response?.data?.message || "Unable to load attendance overview");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [data]);

  const { segments, total, presentPercent } = useMemo(() => {
    const present = stats?.presentEmployees || 0;
    const absent = stats?.absentEmployees || 0;
    const onLeave = stats?.onLeave || 0;
    const totalCount = stats?.totalEmployees || present + absent + onLeave || 0;

    const values = { present, onLeave, absent };
    const computed = SEGMENTS.map((s) => ({ ...s, name: s.label, value: values[s.key] || 0 }));
    const pct = totalCount ? Math.round((present / totalCount) * 100) : 0;

    return { segments: computed, total: totalCount, presentPercent: pct };
  }, [stats]);

  const cardIcon = <CalendarIcon className="h-5 w-5" />;

  if (isLoading) {
    return (
      <DashboardCard title={title} icon={cardIcon} className={className}>
        <Loader text="Loading attendance…" />
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
          <p className="text-sm text-slate-400 dark:text-slate-500">No attendance data yet today.</p>
        </div>
      </DashboardCard>
    );
  }

  const chartData = segments.filter((seg) => seg.value > 0);

  return (
    <DashboardCard title={title} subtitle={`${total} total employees`} icon={cardIcon} className={className}>
      <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-center sm:justify-around">
        <div className="relative h-40 w-40 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={72}
                paddingAngle={3}
                cornerRadius={6}
                stroke="none"
                isAnimationActive
                animationDuration={800}
                animationEasing="ease-out"
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                {chartData.map((seg) => (
                  <Cell key={seg.key} fill={seg.color} className="cursor-pointer outline-none" />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip total={total} />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
              {presentPercent}%
            </span>
            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">present</span>
          </div>
        </div>

        <ul className="w-full max-w-[220px] space-y-3">
          {segments.map((seg) => {
            const dataIndex = chartData.findIndex((c) => c.key === seg.key);
            const isActive = activeIndex !== null && dataIndex === activeIndex;
            return (
              <li
                key={seg.key}
                onMouseEnter={() => dataIndex >= 0 && setActiveIndex(dataIndex)}
                onMouseLeave={() => setActiveIndex(null)}
                className={`flex cursor-default items-center justify-between rounded-xl px-3.5 py-2.5 transition-colors duration-150 ${
                  isActive ? "bg-slate-100 dark:bg-slate-800" : "bg-slate-50 dark:bg-slate-800/60"
                }`}
              >
                <span className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                  <span className={`h-2.5 w-2.5 rounded-full ${seg.track}`} />
                  {seg.label}
                </span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{seg.value}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </DashboardCard>
  );
};

export default AttendanceOverviewChart;
