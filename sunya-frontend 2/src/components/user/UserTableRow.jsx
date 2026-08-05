import Avatar from "../common/Avatar";
import StatusPill from "../common/StatusPill";
import Dropdown from "../common/Dropdown";
import UserRoleBadge from "./UserRoleBadge";

/**
 * UserTableRow
 * A single <tr> for the Users table. Rendered by UserList — not meant to
 * be used outside of a <table>/<tbody>.
 *
 * Props:
 *  - user:             object — required (name, email, role, department, designation, isActive, profilePicture)
 *  - onView:           fn(user) — required, row click / "View" action
 *  - onToggleActive:   fn(user) — optional, shown in the row menu when provided
 *  - canManage:        bool — show the toggle-active action, default false
 *  - isTogglingActive: bool — disables the toggle action while a request is in flight
 */
const UserTableRow = ({ user, onView, onToggleActive, canManage = false, isTogglingActive = false }) => {
  const menuItems = [
    { key: "view", label: "View details", onClick: () => onView?.(user) },
    ...(canManage
      ? [
          {
            key: "toggle-active",
            label: user.isActive ? "Deactivate" : "Activate",
            danger: user.isActive,
            disabled: isTogglingActive,
            onClick: () => onToggleActive?.(user),
          },
        ]
      : []),
  ];

  return (
    <tr onClick={() => onView?.(user)} className="cursor-pointer transition-colors hover:bg-gray-50">
      <td className="whitespace-nowrap px-4 py-3.5">
        <div className="flex items-center gap-3">
          <Avatar src={user.profilePicture?.url} name={user.name} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-gray-900">{user.name}</p>
            <p className="truncate text-xs text-gray-500">{user.email}</p>
          </div>
        </div>
      </td>
      <td className="whitespace-nowrap px-4 py-3.5">
        <UserRoleBadge role={user.role} size="sm" />
      </td>
      <td className="whitespace-nowrap px-4 py-3.5 text-gray-700">{user.department || "—"}</td>
      <td className="whitespace-nowrap px-4 py-3.5 text-gray-700">{user.designation || "—"}</td>
      <td className="whitespace-nowrap px-4 py-3.5">
        <StatusPill status={user.isActive ? "active" : "inactive"} />
      </td>
      <td className="whitespace-nowrap px-4 py-3.5 text-right" onClick={(event) => event.stopPropagation()}>
        <Dropdown
          align="right"
          trigger={
            <span className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 100-4 2 2 0 000 4zm0 6a2 2 0 100-4 2 2 0 000 4zm0 6a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
            </span>
          }
          items={menuItems}
        />
      </td>
    </tr>
  );
};

export default UserTableRow;
