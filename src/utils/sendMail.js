import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.sendgrid.net",
  port: 587,
  secure: false,
  auth: {
    user: "apikey", // IMPORTANT: must be literally "apikey"
    pass: process.env.SENDGRID_API_KEY,
  },
});

export const sendConfirmationEmail = async (to, name, eventName) => {
  try {
    await transporter.sendMail({
      from: `"ECLECTICA 2K26 - Events" <bhavaniprakash960@gmail.com>`,
      to,
      subject: `Registration Confirmed – ${eventName}`,
      html: `
        <h2>Hello ${name} 👋</h2>
        <p>Your registration for <b>${eventName}</b> at ECLECTICA 2K26 has been confirmed! ✨</p>

        <p><b>📅 Date:</b> March 13, 2026</p>
        <p><b>📍 Venue:</b> MITS - Lakshmi Block</p>
        <p><b>🎯 Registered Event:</b> ${eventName}</p>

        <br/>
        <p>Phone: +91 86884 97800</p>
        <p>Team ECLECTICA 2K26</p>
      `,
    });

    console.log("Email sent successfully");
  } catch (error) {
    console.error("Email sending failed:", error);
    throw error;
  }
};
