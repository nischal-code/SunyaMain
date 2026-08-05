import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import UserCreateForm from "../../components/user/UserCreateForm";

const PRIVILEGED_VIEW_ROLES = ["super_admin", "admin", "manager"];
const PRIVILEGED_MANAGE_ROLES = ["super_admin", "admin"];

/**
 * UserCreatePage
 * Invites a new user (POST /auth/register under the hood — see the note
 * on UserCreateForm). The new account still needs to verify its email via
 * OTP before it can log in.
 */
const UserCreatePage = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [createdInfo, setCreatedInfo] = useState(null);
  const [formKey, setFormKey] = useState(0);

  const canAccess = PRIVILEGED_VIEW_ROLES.includes(currentUser?.role);
  const canAssignRole = PRIVILEGED_MANAGE_ROLES.includes(currentUser?.role);

  if (!canAccess) {
    return (
      <Card>
        <p className="py-6 text-center text-sm text-gray-500">
          You don't have permission to add new users.
        </p>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Add user</h1>
        <p className="mt-1 text-sm text-gray-500">
          Creates an account and sends an email verification OTP to the new user.
        </p>
      </div>

      <Card>
        {createdInfo ? (
          <div className="space-y-4 text-center">
            <p className="text-sm text-gray-700">
              Account created for <span className="font-medium">{createdInfo.email}</span>. They'll
              need to verify their email before logging in.
            </p>
            <div className="flex justify-center gap-3">
              <Button onClick={() => navigate(`/users/${createdInfo.userId}`)}>View user</Button>
              <Button
                variant="outline"
                onClick={() => {
                  setCreatedInfo(null);
                  setFormKey((k) => k + 1);
                }}
              >
                Add another
              </Button>
            </div>
          </div>
        ) : (
          <UserCreateForm key={formKey} canAssignRole={canAssignRole} onSuccess={setCreatedInfo} />
        )}
      </Card>

      {!createdInfo && (
        <p className="text-center text-sm text-gray-500">
          <Link to="/users" className="font-medium text-primary-600 hover:text-primary-700">
            Back to users
          </Link>
        </p>
      )}
    </div>
  );
};

export default UserCreatePage;
