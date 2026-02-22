import Registration from "../models/registration_model.js";
import { sendConfirmationEmail } from '../utils/sendMail.js';

// POST /api/register
export const createRegistration = async (req, res) => {
  try {
    console.log("BODY:", req.body); // 🔥 DEBUG LINE
    console.log("FILE:", req.file);

    const registration = await Registration.create({
      ...req.body,
      paymentScreenshot: req.file ? req.file.path : null
    });



    // 2️⃣ Send confirmation email
    await sendConfirmationEmail(registration.email, registration.name, registration.event);

    res.status(201).json({
      success: true,
      data: registration,
    });
  } catch (error) {
    console.error("ERROR:", error);

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


// GET /api/register
export const getRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find();

    return res.status(200).json({
      success: true,
      count: registrations.length,
      data: registrations,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch registrations",
    });
  }
};
