import { useEffect, useMemo, useState } from "react";
import Card from "../common/Card";
import Loader from "../common/Loader";
import * as productivityApi from "../../api/productivity.api";

const RADIUS = 60;
const STROKE = 14;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const scoreColor = (score) => {
  if (score >= 80) return "#22c55e"; // green-500
  if (score >= 50) return "#6366f1"; // primary-500
  return "#f59e0b"; // amber-500
};

const BREAKDOWN_CONFIG = [
  { key: "onTimeRate", label: "On-Time Rate", color: "bg-green-500" },
  { key: "attendanceRate", label: "Attendance", color: "bg-primary-500" },
  { key: "taskCompletionRate", label: "Task Completion", color: "bg-blue-500" },
];

/**
 * ProductivityChart
 * Donut gauge for a single employee's overall productivity score, with a
 * breakdown of the metrics that feed it (on-time rate, attendance,
 * task-completion rate). Backed by GET /productivity/employee (self) or
 * GET /productivity/employee/:userId (admin/manager viewing someone else).
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

  const { score, dash, color, breakdown } = useMemo(() => {
    const s = Math.min(100, Math.max(0, stats?.score || 0));
    return {
      score: s,
      dash: (s / 100) * CIRCUMFERENCE,
      color: scoreColor(s),
      breakdown: BREAKDOWN_CONFIG.map((b) => ({ ...b, value: Math.round(stats?.[b.key] || 0) })),
    };
  }, [stats]);

  if (isLoading) {
    return (
      <Card title={title} className={className}>
        <Loader text="Loading productivity…" />
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

  if (!stats) {
    return (
      <Card title={title} className={className}>
        <p className="py-10 text-center text-sm text-gray-400">No productivity data yet for this period.</p>
      </Card>
    );
  }

  return (
    <Card title={title} subtitle="This period's overall score" className={className}>
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-around">
        <svg viewBox="0 0 160 160" className="h-36 w-36 shrink-0 -rotate-90">
          <circle cx="80" cy="80" r={RADIUS} fill="none" stroke="#f3f4f6" strokeWidth={STROKE} />
          <circle
            cx="80"
            cy="80"
            r={RADIUS}
            fill="none"
            stroke={color}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${CIRCUMFERENCE - dash}`}
          />
          <text
            x="80"
            y="80"
            textAnchor="middle"
            dominantBaseline="middle"
            transform="rotate(90 80 80)"
            className="fill-gray-900 text-2xl font-semibold"
          >
            {score}
          </text>
        </svg>

        <ul className="w-full max-w-[240px] space-y-3">
          {breakdown.map((row) => (
            <li key={row.key}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-medium text-gray-600">{row.label}</span>
                <span className="text-gray-500">{row.value}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${row.color}`}
                  style={{ width: `${Math.min(100, row.value)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
};

export default ProductivityChart;
