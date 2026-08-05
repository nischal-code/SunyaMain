import { useState } from "react";
import Avatar from "../common/Avatar";
import FileUpload from "../common/FileUpload";
import Button from "../common/Button";
import userApi from "../../api/user.api";

const MAX_SIZE_MB = 5; // matches the backend's multer limit for profile pictures

/**
 * ProfilePictureUploader
 * Lets the authenticated user replace their own profile picture —
 * PATCH /users/me/profile-picture (multipart). There's no equivalent
 * endpoint for uploading on another user's behalf, so this only makes
 * sense on the current user's own profile.
 *
 * Props:
 *  - user:      object — required, needs at least { name, profilePicture }
 *  - onSuccess: fn(profilePicture) — called with the new { url, publicId } after upload
 */
const ProfilePictureUploader = ({ user, onSuccess }) => {
  const [pendingFile, setPendingFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFilesSelected = (files) => {
    const file = files[0];
    if (!file) return;
    setPendingFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError("");
  };

  const handleUpload = async () => {
    if (!pendingFile) return;
    setIsUploading(true);
    setError("");
    try {
      const { data } = await userApi.updateProfilePicture(pendingFile);
      onSuccess?.(data?.data?.profilePicture);
      setPendingFile(null);
      setPreviewUrl(null);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to upload this image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setPendingFile(null);
    setPreviewUrl(null);
    setError("");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Avatar src={previewUrl || user?.profilePicture?.url} name={user?.name} size="xl" />
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-700">Profile picture</p>
          <p className="text-xs text-gray-400">JPG or PNG, up to {MAX_SIZE_MB}MB.</p>
        </div>
      </div>

      {!pendingFile && (
        <FileUpload
          accept="image/*"
          maxSizeMB={MAX_SIZE_MB}
          onFilesSelected={handleFilesSelected}
          helperText={`Up to ${MAX_SIZE_MB}MB`}
        />
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}

      {pendingFile && (
        <div className="flex items-center gap-3">
          <Button size="sm" onClick={handleUpload} isLoading={isUploading}>
            Save photo
          </Button>
          <Button size="sm" variant="outline" onClick={handleCancel} disabled={isUploading}>
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProfilePictureUploader;
