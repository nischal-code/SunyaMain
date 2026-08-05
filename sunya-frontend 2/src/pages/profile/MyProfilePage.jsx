import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import Avatar from "../../components/common/Avatar";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import { getRoleLabel } from "../../utils/roleHelpers";
import { formatDate } from "../../utils/formatDate";

/**
 * MyProfilePage
 * Route: /profile
 * Read-only overview of the signed-in user's account, with links to the
 * dedicated edit / change-password / sessions screens.
 */
const MyProfilePage = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card>
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
          <Avatar src={user.profilePicture?.url || user.profilePicture} name={user.name} size="xl" />
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-gray-900">{user.name}</h1>
            <p className="text-sm text-gray-500">{user.email}</p>
            <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
              <Badge variant="primary">{getRoleLabel(user.role)}</Badge>
              {user.department && <Badge variant="gray">{user.department}</Badge>}
            </div>
          </div>
          <Link to="/profile/edit">
            <Button variant="outline" size="sm">
              Edit profile
            </Button>
          </Link>
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 text-sm font-semibold text-gray-900">Account details</h2>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">Phone</dt>
            <dd className="mt-1 text-sm text-gray-800">{user.phone || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">Designation</dt>
            <dd className="mt-1 text-sm text-gray-800">{user.designation || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">Department</dt>
            <dd className="mt-1 text-sm text-gray-800">{user.department || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">Joined</dt>
            <dd className="mt-1 text-sm text-gray-800">{formatDate(user.joiningDate)}</dd>
          </div>
        </dl>
      </Card>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-gray-900">Security</p>
            <p className="text-sm text-gray-500">Manage your password and active sessions.</p>
          </div>
          <div className="flex gap-2">
            <Link to="/profile/change-password">
              <Button variant="outline" size="sm">
                Change password
              </Button>
            </Link>
            <Link to="/profile/sessions">
              <Button variant="outline" size="sm">
                My sessions
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MyProfilePage;
