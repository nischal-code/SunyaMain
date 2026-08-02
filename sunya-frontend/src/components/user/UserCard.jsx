import Card from "../common/Card";
import Avatar from "../common/Avatar";
import StatusPill from "../common/StatusPill";
import UserRoleBadge from "./UserRoleBadge";

/**
 * UserCard
 * Compact card representation of a user, used by UserList in "card" view
 * mode as an alternative to the table.
 *
 * Props:
 *  - user:    object — required (name, email, role, department, designation, isActive, profilePicture)
 *  - onClick: fn(user) — optional, makes the card clickable
 *  - className: string
 */
const UserCard = ({ user, onClick, className = "" }) => {
  return (
    <Card
      className={`transition-shadow ${onClick ? "cursor-pointer hover:shadow-md" : ""} ${className}`}
      padding
    >
      <div
        onClick={onClick ? () => onClick(user) : undefined}
        className="flex flex-col items-center text-center"
      >
        <Avatar src={user.profilePicture?.url} name={user.name} size="lg" />
        <p className="mt-3 truncate text-sm font-semibold text-gray-900">{user.name}</p>
        <p className="mt-0.5 truncate text-xs text-gray-500">{user.email}</p>

        <div className="mt-3 flex items-center gap-2">
          <UserRoleBadge role={user.role} size="sm" />
          <StatusPill status={user.isActive ? "active" : "inactive"} />
        </div>

        {(user.department || user.designation) && (
          <p className="mt-3 truncate text-xs text-gray-500">
            {[user.designation, user.department].filter(Boolean).join(" · ")}
          </p>
        )}
      </div>
    </Card>
  );
};

export default UserCard;
