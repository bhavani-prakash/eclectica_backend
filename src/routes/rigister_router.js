import express from "express";
import {
  // 🔴 RAZORPAY DISABLED
  // createOrder,
  // verifyPayment,
  getRegistrations,
  getPermissionLetterPDF,
  getRegisteredEvents,
  manualRegistration
} from "../controllers/registration_controllers.js";
import { upload } from "../utils/multer.js";

const router = express.Router();

// Logging middleware
router.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// 🔴 RAZORPAY DISABLED - Using manual payment only
// router.post("/create-order", createOrder);
// router.post("/verify-payment", verifyPayment);
router.post("/manual-registration", upload.single('screenshot'), manualRegistration);
router.get("/register", getRegistrations);
router.post("/permission-letter-pdf", getPermissionLetterPDF);
router.post("/registered-events", getRegisteredEvents);

export default router;
