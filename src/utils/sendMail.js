import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendConfirmationEmail = async (to, name, eventName) => {
  const msg = {
    to: to,
    from: "bhavaniprakash960@gmail.com", // must be verified
    subject: `Registration Confirmed – ${eventName}`,
    html: `
      <h2>Hello ${name} </h2>
      <p>Your registration for <b>${eventName}</b> at ECLECTICA 2K26 has been confirmed! ✨</p>

      <p><b> Date:</b> March 13, 2026</p>
      <p><b>Venue:</b> MITS - Lakshmi Block</p>
      <p><b>Registered Event:</b> ${eventName}</p>

      <br/>
      <p>Phone: +91 86884 97800</p>
      <p>Team ECLECTICA 2K26</p>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Email sending failed:", error.response?.body || error);
    throw error;
  }
};
