import Table from "../common/Table";
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

/**
 * AttendanceTable
 * Presentational table of attendance records, built on the common Table
 * component. Used by MyAttendancePage (own history, showUser=false) and
 * AttendancePage (org-wide, showUser=true). Fetching, filtering, and
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
  const columns = [
    ...(showUser
      ? [
          {
            key: "user",
            header: "Employee",
            render: (row) => (
              <div className="flex items-center gap-2.5">
                <Avatar src={row.user?.profilePicture} name={row.user?.name} size="sm" />
                <div>
                  <p className="font-medium text-gray-900">{row.user?.name || "—"}</p>
                  <p className="text-xs text-gray-400">{row.user?.department || ""}</p>
                </div>
              </div>
            ),
          },
        ]
      : []),
    { key: "date", header: "Date", render: (row) => formatDate(row.date) },
    { key: "checkIn", header: "Check In", render: (row) => formatTime(row.checkIn) },
    { key: "checkOut", header: "Check Out", render: (row) => formatTime(row.checkOut) },
    { key: "workingHours", header: "Hours", render: (row) => formatHours(row.workingHours) },
    {
      key: "status",
      header: "Status",
      render: (row) => <AttendanceStatusBadge status={row.status} />,
    },
    {
      key: "remarks",
      header: "Remarks",
      render: (row) => (
        <span className="block max-w-[220px] truncate text-gray-500" title={row.remarks || ""}>
          {row.remarks || "—"}
        </span>
      ),
    },
    ...(onEdit
      ? [
          {
            key: "actions",
            header: "",
            align: "right",
            render: (row) => (
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
            ),
          },
        ]
      : []),
  ];

  return (
    <Table
      columns={columns}
      data={records}
      isLoading={isLoading}
      emptyMessage={emptyMessage}
      onRowClick={onRowClick}
      keyExtractor={(row, index) => row._id ?? index}
    />
  );
};

export default AttendanceTable;
