import { useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth";
import userApi from "../../api/user.api";
import * as attendanceApi from "../../api/attendance.api";

import AttendanceFilters from "../../components/attendance/AttendanceFilters";
import AttendanceTable from "../../components/attendance/AttendanceTable";
import AttendanceHistoryModal from "../../components/attendance/AttendanceHistoryModal";
import ManualAttendanceForm from "../../components/attendance/ManualAttendanceForm";
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
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Attendance</h1>
          <p className="mt-1 text-sm text-gray-500">Org-wide attendance records for your team.</p>
        </div>
        <Button onClick={() => setFormState({})}>Add manual entry</Button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <AttendanceFilters
        filters={filters}
        onChange={setFilters}
        onReset={() =>
          setFilters({ search: "", status: "", department: "", startDate: "", endDate: "" })
        }
        showSearch
      />

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