import Avatar from "../common/Avatar";
import Badge from "../common/Badge";

const MODULE_VARIANTS = {
  auth: "primary",
  session: "info",
  user: "info",
  attendance: "success",
  settings: "warning",
  project: "primary",
  task: "primary",
  dashboard: "gray",
  notification: "info",
  activitylog: "gray",
  productivity: "success",
};

/**
 * Resolves a Badge variant for a given module string. Falls back to "gray"
 * for any module value not explicitly mapped above (modules are a free-text
 * field server-side, not a fixed enum).
 */
export const getModuleBadgeVariant = (module) => MODULE_VARIANTS[module?.toString().toLowerCase()] || "gray";

/**
 * Formats a raw action string (e.g. "TASK_CREATED") into a readable label
 * ("Task Created") without assuming any fixed set of action values.
 */
export const formatActionLabel = (action) =>
  action
    ? action
        .toString()
        .toLowerCase()
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase())
    : "Unknown";

export const formatLogTimestamp = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * ActivityLogItem
 * A single activity log entry, rendered as a timeline row. Purely
 * presentational — used by ActivityLogTimeline; fetching/pagination state
 * lives in the parent page.
 *
 * Props:
 *  - log: {
 *      _id, action, module, resourceId, ipAddress, userAgent, timestamp,
 *      user?: { _id, name, email, role }
 *    } — required
 *  - isLast: bool — hides the connecting line under the last item, default false
 */
const ActivityLogItem = ({ log, isLast = false }) => {
  return (
    <li className="relative flex gap-3 pb-6 last:pb-0">
      {!isLast && (
        <span
          aria-hidden="true"
          className="absolute left-[15px] top-9 bottom-0 w-px bg-gray-200"
        />
      )}

      <Avatar name={log.user?.name} size="sm" className="z-10" />

      <div className="min-w-0 flex-1 pt-0.5">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm text-gray-700">
            <span className="font-medium text-gray-900">{log.user?.name || "Unknown user"}</span>{" "}
            {formatActionLabel(log.action)}
          </p>
          <Badge variant={getModuleBadgeVariant(log.module)} size="sm">
            {log.module}
          </Badge>
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-400">
          <span>{formatLogTimestamp(log.timestamp)}</span>
          {log.resourceId && <span>Resource: {log.resourceId}</span>}
          {log.ipAddress && <span>{log.ipAddress}</span>}
        </div>
      </div>
    </li>
  );
};

export default ActivityLogItem;