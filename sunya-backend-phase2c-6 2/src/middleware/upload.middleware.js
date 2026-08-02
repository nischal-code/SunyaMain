import multer from "multer";
import { profilePictureStorage, taskFileStorage, projectFileStorage } from "../config/cloudinary.js";

const fileFilter = (_req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

export const uploadProfilePicture = multer({
  storage: profilePictureStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// Used for both task attachments (admin/manager) and deliverables (employee).
// Allowed formats are enforced by Cloudinary via taskFileStorage.
export const uploadTaskFiles = multer({
  storage: taskFileStorage,
  limits: { fileSize: 15 * 1024 * 1024, files: 5 }, // 15MB per file, max 5 files
});

// Used for both project reference files (admin/manager) and deliverables
// (project manager / team). Allowed formats enforced via projectFileStorage.
export const uploadProjectFiles = multer({
  storage: projectFileStorage,
  limits: { fileSize: 20 * 1024 * 1024, files: 10 }, // 20MB per file, max 10 files
});
