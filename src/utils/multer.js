import multer from "multer";
import fs from "fs";
import path from "path";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary, { isCloudinaryConfigured } from "./cloudinary.js";

const SUPPORTED_IMAGE_FORMATS = ["jpg", "jpeg", "png", "webp", "heic", "heif", "jfif"];
const MAX_UPLOAD_SIZE_BYTES = 12 * 1024 * 1024; // 12 MB

const localUploadsPath = path.resolve(process.cwd(), "uploads");

const ensureLocalUploadsDirectory = () => {
  if (!fs.existsSync(localUploadsPath)) {
    fs.mkdirSync(localUploadsPath, { recursive: true });
  }
};

const cloudinaryStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "uploads",
    allowed_formats: SUPPORTED_IMAGE_FORMATS,
  },
});

const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    ensureLocalUploadsDirectory();
    cb(null, localUploadsPath);
  },
  filename: (req, file, cb) => {
    const extension = file.originalname.includes(".")
      ? file.originalname.split(".").pop().toLowerCase()
      : "jpg";
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${extension}`;
    cb(null, uniqueName);
  },
});

const storage = isCloudinaryConfigured ? cloudinaryStorage : diskStorage;

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
