import { useEffect, useMemo, useState } from "react";
import { RadialBarChart, RadialBar, PolarAngleAxis, Tooltip, BarChart, Bar, XAxis, YAxis, Cell, ResponsiveContainer } from "recharts";
import DashboardCard from "../dashboard/DashboardCard";
import Loader from "../common/Loader";
import * as productivityApi from "../../api/productivity.api";

const scoreColor = (score) => {
  if (score >= 80) return "#22c55e"; // emerald-500
  if (score >= 50) return "#6366f1"; // primary-500
  return "#f59e0b"; // amber-500
};

const BREAKDOWN_CONFIG = [
  { key: "onTimeRate", label: "On-Time Rate", color: "#10b981", bar: "bg-emerald-500" },
  { key: "attendanceRate", label: "Attendance", color: "#6366f1", bar: "bg-primary-500" },
  { key: "taskCompletionRate", label: "Task Completion", color: "#3b82f6", bar: "bg-blue-500" },
];

const GaugeTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-xs shadow-lg backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/95">
      <p className="font-semibold text-slate-800 dark:text-slate-100">Overall score</p>
      <p className="mt-0.5 text-slate-500 dark:text-slate-400">{payload[0].value}/100</p>
    </div>
  );
};

const BreakdownTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <div className="rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-xs shadow-lg backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/95">
      <p className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-100">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: row.color }} />
        {row.label}
      </p>
      <p className="mt-0.5 text-slate-500 dark:text-slate-400">{row.value}%</p>
    </div>
  );
};

/**
 * ProductivityChart
 * Donut/radial gauge for a single employee's overall productivity score,
 * with a breakdown of the metrics that feed it (on-time rate, attendance,
 * task-completion rate). Backed by GET /productivity/employee (self) or
 * GET /productivity/employee/:userId (admin/manager viewing someone else).
 * Both the gauge and the breakdown bars are Recharts components that
 * animate in on load and show a tooltip on hover.
 *
 * Props:
 *  - data:      { score, onTimeRate, attendanceRate, taskCompletionRate } — optional.
 *               If omitted, the component fetches it itself via productivity.api.js.
 *  - userId:    string — optional; when provided fetches that employee's
 *      data instead of the authenticated user's own (admin/manager only)
 *  - period:    "week" | "month" | "quarter" — default "month"
 *  - title:     string — default "Productivity"
 *  - className: string
 */
const ProductivityChart = ({ data, userId, period = "month", title = "Productivity", className = "" }) => {
  const [stats, setStats] = useState(data || null);
  const [isLoading, setIsLoading] = useState(!data);
  const [error, setError] = useState(null);
  const [activeKey, setActiveKey] = useState(null);

  useEffect(() => {
    if (data) {
      setStats(data);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    const request = userId
      ? productivityApi.getUserProductivity(userId, { period })
      : productivityApi.getMyProductivity({ period });

    request
      .then((res) => {
        if (isMounted) setStats(res?.data?.data ?? null);
      })
      .catch((err) => {
        if (isMounted) setError(err?.response?.data?.message || "Unable to load productivity data");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [data, userId, period]);

  const { score, color, breakdown, gaugeData } = useMemo(() => {
    const s = Math.min(100, Math.max(0, stats?.score || 0));
    const c = scoreColor(s);
    return {
      score: s,
      color: c,
      breakdown: BREAKDOWN_CONFIG.map((b) => ({ ...b, value: Math.round(stats?.[b.key] || 0) })),
      gaugeData: [{ name: "score", value: s, fill: c }],
    };
  }, [stats]);

  if (isLoading) {
    return (
      <DashboardCard title={title} className={className}>
        <Loader text="Loading productivity…" />
      </DashboardCard>
    );
  }

  if (error) {
    return (
      <DashboardCard title={title} className={className}>
        <p className="py-6 text-center text-sm text-rose-600">{error}</p>
      </DashboardCard>
    );
  }

  if (!stats) {
    return (
      <DashboardCard title={title} className={className}>
        <p className="py-10 text-center text-sm text-slate-400 dark:text-slate-500">
          No productivity data yet for this period.
        </p>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard title={title} subtitle="This period's overall score" className={className}>
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-around">
        <div className="relative h-36 w-36 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              innerRadius="72%"
              outerRadius="100%"
              data={gaugeData}
              startAngle={90}
              endAngle={-270}
              barSize={14}
            >
              <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
              <RadialBar
                background={{ fill: "#f1f5f9" }}
                dataKey="value"
                cornerRadius={7}
                isAnimationActive
                animationDuration={900}
                animationEasing="ease-out"
                className="cursor-pointer"
              />
              <Tooltip content={<GaugeTooltip />} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
              {score}
            </span>
          </div>
        </div>

        <div className="w-full max-w-[240px]">
          <div className="h-28 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={breakdown}
                layout="vertical"
                margin={{ top: 0, right: 12, bottom: 0, left: 0 }}
                barCategoryGap={8}
                onMouseLeave={() => setActiveKey(null)}
              >
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis
                  type="category"
                  dataKey="label"
                  width={92}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                />
                <Tooltip cursor={{ fill: "rgba(148,163,184,0.08)" }} content={<BreakdownTooltip />} />
                <Bar
                  dataKey="value"
                  radius={[5, 5, 5, 5]}
                  isAnimationActive
                  animationDuration={700}
                  animationEasing="ease-out"
                  onMouseEnter={(row) => setActiveKey(row.key)}
                  className="cursor-pointer"
                >
                  {breakdown.map((row) => (
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
        </div>
      </div>
    </DashboardCard>
  );
};

export default ProductivityChart;
