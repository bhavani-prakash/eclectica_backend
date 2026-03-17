import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary.js"; // ⚠️ must include .js

const SUPPORTED_IMAGE_FORMATS = ["jpg", "jpeg", "png", "webp", "heic", "heif"];
const MAX_UPLOAD_SIZE_BYTES = 12 * 1024 * 1024; // 12 MB

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "uploads",
    allowed_formats: SUPPORTED_IMAGE_FORMATS,
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_UPLOAD_SIZE_BYTES,
  },
  fileFilter: (req, file, cb) => {
    const extension = file.originalname.includes(".")
      ? file.originalname.split(".").pop().toLowerCase()
      : "";
    const mimetype = (file.mimetype || "").toLowerCase();

    const isImageMime = mimetype.startsWith("image/");
    const isSupportedExtension = extension ? SUPPORTED_IMAGE_FORMATS.includes(extension) : false;

    if (isImageMime || isSupportedExtension) {
      cb(null, true);
      return;
    }

    const error = new Error("Only image files are allowed for payment screenshot upload.");
    error.status = 400;
    cb(error);
  },
});

export { upload };
export default upload;
