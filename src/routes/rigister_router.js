import express from "express";
import {
  createOrder,
  verifyPayment,
  getRegistrations,
  getPermissionLetterPDF,
  getRegisteredEvents
} from "../controllers/registration_controllers.js";

const router = express.Router();



router.post("/create-order", createOrder);
router.post("/verify-payment", verifyPayment);
router.get("/register", getRegistrations);
router.post("/permission-letter-pdf", getPermissionLetterPDF);
router.post("/registered-events", getRegisteredEvents);

export default router;
