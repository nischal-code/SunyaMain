import { useEffect, useMemo, useState } from "react";
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

const RADIUS = 62;
const STROKE = 18;
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

  let offsetSoFar = 0;

  return (
    <DashboardCard title={title} subtitle={`${total} total employees`} icon={cardIcon} className={className}>
      <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-center sm:justify-around">
        <div className="relative shrink-0">
          <svg viewBox="0 0 160 160" className="h-40 w-40 -rotate-90">
            <circle cx="80" cy="80" r={RADIUS} fill="none" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeWidth={STROKE} />
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
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              );
              offsetSoFar += dash + 3;
              return circle;
            })}
          </svg>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
              {presentPercent}%
            </span>
            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">present</span>
          </div>
        </div>

        <ul className="w-full max-w-[220px] space-y-3">
          {segments.map((seg) => (
            <li
              key={seg.key}
              className="flex items-center justify-between rounded-xl bg-slate-50 px-3.5 py-2.5 dark:bg-slate-800/60"
            >
              <span className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                <span className={`h-2.5 w-2.5 rounded-full ${seg.track}`} />
                {seg.label}
              </span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">{seg.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </DashboardCard>
  );
};

export default AttendanceOverviewChart;
