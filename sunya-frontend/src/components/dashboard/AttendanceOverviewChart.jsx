import { useEffect, useMemo, useState } from "react";
import Card from "../common/Card";
import Loader from "../common/Loader";
import * as dashboardApi from "../../api/dashboard.api";

// Mirrors attendance.service.getDashboardStats: presentEmployees already
// folds in present/late/remote/half-day, so the three segments below sum
// exactly to totalEmployees.
const SEGMENTS = [
  { key: "present", label: "Present", color: "#22c55e" }, // green-500
  { key: "onLeave", label: "On Leave", color: "#6366f1" }, // primary-500
  { key: "absent", label: "Absent", color: "#ef4444" }, // red-500
];

const RADIUS = 60;
const STROKE = 22;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * AttendanceOverviewChart
 * Donut chart summarizing today's org-wide attendance (present/late/on
 * leave/absent). Backed by GET /dashboard (super_admin/admin/manager only).
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
    const computed = SEGMENTS.map((s) => ({ ...s, value: values[s.key] || 0 }));
    const pct = totalCount ? Math.round((present / totalCount) * 100) : 0;

    return { segments: computed, total: totalCount, presentPercent: pct };
  }, [stats]);

  if (isLoading) {
    return (
      <Card title={title} className={className}>
        <Loader text="Loading attendance…" />
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
        <p className="py-10 text-center text-sm text-gray-400">No attendance data yet today.</p>
      </Card>
    );
  }

  let offsetSoFar = 0;

  return (
    <Card title={title} subtitle={`${total} total employees`} className={className}>
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-around">
        <svg viewBox="0 0 160 160" className="h-40 w-40 shrink-0 -rotate-90">
          <circle cx="80" cy="80" r={RADIUS} fill="none" stroke="#f3f4f6" strokeWidth={STROKE} />
          {segments.map((seg) => {
            if (!seg.value) return null;
            const fraction = seg.value / total;
            const dash = fraction * CIRCUMFERENCE;
            const circle = (
              <circle
                key={seg.key}
                cx="80"
                cy="80"
                r={RADIUS}
                fill="none"
                stroke={seg.color}
                strokeWidth={STROKE}
                strokeDasharray={`${dash} ${CIRCUMFERENCE - dash}`}
                strokeDashoffset={-offsetSoFar}
                strokeLinecap="butt"
              />
            );
            offsetSoFar += dash;
            return circle;
          })}
          <text
            x="80"
            y="80"
            textAnchor="middle"
            dominantBaseline="middle"
            transform="rotate(90 80 80)"
            className="fill-gray-900 text-2xl font-semibold"
          >
            {presentPercent}%
          </text>
        </svg>

        <ul className="w-full max-w-[220px] space-y-2">
          {segments.map((seg) => (
            <li key={seg.key} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-gray-600">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: seg.color }} />
                {seg.label}
              </span>
              <span className="font-semibold text-gray-900">{seg.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
};

export default AttendanceOverviewChart;
