import { useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth";
import * as attendanceApi from "../../api/attendance.api";

import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import Table from "../../components/common/Table";
import AttendanceSummaryCard from "../../components/attendance/AttendanceSummaryCard";

const PRIVILEGED_VIEW_ROLES = ["super_admin", "admin", "manager"];

const toDateInput = (date) => date.toISOString().slice(0, 10);

const defaultRange = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(1);
  return { startDate: toDateInput(start), endDate: toDateInput(end) };
};

const DEPARTMENT_COLUMNS = [
  { key: "department", header: "Department" },
  { key: "presentDays", header: "Present", align: "right" },
  { key: "lateDays", header: "Late", align: "right" },
  { key: "absentDays", header: "Absent", align: "right" },
  { key: "onLeaveDays", header: "On Leave", align: "right" },
  {
    key: "averageWorkingHours",
    header: "Avg Hours",
    align: "right",
    render: (row) => (row.averageWorkingHours !== undefined ? `${Number(row.averageWorkingHours).toFixed(1)}h` : "—"),
  },
];

/**
 * AttendanceReportsPage
 * Date-ranged attendance report for admins/managers — GET /attendance/reports
 * for the aggregate + department breakdown, with a CSV export via
 * GET /attendance/reports/export.
 */
const AttendanceReportsPage = () => {
  const { user: currentUser } = useAuth();
  const canView = PRIVILEGED_VIEW_ROLES.includes(currentUser?.role);

  const [range, setRange] = useState(defaultRange());
  const [department, setDepartment] = useState("");
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState("");

  const loadReport = ({ signalMounted } = {}) => {
    if (!canView) return undefined;
    setIsLoading(true);
    setError("");

    return attendanceApi
      .getAttendanceReport({
        startDate: range.startDate,
        endDate: range.endDate,
        department: department || undefined,
      })
      .then((res) => {
        if (signalMounted && !signalMounted()) return;
        setReport(res?.data?.data ?? null);
      })
      .catch((err) => {
        if (signalMounted && !signalMounted()) return;
        setError(err?.response?.data?.message || "Unable to load the attendance report.");
      })
      .finally(() => {
        if (!signalMounted || signalMounted()) setIsLoading(false);
      });
  };

  useEffect(() => {
    let isMounted = true;
    loadReport({ signalMounted: () => isMounted });
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canView]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const res = await attendanceApi.exportAttendanceReport({
        startDate: range.startDate,
        endDate: range.endDate,
        department: department || undefined,
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `attendance-report-${range.startDate}-to-${range.endDate}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to export this report right now.");
    } finally {
      setIsExporting(false);
    }
  };

  if (!canView) {
    return (
      <Card>
        <p className="py-6 text-center text-sm text-gray-500">
          You don't have permission to view attendance reports.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Attendance Reports</h1>
          <p className="mt-1 text-sm text-gray-500">Org and department attendance for a date range.</p>
        </div>
        <Button variant="outline" onClick={handleExport} isLoading={isExporting}>
          Export CSV
        </Button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="flex flex-wrap items-end gap-3">
        <Input
          type="date"
          label="From"
          containerClassName="sm:w-44"
          value={range.startDate}
          onChange={(event) => setRange((prev) => ({ ...prev, startDate: event.target.value }))}
        />
        <Input
          type="date"
          label="To"
          containerClassName="sm:w-44"
          value={range.endDate}
          onChange={(event) => setRange((prev) => ({ ...prev, endDate: event.target.value }))}
        />
        <Input
          label="Department"
          placeholder="All departments"
          containerClassName="sm:w-52"
          value={department}
          onChange={(event) => setDepartment(event.target.value)}
        />
        <Button onClick={loadReport} isLoading={isLoading}>
          Run report
        </Button>
      </div>

      <AttendanceSummaryCard
        title="Overall"
        subtitle={`${range.startDate} to ${range.endDate}`}
        summary={report?.overall}
        isLoading={isLoading}
      />

      <Card title="By Department" padding={false}>
        <Table
          columns={DEPARTMENT_COLUMNS}
          data={report?.byDepartment ?? []}
          isLoading={isLoading}
          emptyMessage="No department breakdown available for this range"
          keyExtractor={(row, index) => row.department ?? index}
        />
      </Card>
    </div>
  );
};

export default AttendanceReportsPage;
