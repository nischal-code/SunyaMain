import { useEffect, useState } from "react";
import AttendanceCard from "./AttendanceCard";
import Button from "../common/Button";
import Spinner from "../common/Spinner";
import AttendanceStatusBadge from "./AttendanceStatusBadge";
import { ClockIcon } from "./attendanceIcons";
import * as attendanceApi from "../../api/attendance.api";

const formatTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const formatClock = (date) =>
  date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

const formatDay = (date) =>
  date.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });

/**
 * ClockInOutWidget
 * Self-service clock-in/clock-out card for the authenticated user's own
 * dashboard/attendance pages. Fetches today's record via
 * GET /attendance/me/today, then calls POST /attendance/clock-in or
 * /attendance/clock-out and refreshes in place.
 *
 * Props:
 *  - onChange:  fn(record) — optional, called whenever today's record changes
 *      (clock-in, clock-out, or the initial load) so a parent can refresh
 *      other widgets (e.g. AttendanceSummaryCard) in sync.
 *  - className: string
 */
const ClockInOutWidget = ({ onChange, className = "" }) => {
  const [now, setNow] = useState(new Date());
  const [today, setToday] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  const loadToday = () => {
    setIsLoading(true);
    setError("");
    return attendanceApi
      .getMyTodayAttendance()
      .then((res) => {
        const record = res?.data?.data?.attendance ?? null;
        setToday(record);
        onChange?.(record);
      })
      .catch((err) => {
        setError(err?.response?.data?.message || "Unable to load today's attendance.");
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    let isMounted = true;
    loadToday().catch(() => { });
    return () => {
      isMounted = false;
      void isMounted;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClockIn = async () => {
    setActionLoading(true);
    setError("");
    try {
      const res = await attendanceApi.clockIn();
      const record = res?.data?.data?.attendance ?? null;
      setToday(record);
      onChange?.(record);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to clock in right now.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleClockOut = async () => {
    setActionLoading(true);
    setError("");
    try {
      const res = await attendanceApi.clockOut();
      const record = res?.data?.data?.attendance ?? null;
      setToday(record);
      onChange?.(record);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to clock out right now.");
    } finally {
      setActionLoading(false);
    }
  };

  const hasClockedIn = Boolean(today?.checkIn);
  const hasClockedOut = Boolean(today?.checkOut);

  return (
    <AttendanceCard className={className} bodyClassName="relative">
      {/* Soft radial accent, purely decorative — mirrors the dashboard's
          SummaryStatsCard glow treatment */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-8 -top-12 h-32 w-32 rounded-full bg-gradient-to-br from-primary-500/10 to-transparent blur-2xl"
      />

      <div className="relative flex flex-col items-center gap-4 py-1 text-center">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
          <ClockIcon className="h-5 w-5" />
        </span>

        <div>
          <p className="text-3xl font-semibold tabular-nums tracking-tight text-slate-900 dark:text-slate-50">
            {formatClock(now)}
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{formatDay(now)}</p>
        </div>

        {isLoading ? (
          <Spinner size="md" />
        ) : (
          <>
            {today?.status && <AttendanceStatusBadge status={today.status} />}

            <div className="flex items-center gap-6 text-sm">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                  Check In
                </p>
                <p className="mt-0.5 font-semibold text-slate-900 dark:text-slate-100">
                  {formatTime(today?.checkIn)}
                </p>
              </div>
              <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                  Check Out
                </p>
                <p className="mt-0.5 font-semibold text-slate-900 dark:text-slate-100">
                  {formatTime(today?.checkOut)}
                </p>
              </div>
            </div>

            {error && (
              <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
            )}

            {!hasClockedIn && (
              <Button onClick={handleClockIn} isLoading={actionLoading} fullWidth>
                Clock In
              </Button>
            )}
            {hasClockedIn && !hasClockedOut && (
              <Button variant="danger" onClick={handleClockOut} isLoading={actionLoading} fullWidth>
                Clock Out
              </Button>
            )}
            {hasClockedIn && hasClockedOut && (
              <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                You&apos;ve completed today&apos;s attendance. See you tomorrow!
              </p>
            )}
          </>
        )}
      </div>
    </AttendanceCard>
  );
};

export default ClockInOutWidget;
