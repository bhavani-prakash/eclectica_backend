import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary.js"; // ⚠️ must include .js

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "uploads",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

const upload = multer({ storage });

export { upload };
export default upload;