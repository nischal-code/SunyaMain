import { useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth";
import userApi from "../../api/user.api";
import * as attendanceApi from "../../api/attendance.api";

import AttendanceFilters from "../../components/attendance/AttendanceFilters";
import AttendanceTable from "../../components/attendance/AttendanceTable";
import AttendanceHistoryModal from "../../components/attendance/AttendanceHistoryModal";
import ManualAttendanceForm from "../../components/attendance/ManualAttendanceForm";
import AttendanceCard from "../../components/attendance/AttendanceCard";
import { CalendarIcon, AlertTriangleIcon, PlusIcon } from "../../components/attendance/attendanceIcons";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import Pagination from "../../components/common/Pagination";

const PRIVILEGED_VIEW_ROLES = ["super_admin", "admin", "manager"];

/**
 * AttendancePage
 * Org-wide attendance directory — GET /attendance (super_admin/admin/manager
 * only), with server-side filters and manual entry create/edit via
 * ManualAttendanceForm (POST /attendance/manual, PATCH /attendance/:id).
 */
const AttendancePage = () => {
  const { user: currentUser } = useAuth();
  const canView = PRIVILEGED_VIEW_ROLES.includes(currentUser?.role);

  const [records, setRecords] = useState([]);
  const [userOptions, setUserOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    department: "",
    startDate: "",
    endDate: "",
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedRecord, setSelectedRecord] = useState(undefined); // undefined = closed
  const isHistoryOpen = selectedRecord !== undefined;

  const [formState, setFormState] = useState(null); // null closed, {} create, record edit
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!canView) return;
    userApi
      .listUsers({})
      .then((res) => {
        const users = res?.data?.data?.users ?? [];
        setUserOptions(users.map((u) => ({ value: u._id, label: `${u.name} (${u.email})` })));
      })
      .catch(() => {});
  }, [canView]);

  useEffect(() => {
    if (!canView) return undefined;

    let isMounted = true;
    setIsLoading(true);
    setError("");

    attendanceApi
      .listAttendance({
        search: filters.search || undefined,
        status: filters.status || undefined,
        department: filters.department || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        page,
        limit: 10,
      })
      .then((res) => {
        if (!isMounted) return;
        const data = res?.data?.data;
        setRecords(data?.records ?? data?.attendance ?? []);
        setTotalPages(data?.pagination?.totalPages ?? 1);
      })
      .catch((err) => {
        if (isMounted) setError(err?.response?.data?.message || "Unable to load attendance records.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [canView, filters, page]);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  const handleFormSubmit = async (values) => {
    setIsSubmitting(true);
    setFormError("");
    try {
      if (formState?._id) {
        const { data } = await attendanceApi.updateAttendance(formState._id, values);
        const updated = data?.data;
        setRecords((prev) => prev.map((r) => (r._id === updated?._id ? updated : r)));
      } else {
        const { data } = await attendanceApi.createManualAttendance(values);
        const created = data?.data;
        if (created) setRecords((prev) => [created, ...prev]);
      }
      setFormState(null);
    } catch (err) {
      setFormError(err?.response?.data?.message || "Unable to save this attendance entry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canView) {
    return (
      <Card>
        <p className="py-6 text-center text-sm text-gray-500">
          You don't have permission to view the attendance directory.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
            <CalendarIcon className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
              Attendance
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Org-wide attendance records for your team.
            </p>
          </div>
        </div>
        <Button onClick={() => setFormState({})} leftIcon={<PlusIcon className="h-4 w-4" />}>
          Add manual entry
        </Button>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3.5 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400">
          <AlertTriangleIcon className="mt-0.5 h-5 w-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <AttendanceCard padding bodyClassName="!p-4">
        <AttendanceFilters
          filters={filters}
          onChange={setFilters}
          onReset={() =>
            setFilters({ search: "", status: "", department: "", startDate: "", endDate: "" })
          }
          showSearch
        />
      </AttendanceCard>

      <div className="space-y-4">
        <AttendanceTable
          records={records}
          showUser
          isLoading={isLoading}
          onRowClick={(record) => setSelectedRecord(record)}
          onEdit={(record) => setFormState(record)}
        />
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <AttendanceHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setSelectedRecord(undefined)}
        record={selectedRecord || null}
        onEdit={(record) => setFormState(record)}
      />

      <Modal
        isOpen={Boolean(formState)}
        onClose={() => setFormState(null)}
        title={formState?._id ? "Edit attendance entry" : "Add manual entry"}
        size="md"
      >
        <ManualAttendanceForm
          userOptions={userOptions}
          initialValues={formState || {}}
          onSubmit={handleFormSubmit}
          onCancel={() => setFormState(null)}
          isSubmitting={isSubmitting}
          serverError={formError}
        />
      </Modal>
    </div>
  );
};

export default AttendancePage;
