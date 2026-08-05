import Card from "../common/Card";

const STAT_CONFIG = [
  { key: "presentDays", label: "Present", color: "text-green-600" },
  { key: "lateDays", label: "Late", color: "text-amber-600" },
  { key: "absentDays", label: "Absent", color: "text-red-600" },
  { key: "onLeaveDays", label: "On Leave", color: "text-primary-600" },
];

/**
 * AttendanceSummaryCard
 * Compact stat grid summarizing a period's attendance — backed by
 * GET /attendance/me/summary (self) or an equivalent per-user summary
 * for admins/managers. Purely presentational; the parent fetches and
 * passes the summary object down.
 *
 * Props:
 *  - summary:   { presentDays, lateDays, absentDays, onLeaveDays,
 *      totalWorkingHours, averageWorkingHours } — optional
 *  - title:     string — default "Attendance Summary"
 *  - subtitle:  string — e.g. the month/year label
 *  - isLoading: bool
 *  - className: string
 */
const AttendanceSummaryCard = ({
  summary,
  title = "Attendance Summary",
  subtitle,
  isLoading = false,
  className = "",
}) => {
  return (
    <Card title={title} subtitle={subtitle} className={className}>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {STAT_CONFIG.map((stat) => (
          <div key={stat.key} className="text-center">
            {isLoading ? (
              <div className="mx-auto h-7 w-10 animate-pulse rounded bg-gray-100" />
            ) : (
              <p className={`text-2xl font-semibold ${stat.color}`}>{summary?.[stat.key] ?? 0}</p>
            )}
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-gray-400">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {!isLoading && (summary?.totalWorkingHours !== undefined || summary?.averageWorkingHours !== undefined) && (
        <div className="mt-5 flex items-center justify-center gap-8 border-t border-gray-100 pt-4 text-sm">
          {summary?.totalWorkingHours !== undefined && (
            <p className="text-gray-500">
              Total hours: <span className="font-semibold text-gray-900">{Number(summary.totalWorkingHours).toFixed(1)}h</span>
            </p>
          )}
          {summary?.averageWorkingHours !== undefined && (
            <p className="text-gray-500">
              Avg/day: <span className="font-semibold text-gray-900">{Number(summary.averageWorkingHours).toFixed(1)}h</span>
            </p>
          )}
        </div>
      )}
    </Card>
  );
};

export default AttendanceSummaryCard;
