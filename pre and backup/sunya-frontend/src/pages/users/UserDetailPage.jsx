import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import userApi from "../../api/user.api";
import Card from "../../components/common/Card";
import Loader from "../../components/common/Loader";
import Button from "../../components/common/Button";
import UserDetailPanel from "../../components/user/UserDetailPanel";
import UserEditForm from "../../components/user/UserEditForm";
import UserProfileForm from "../../components/user/UserProfileForm";
import ProfilePictureUploader from "../../components/user/ProfilePictureUploader";

const PRIVILEGED_MANAGE_ROLES = ["super_admin", "admin"];

/**
 * UserDetailPage
 * GET /users/:userId. Viewing your own profile shows the self-service
 * editors (UserProfileForm, ProfilePictureUploader); viewing someone
 * else's shows the admin-only role/active-status controls (UserEditForm)
 * when the current user is super_admin/admin.
 */
const UserDetailPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, refreshCurrentUser } = useAuth();

  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const isSelf = currentUser?._id === userId;
  const canManage = PRIVILEGED_MANAGE_ROLES.includes(currentUser?.role);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError("");

    userApi
      .getUserById(userId)
      .then((res) => {
        if (isMounted) setUser(res?.data?.data?.user ?? null);
      })
      .catch((err) => {
        if (isMounted) setError(err?.response?.data?.message || "Unable to load this user.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [userId]);

  const handleUpdated = (updatedUser) => {
    if (!updatedUser) return;
    setUser(updatedUser);
    if (isSelf) refreshCurrentUser?.();
  };

  if (isLoading) return <Loader fullScreen text="Loading user…" />;

  if (error || !user) {
    return (
      <Card>
        <p className="py-6 text-center text-sm text-red-600">{error || "User not found."}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
        ← Back
      </Button>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <UserDetailPanel user={user} className="lg:col-span-2" />

        <div className="space-y-6">
          {isSelf && (
            <Card title="Profile picture">
              <ProfilePictureUploader
                user={user}
                onSuccess={(profilePicture) => handleUpdated({ ...user, profilePicture })}
              />
            </Card>
          )}

          {isSelf && (
            <Card title="Edit my profile">
              <UserProfileForm user={user} onSuccess={handleUpdated} />
            </Card>
          )}

          {!isSelf && canManage && (
            <Card title="Manage account">
              <UserEditForm user={user} onUpdated={handleUpdated} />
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetailPage;
