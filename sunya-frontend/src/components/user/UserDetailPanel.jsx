import Card from "../common/Card";
import Avatar from "../common/Avatar";
import StatusPill from "../common/StatusPill";
import Badge from "../common/Badge";
import UserRoleBadge from "./UserRoleBadge";

const InfoRow = ({ label, value }) => (
  <div className="flex items-center justify-between gap-4 py-2.5 text-sm">
    <span className="text-gray-500">{label}</span>
    <span className="font-medium text-gray-900">{value ?? "—"}</span>
  </div>
);

/**
 * UserDetailPanel
 * Read-only profile summary for a single user — GET /users/:userId (or
 * GET /users/me). Presentational only; pair it with UserEditForm for the
 * role/active-status actions an admin can take.
 *
 * Props:
 *  - user:      object — required
 *  - className: string
 */
const UserDetailPanel = ({ user, className = "" }) => {
  return (
    <Card className={className}>
      <div className="flex flex-col items-center border-b border-gray-100 pb-6 text-center">
        <Avatar src={user.profilePicture?.url} name={user.name} size="xl" />
        <h2 className="mt-3 text-lg font-semibold text-gray-900">{user.name}</h2>
        <p className="text-sm text-gray-500">{user.email}</p>

        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          <UserRoleBadge role={user.role} />
          <StatusPill status={user.isActive ? "active" : "inactive"} />
          {user.isEmailVerified ? (
            <Badge variant="success" size="sm">
              Email verified
            </Badge>
          ) : (
            <Badge variant="warning" size="sm">
              Email unverified
            </Badge>
          )}
        </div>
      </div>

      <div className="divide-y divide-gray-50 pt-2">
        <InfoRow label="Phone" value={user.phone} />
        <InfoRow label="Department" value={user.department} />
        <InfoRow label="Designation" value={user.designation} />
        <InfoRow
          label="Joining date"
          value={user.joiningDate ? new Date(user.joiningDate).toLocaleDateString() : null}
        />
        <InfoRow
          label="Member since"
          value={user.createdAt ? new Date(user.createdAt).toLocaleDateString() : null}
        />
      </div>
    </Card>
  );
};

export default UserDetailPanel;
