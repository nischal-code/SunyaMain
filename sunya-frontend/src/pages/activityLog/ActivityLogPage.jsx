import { useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth";
import activityLogApi from "../../api/activityLog.api";
import userApi from "../../api/user.api";
import ActivityLogFilters from "../../components/activityLog/ActivityLogFilters";
import ActivityLogList from "../../components/activityLog/ActivityLogList";
import Tabs from "../../components/common/Tabs";
import Card from "../../components/common/Card";

const VIEW_TABS = [
  { id: "table", label: "Table" },
  { id: "timeline", label: "Timeline" },
];

const PAGE_SIZE = 20;
const ALLOWED_ROLES = ["super_admin", "admin"];

/**
 * ActivityLogPage
 * Lists activity logs — GET /activity-logs (super_admin/admin only), with
 * server-side search, user/module/action/date-range filters, sorting, and
 * pagination.
 */
const ActivityLogPage = () => {
  const { user: currentUser } = useAuth();
  const canView = ALLOWED_ROLES.includes(currentUser?.role);

  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    user: "",
    module: "",
    action: "",
    from: "",
    to: "",
  });
  const [view, setView] = useState("table");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (!canView) return;

    let isMounted = true;

    userApi
      .listUsers()
      .then((res) => {
        if (isMounted) setUsers(res?.data?.data?.users ?? []);
      })
      .catch(() => {
        // The user filter is a convenience — if it fails to load, the rest
        // of the page (search, module/action/date filters) still works.
      });

    return () => {
      isMounted = false;
    };
  }, [canView]);

  useEffect(() => {
    if (!canView) return undefined;

    let isMounted = true;
    setIsLoading(true);
    setError("");

    activityLogApi
      .listActivityLogs({
        page,
        limit: PAGE_SIZE,
        search: filters.search || undefined,
        user: filters.user || undefined,
        module: filters.module || undefined,
        action: filters.action || undefined,
        from: filters.from || undefined,
        to: filters.to || undefined,
      })
      .then((res) => {
        if (!isMounted) return;
        const data = res?.data?.data;
        setLogs(data?.logs ?? []);
        setTotalPages(data?.pagination?.totalPages ?? 1);
        setTotal(data?.pagination?.total ?? data?.logs?.length ?? 0);
      })
      .catch((err) => {
        if (isMounted) setError(err?.response?.data?.message || "Unable to load activity logs.");
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

  if (!canView) {
    return (
      <Card>
        <p className="py-6 text-center text-sm text-gray-500">
          You don't have permission to view the activity log.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Activity Log</h1>
          <p className="mt-1 text-sm text-gray-500">
            {total} log{total === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <ActivityLogFilters
          filters={filters}
          onChange={setFilters}
          onReset={() =>
            setFilters({ search: "", user: "", module: "", action: "", from: "", to: "" })
          }
          users={users}
        />
        <Tabs tabs={VIEW_TABS} activeTab={view} onChange={setView} variant="pills" />
      </div>

      <ActivityLogList
        logs={logs}
        view={view}
        isLoading={isLoading}
        error={error}
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
};

export default ActivityLogPage;