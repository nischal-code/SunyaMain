import Table from "../common/Table";
import Pagination from "../common/Pagination";
import Badge from "../common/Badge";
import ActivityLogTimeline from "./ActivityLogTimeline";
import { getModuleBadgeVariant, formatActionLabel, formatLogTimestamp } from "./ActivityLogItem";

const COLUMNS = [
  {
    key: "timestamp",
    header: "Timestamp",
    render: (row) => formatLogTimestamp(row.timestamp),
  },
  {
    key: "user",
    header: "User",
    render: (row) => (
      <div>
        <p className="font-medium text-gray-900">{row.user?.name || "Unknown user"}</p>
        <p className="text-xs text-gray-400">{row.user?.email || ""}</p>
      </div>
    ),
  },
  {
    key: "module",
    header: "Module",
    render: (row) => <Badge variant={getModuleBadgeVariant(row.module)}>{row.module}</Badge>,
  },
  {
    key: "action",
    header: "Action",
    render: (row) => formatActionLabel(row.action),
  },
  {
    key: "resourceId",
    header: "Resource ID",
    render: (row) => (
      <span className="block max-w-[180px] truncate text-gray-500" title={row.resourceId || ""}>
        {row.resourceId || "—"}
      </span>
    ),
  },
  {
    key: "ipAddress",
    header: "IP Address",
    render: (row) => row.ipAddress || "—",
  },
];

/**
 * ActivityLogList
 * Renders a page of activity logs as either a table (default) or a
 * chronological timeline. Purely presentational — fetching, filtering, and
 * pagination state all live in the parent (ActivityLogPage); this
 * component just renders what it's given.
 *
 * Props:
 *  - logs:            object[] — required, the current page of logs to render
 *  - view:             "table" | "timeline" — default "table"
 *  - isLoading:        bool — shows a loading/skeleton state
 *  - error:            string — when set, an error state replaces the list
 *  - currentPage / totalPages / onPageChange — pagination controls
 *  - emptyMessage:     string — default "No activity logs found"
 */
const ActivityLogList = ({
  logs = [],
  view = "table",
  isLoading = false,
  error = "",
  currentPage,
  totalPages,
  onPageChange,
  emptyMessage = "No activity logs found",
}) => {
  if (error) {
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-10 text-center text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (view === "timeline") {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <ActivityLogTimeline logs={logs} isLoading={isLoading} emptyMessage={emptyMessage} />
        </div>
        {currentPage && totalPages > 1 && (
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Table
        columns={COLUMNS}
        data={logs}
        isLoading={isLoading}
        emptyMessage={emptyMessage}
        keyExtractor={(row, index) => row._id ?? index}
      />

      {currentPage && totalPages > 1 && (
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
      )}
    </div>
  );
};

export default ActivityLogList;