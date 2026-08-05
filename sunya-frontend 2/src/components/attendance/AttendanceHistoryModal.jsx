import Modal from "../common/Modal";
import Avatar from "../common/Avatar";
import Button from "../common/Button";
import AttendanceStatusBadge from "./AttendanceStatusBadge";

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric", year: "numeric" });
};

const formatTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

/**
 * AttendanceHistoryModal
 * Read-only detail view of a single attendance record — check-in/out
 * times, working hours, status, and remarks. Opened from AttendanceTable
 * or AttendanceCalendar's onDayClick/onRowClick.
 *
 * Props:
 *  - isOpen:   bool — required
 *  - onClose:  fn — required
 *  - record:   { user?, date, checkIn, checkOut, workingHours, status,
 *      remarks, isManualEntry } — the record to display; null renders
 *      a "no record" empty state (e.g. a calendar day with nothing logged)
 *  - onEdit:   fn(record) — optional, shows an "Edit entry" action (admin/manager)
 */
const AttendanceHistoryModal = ({ isOpen, onClose, record, onEdit }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={record ? formatDate(record.date) : "Attendance"}
      size="sm"
      footer={
        record &&
        onEdit && (
          <Button
            variant="outline"
            onClick={() => {
              onEdit(record);
              onClose?.();
            }}
          >
            Edit entry
          </Button>
        )
      }
    >
      {!record && (
        <p className="py-6 text-center text-slate-400">No attendance recorded for this day.</p>
      )}

      {record && (
        <div className="space-y-4">
          {record.user && (
            <div className="flex items-center gap-3">
              <Avatar src={record.user.profilePicture} name={record.user.name} size="md" />
              <div>
                <p className="font-medium text-slate-900">{record.user.name}</p>
                <p className="text-xs text-slate-400">{record.user.department}</p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <AttendanceStatusBadge status={record.status} />
            {record.isManualEntry && (
              <span className="text-xs font-medium text-slate-400">Manual entry</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/60 p-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Check In</p>
              <p className="mt-0.5 font-semibold text-slate-900">{formatTime(record.checkIn)}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Check Out</p>
              <p className="mt-0.5 font-semibold text-slate-900">{formatTime(record.checkOut)}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Working Hours</p>
              <p className="mt-0.5 font-semibold text-slate-900">
                {record.workingHours !== undefined ? `${Number(record.workingHours).toFixed(1)}h` : "—"}
              </p>
            </div>
          </div>

          {record.remarks && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Remarks</p>
              <p className="mt-1 text-sm text-slate-600">{record.remarks}</p>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default AttendanceHistoryModal;
