import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { env } from "./env.js";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

// Storage engine used by multer for profile picture uploads.
// Falls back gracefully if Cloudinary credentials are not yet configured;
// the upload middleware will surface a clear error at request time instead
// of crashing the server at boot.
export const profilePictureStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "sunya/profile-pictures",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 500, height: 500, crop: "limit" }],
  },
});

// Storage engine for task attachments/deliverables. Uses resource_type "auto"
// since these can be images, PDFs, or office documents.
export const taskFileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "sunya/tasks",
    resource_type: "auto",
    allowed_formats: [
      "jpg",
      "jpeg",
      "png",
      "webp",
      "pdf",
      "doc",
      "docx",
      "xls",
      "xlsx",
      "ppt",
      "pptx",
      "zip",
      "txt",
    ],
  },
});

// Storage engine for project files/deliverables. Mirrors taskFileStorage but
// keeps project assets in their own Cloudinary folder.
export const projectFileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "sunya/projects",
    resource_type: "auto",
    allowed_formats: [
      "jpg",
      "jpeg",
      "png",
      "webp",
      "pdf",
      "doc",
      "docx",
      "xls",
      "xlsx",
      "ppt",
      "pptx",
      "zip",
      "txt",
    ],
  },
});

export default cloudinary;
