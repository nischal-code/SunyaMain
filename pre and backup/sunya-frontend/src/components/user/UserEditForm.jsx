import { useState } from "react";
import Select from "../common/Select";
import Button from "../common/Button";
import ConfirmDialog from "../common/ConfirmDialog";
import userApi from "../../api/user.api";

const ROLE_OPTIONS = [
  { value: "employee", label: "Employee" },
  { value: "manager", label: "Manager" },
  { value: "admin", label: "Admin" },
  { value: "super_admin", label: "Super Admin" },
];

/**
 * UserEditForm
 * Editing another user is limited to what the backend actually exposes:
 * PATCH /users/:userId/role and PATCH /users/:userId/toggle-active — both
 * restricted to super_admin/admin. There is no endpoint for editing another
 * user's name/phone/department/etc. (those are self-service only, via
 * UserProfileForm on /users/me).
 *
 * Props:
 *  - user:      object — required, the user being edited
 *  - onUpdated: fn(updatedUser) — called after a successful role change or
 *               active-status toggle
 */
const UserEditForm = ({ user, onUpdated }) => {
  const [role, setRole] = useState(user.role);
  const [isSavingRole, setIsSavingRole] = useState(false);
  const [isTogglingActive, setIsTogglingActive] = useState(false);
  const [error, setError] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleSaveRole = async () => {
    if (role === user.role) return;
    setError("");
    setIsSavingRole(true);
    try {
      const { data } = await userApi.updateUserRole(user._id, role);
      onUpdated?.(data?.data?.user);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to update this user's role.");
      setRole(user.role);
    } finally {
      setIsSavingRole(false);
    }
  };

  const handleToggleActive = async () => {
    setError("");
    setIsTogglingActive(true);
    try {
      const { data } = await userApi.toggleUserActiveStatus(user._id);
      onUpdated?.(data?.data?.user);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to update this user's status.");
    } finally {
      setIsTogglingActive(false);
      setIsConfirmOpen(false);
    }
  };

  return (
    <div className="space-y-5">
      {error && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      <div>
        <Select label="Role" options={ROLE_OPTIONS} value={role} onChange={(e) => setRole(e.target.value)} />
        <Button
          className="mt-3"
          size="sm"
          onClick={handleSaveRole}
          isLoading={isSavingRole}
          disabled={role === user.role || isSavingRole}
        >
          Save role
        </Button>
      </div>

      <div className="border-t border-gray-100 pt-4">
        <p className="mb-2 text-sm font-medium text-gray-700">Account status</p>
        <p className="mb-3 text-xs text-gray-500">
          {user.isActive
            ? "This user can currently log in and use the app."
            : "This user is deactivated and cannot log in."}
        </p>
        <Button
          variant={user.isActive ? "danger" : "primary"}
          size="sm"
          onClick={() => setIsConfirmOpen(true)}
          disabled={isTogglingActive}
        >
          {user.isActive ? "Deactivate user" : "Activate user"}
        </Button>
      </div>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        title={user.isActive ? "Deactivate this user?" : "Activate this user?"}
        message={
          user.isActive
            ? `${user.name} will immediately lose access to their account.`
            : `${user.name} will be able to log in again.`
        }
        confirmText={user.isActive ? "Deactivate" : "Activate"}
        variant={user.isActive ? "danger" : "primary"}
        isLoading={isTogglingActive}
        onConfirm={handleToggleActive}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
};

export default UserEditForm;
