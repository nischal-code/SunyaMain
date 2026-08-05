import Pagination from "../common/Pagination";
import UserTableRow from "./UserTableRow";
import UserCard from "./UserCard";

const COLUMNS = ["User", "Role", "Department", "Designation", "Status", ""];

/**
 * UserList
 * Renders a page of users as either a table (default) or a card grid.
 * Purely presentational — fetching, filtering, and pagination state all
 * live in the parent (UsersPage); this component just renders what it's
 * given.
 *
 * Props:
 *  - users:            object[] — required, the current page of users to render
 *  - view:              "table" | "card" — default "table"
 *  - isLoading:         bool — shows a skeleton state
 *  - onView:            fn(user) — required, opens a user's detail
 *  - onToggleActive:    fn(user) — optional, activate/deactivate action
 *  - canManage:         bool — enables the toggle-active action, default false
 *  - togglingUserId:    string — id of a user whose toggle request is in flight
 *  - currentPage / totalPages / onPageChange — optional pagination controls
 *  - emptyMessage:      string — default "No users found"
 */
const UserList = ({
  users = [],
  view = "table",
  isLoading = false,
  onView,
  onToggleActive,
  canManage = false,
  togglingUserId,
  currentPage,
  totalPages,
  onPageChange,
  emptyMessage = "No users found",
}) => {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-14 w-full animate-pulse rounded-xl bg-gray-100" />
        ))}
      </div>
    );
  }

  if (!users.length) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white px-4 py-14 text-center text-sm text-gray-400">
        {emptyMessage}
      </div>
    );
  }

  if (view === "card") {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {users.map((user) => (
            <UserCard key={user._id} user={user} onClick={onView} />
          ))}
        </div>
        {currentPage && totalPages > 1 && (
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              {COLUMNS.map((col) => (
                <th
                  key={col}
                  scope="col"
                  className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {users.map((user) => (
              <UserTableRow
                key={user._id}
                user={user}
                onView={onView}
                onToggleActive={onToggleActive}
                canManage={canManage}
                isTogglingActive={togglingUserId === user._id}
              />
            ))}
          </tbody>
        </table>
      </div>

      {currentPage && totalPages > 1 && (
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
      )}
    </div>
  );
};

export default UserList;
