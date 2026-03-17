import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

// sanitize env vars (trim and remove trailing semicolons that sometimes appear)
const sanitize = (value = "") => String(value).trim().replace(/;+$/g, "");

// Support both CLOUD_* and CLOUDINARY_* variable names to avoid deployment mismatches.
const cloudName = sanitize(process.env.CLOUD_NAME || process.env.CLOUDINARY_NAME);
const apiKey = sanitize(process.env.CLOUD_API_KEY || process.env.CLOUDINARY_API_KEY);
const apiSecret = sanitize(process.env.CLOUD_API_SECRET || process.env.CLOUDINARY_API_SECRET);
const isCloudinaryConfigured = Boolean(cloudName && apiKey && apiSecret);

if (!isCloudinaryConfigured) {
  console.warn(
    "Cloudinary configuration missing. Falling back to local upload storage. " +
      "Set CLOUD_NAME/CLOUD_API_KEY/CLOUD_API_SECRET or CLOUDINARY_NAME/CLOUDINARY_API_KEY/CLOUDINARY_API_SECRET to enable Cloudinary uploads."
  );
}

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
}

export { isCloudinaryConfigured };
export default cloudinary;