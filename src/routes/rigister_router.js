import express from "express";
import {
  createRegistration,
} from "../controllers/registration_controllers.js";

const router = express.Router();

router.post("/register", createRegistration);

export default router;
