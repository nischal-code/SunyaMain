import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import Card from "../../components/common/Card";
import ProfilePictureUploader from "../../components/user/ProfilePictureUploader";
import UserProfileForm from "../../components/user/UserProfileForm";
import { useNotification } from "../../context/NotificationContext";

/**
 * EditProfilePage
 * Route: /profile/edit
 * PATCH /users/me (details) and PATCH /users/me/profile-picture (avatar),
 * via UserProfileForm and ProfilePictureUploader respectively.
 */
const EditProfilePage = () => {
  const { user, refreshCurrentUser } = useAuth();
  const { notify } = useNotification();
  const navigate = useNavigate();

  if (!user) return null;

  const handleProfileUpdated = async () => {
    await refreshCurrentUser();
    notify({ variant: "success", message: "Profile updated successfully." });
  };

  const handlePictureUpdated = async () => {
    await refreshCurrentUser();
    notify({ variant: "success", message: "Profile picture updated." });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card>
        <h2 className="mb-4 text-sm font-semibold text-gray-900">Profile picture</h2>
        <ProfilePictureUploader user={user} onSuccess={handlePictureUpdated} />
      </Card>

      <Card>
        <h2 className="mb-4 text-sm font-semibold text-gray-900">Profile details</h2>
        <UserProfileForm user={user} onSuccess={handleProfileUpdated} />
      </Card>

      <button
        type="button"
        onClick={() => navigate("/profile")}
        className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-700"
      >
        &larr; Back to profile
      </button>
    </div>
  );
};

export default EditProfilePage;
