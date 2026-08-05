import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import userApi from "../../api/user.api";
import UserFilters from "../../components/user/UserFilters";
import UserList from "../../components/user/UserList";
import Tabs from "../../components/common/Tabs";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";

const VIEW_TABS = [
  { id: "table", label: "Table" },
  { id: "card", label: "Cards" },
];

const PAGE_SIZE = 9;
const PRIVILEGED_VIEW_ROLES = ["super_admin", "admin", "manager"];
const PRIVILEGED_MANAGE_ROLES = ["super_admin", "admin"];

/**
 * UsersPage
 * Lists all users — GET /users (super_admin/admin/manager only), with
 * server-side department/role/isActive filters and client-side search +
 * pagination (the backend doesn't support search or pagination params on
 * this route).
 */
const UsersPage = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const canView = PRIVILEGED_VIEW_ROLES.includes(currentUser?.role);
  const canManage = PRIVILEGED_MANAGE_ROLES.includes(currentUser?.role);

  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ search: "", role: "", isActive: "", department: "" });
  const [view, setView] = useState("table");
  const [page, setPage] = useState(1);
  const [togglingUserId, setTogglingUserId] = useState(null);

  useEffect(() => {
    if (!canView) return undefined;

    let isMounted = true;
    setIsLoading(true);
    setError("");

    userApi
      .listUsers({
        department: filters.department || undefined,
        role: filters.role || undefined,
        isActive: filters.isActive || undefined,
      })
      .then((res) => {
        if (isMounted) setUsers(res?.data?.data?.users ?? []);
      })
      .catch((err) => {
        if (isMounted) setError(err?.response?.data?.message || "Unable to load users.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [canView, filters.department, filters.role, filters.isActive]);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  const filteredUsers = useMemo(() => {
    const term = filters.search.trim().toLowerCase();
    if (!term) return users;
    return users.filter(
      (u) => u.name?.toLowerCase().includes(term) || u.email?.toLowerCase().includes(term)
    );
  }, [users, filters.search]);

  const totalPages = Math.ceil(filteredUsers.length / PAGE_SIZE) || 1;
  const pageUsers = filteredUsers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleToggleActive = async (targetUser) => {
    setTogglingUserId(targetUser._id);
    try {
      const { data } = await userApi.toggleUserActiveStatus(targetUser._id);
      const updated = data?.data?.user;
      setUsers((prev) => prev.map((u) => (u._id === updated._id ? updated : u)));
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to update this user's status.");
    } finally {
      setTogglingUserId(null);
    }
  };

  if (!canView) {
    return (
      <Card>
        <p className="py-6 text-center text-sm text-gray-500">
          You don't have permission to view the user directory.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Users</h1>
          <p className="mt-1 text-sm text-gray-500">
            {filteredUsers.length} user{filteredUsers.length === 1 ? "" : "s"}
          </p>
        </div>
        {canManage && <Button onClick={() => navigate("/users/create")}>Add user</Button>}
      </div>

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <UserFilters
          filters={filters}
          onChange={setFilters}
          onReset={() => setFilters({ search: "", role: "", isActive: "", department: "" })}
        />
        <Tabs tabs={VIEW_TABS} activeTab={view} onChange={setView} variant="pills" />
      </div>

      <UserList
        users={pageUsers}
        view={view}
        isLoading={isLoading}
        onView={(u) => navigate(`/users/${u._id}`)}
        onToggleActive={handleToggleActive}
        canManage={canManage}
        togglingUserId={togglingUserId}
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
};

export default UsersPage;
