import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

// sanitize env vars (trim and remove trailing semicolons that sometimes appear)
const cloudName = (process.env.CLOUD_NAME || "").trim().replace(/;+$/g, "");
const apiKey = (process.env.CLOUD_API_KEY || "").trim().replace(/;+$/g, "");
const apiSecret = (process.env.CLOUD_API_SECRET || "").trim().replace(/;+$/g, "");

if (!cloudName || !apiKey || !apiSecret) {
  console.error("Cloudinary configuration missing. Please set CLOUD_NAME, CLOUD_API_KEY, CLOUD_API_SECRET in your .env");
  // throw to fail fast during startup with a clear message
  throw new Error("Missing Cloudinary credentials (CLOUD_NAME/CLOUD_API_KEY/CLOUD_API_SECRET)");
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

export default cloudinary;