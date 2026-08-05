import Avatar from "../common/Avatar";
import Button from "../common/Button";
import AttendanceStatusBadge from "./AttendanceStatusBadge";

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
};

const formatTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const formatHours = (hours) => {
  if (hours === undefined || hours === null) return "—";
  return `${Number(hours).toFixed(1)}h`;
};

const SkeletonRow = ({ columnCount }) => (
  <tr>
    {Array.from({ length: columnCount }).map((_, i) => (
      <td key={i} className="px-4 py-3.5">
        <div className="h-4 w-full max-w-[140px] animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
      </td>
    ))}
  </tr>
);

/**
 * AttendanceTable
 * Premium, self-contained table for attendance records (built locally
 * rather than on `components/common/Table` so it can carry full light/dark
 * styling, sticky header, and row hover states without changing that
 * shared primitive). Used by MyAttendancePage (own history, showUser=false)
 * and AttendancePage (org-wide, showUser=true). Fetching, filtering, and
 * pagination state all live in the parent page.
 *
 * Props:
 *  - records:     object[] — required. Each record: { _id, user?, date,
 *      checkIn, checkOut, workingHours, status, remarks, isManualEntry }
 *  - showUser:    bool — renders an Employee column, default false
 *  - isLoading:   bool
 *  - onRowClick:  fn(record) — optional, e.g. open AttendanceHistoryModal
 *  - onEdit:      fn(record) — optional, shows an Edit action (admin/manager)
 *  - emptyMessage: string — default "No attendance records found"
 */
const AttendanceTable = ({
  records = [],
  showUser = false,
  isLoading = false,
  onRowClick,
  onEdit,
  emptyMessage = "No attendance records found",
}) => {
  const columnCount = (showUser ? 1 : 0) + 5 + (onEdit ? 1 : 0);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white/90 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_30px_-16px_rgba(15,23,42,0.12)] backdrop-blur-sm dark:border-slate-800/80 dark:bg-slate-900/70 dark:shadow-none">
      <div className="max-h-[28rem] overflow-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
          <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur dark:bg-slate-900/95">
            <tr>
              {showUser && (
                <th
                  scope="col"
                  className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
                >
                  Employee
                </th>
              )}
              <th
                scope="col"
                className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                Date
              </th>
              <th
                scope="col"
                className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                Check In
              </th>
              <th
                scope="col"
                className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                Check Out
              </th>
              <th
                scope="col"
                className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                Hours
              </th>
              <th
                scope="col"
                className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                Status
              </th>
              <th
                scope="col"
                className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                Remarks
              </th>
              {onEdit && (
                <th scope="col" className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  <span className="sr-only">Actions</span>
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {isLoading &&
              Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={`skeleton-${i}`} columnCount={columnCount} />)}

            {!isLoading && records.length === 0 && (
              <tr>
                <td colSpan={columnCount} className="px-4 py-14 text-center text-sm text-slate-400 dark:text-slate-500">
                  {emptyMessage}
                </td>
              </tr>
            )}

            {!isLoading &&
              records.map((row, index) => (
                <tr
                  key={row._id ?? index}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={
                    onRowClick
                      ? "cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60"
                      : ""
                  }
                >
                  {showUser && (
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <Avatar src={row.user?.profilePicture} name={row.user?.name} size="sm" />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-slate-900 dark:text-slate-100">
                            {row.user?.name || "—"}
                          </p>
                          <p className="truncate text-xs text-slate-400 dark:text-slate-500">
                            {row.user?.department || ""}
                          </p>
                        </div>
                      </div>
                    </td>
                  )}
                  <td className="whitespace-nowrap px-4 py-3.5 text-slate-700 dark:text-slate-300">
                    {formatDate(row.date)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-slate-700 dark:text-slate-300">
                    {formatTime(row.checkIn)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-slate-700 dark:text-slate-300">
                    {formatTime(row.checkOut)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-slate-700 dark:text-slate-300">
                    {formatHours(row.workingHours)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5">
                    <AttendanceStatusBadge status={row.status} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5">
                    <span
                      className="block max-w-[220px] truncate text-slate-500 dark:text-slate-400"
                      title={row.remarks || ""}
                    >
                      {row.remarks || "—"}
                    </span>
                  </td>
                  {onEdit && (
                    <td className="whitespace-nowrap px-4 py-3.5 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(event) => {
                          event.stopPropagation();
                          onEdit(row);
                        }}
                      >
                        Edit
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceTable;
