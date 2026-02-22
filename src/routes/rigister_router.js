import express from "express";
import upload from "../utils/multer.js";
import {
  createRegistration,
} from "../controllers/registration_controllers.js";

const router = express.Router();

router.post("/register",upload.single("paymentScreenshot"), createRegistration);

export default router;
