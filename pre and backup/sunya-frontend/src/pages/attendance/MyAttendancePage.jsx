import { useEffect, useState } from "react";
import * as attendanceApi from "../../api/attendance.api";
import ClockInOutWidget from "../../components/attendance/ClockInOutWidget";
import AttendanceSummaryCard from "../../components/attendance/AttendanceSummaryCard";
import AttendanceCalendar from "../../components/attendance/AttendanceCalendar";
import AttendanceTable from "../../components/attendance/AttendanceTable";
import AttendanceHistoryModal from "../../components/attendance/AttendanceHistoryModal";
import Tabs from "../../components/common/Tabs";
import Pagination from "../../components/common/Pagination";

const VIEW_TABS = [
  { id: "calendar", label: "Calendar" },
  { id: "table", label: "History" },
];

const now = new Date();

/**
 * MyAttendancePage
 * The authenticated user's own attendance: clock in/out, monthly summary
 * (GET /attendance/me/summary), and history as either a calendar
 * (GET /attendance/me) or a paginated table.
 */
const MyAttendancePage = () => {
  const [view, setView] = useState("calendar");
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSummaryLoading, setIsSummaryLoading] = useState(true);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedRecord, setSelectedRecord] = useState(undefined); // undefined = closed
  const isHistoryOpen = selectedRecord !== undefined;

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError("");

    attendanceApi
      .getMyAttendance({ month, year, page: view === "table" ? page : 1, limit: 31 })
      .then((res) => {
        if (!isMounted) return;
        const data = res?.data?.data;
        setRecords(data?.records ?? data?.attendance ?? []);
        setTotalPages(data?.pagination?.totalPages ?? 1);
      })
      .catch((err) => {
        if (isMounted) setError(err?.response?.data?.message || "Unable to load your attendance.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [month, year, page, view]);

  useEffect(() => {
    let isMounted = true;
    setIsSummaryLoading(true);

    attendanceApi
      .getMyAttendanceSummary({ month, year })
      .then((res) => {
        if (isMounted) setSummary(res?.data?.data ?? null);
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setIsSummaryLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [month, year]);

  const handleMonthChange = (nextMonth, nextYear) => {
    setMonth(nextMonth);
    setYear(nextYear);
    setPage(1);
  };

  const monthLabel = new Date(year, month - 1, 1).toLocaleDateString([], {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">My Attendance</h1>
        <p className="mt-1 text-sm text-gray-500">Clock in, track your hours, and review your history.</p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <ClockInOutWidget className="lg:col-span-1" />
        <AttendanceSummaryCard
          summary={summary}
          subtitle={monthLabel}
          isLoading={isSummaryLoading}
          className="lg:col-span-2"
        />
      </div>

      <div className="flex items-center justify-between">
        <Tabs tabs={VIEW_TABS} activeTab={view} onChange={setView} variant="pills" />
      </div>

      {view === "calendar" ? (
        <AttendanceCalendar
          month={month}
          year={year}
          records={records}
          isLoading={isLoading}
          onMonthChange={handleMonthChange}
          onDayClick={(dateKey, record) => setSelectedRecord(record)}
        />
      ) : (
        <div className="space-y-4">
          <AttendanceTable
            records={records}
            isLoading={isLoading}
            onRowClick={(record) => setSelectedRecord(record)}
            emptyMessage="No attendance recorded for this month yet"
          />
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      <AttendanceHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setSelectedRecord(undefined)}
        record={selectedRecord || null}
      />
    </div>
  );
};

export default MyAttendancePage;