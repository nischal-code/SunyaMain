import ActivityLogItem from "./ActivityLogItem";

const formatGroupLabel = (dateKey) => {
  const date = new Date(dateKey);
  if (Number.isNaN(date.getTime())) return dateKey;
  return date.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric", year: "numeric" });
};

const groupByDay = (logs) => {
  const groups = new Map();

  logs.forEach((log) => {
    const date = log.timestamp ? new Date(log.timestamp) : null;
    const key = date && !Number.isNaN(date.getTime()) ? date.toISOString().slice(0, 10) : "unknown";

    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(log);
  });

  return Array.from(groups.entries());
};

/**
 * ActivityLogTimeline
 * Chronological, day-grouped timeline view of activity logs. Purely
 * presentational — fetching, filtering, and pagination state all live in
 * the parent (ActivityLogPage); this component just renders what it's
 * given.
 *
 * Props:
 *  - logs:        object[] — required, the current page of logs to render
 *  - isLoading:   bool — shows a skeleton state
 *  - emptyMessage: string — default "No activity logs found"
 */
const ActivityLogTimeline = ({ logs = [], isLoading = false, emptyMessage = "No activity logs found" }) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex gap-3">
            <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-gray-100" />
            <div className="flex-1 space-y-2 pt-1">
              <div className="h-3.5 w-2/3 max-w-xs animate-pulse rounded bg-gray-100" />
              <div className="h-3 w-1/3 max-w-[160px] animate-pulse rounded bg-gray-100" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!logs.length) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white px-4 py-14 text-center text-sm text-gray-400">
        {emptyMessage}
      </div>
    );
  }

  const groups = groupByDay(logs);

  return (
    <div className="space-y-6">
      {groups.map(([dateKey, groupLogs]) => (
        <div key={dateKey}>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
            {formatGroupLabel(dateKey)}
          </p>
          <ul>
            {groupLogs.map((log, index) => (
              <ActivityLogItem key={log._id ?? index} log={log} isLast={index === groupLogs.length - 1} />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default ActivityLogTimeline;