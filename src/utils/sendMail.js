import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";
import FailedEmail from "../models/failed_email_model.js";

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const ADMIN_EMAIL = "bhavaniprakash960@gmail.com"; // Admin email for notifications

export const sendConfirmationEmail = async (to, name, eventName, registrationData = {}) => {
  const msg = {
    to: to,
    from: "bhavaniprakash960@gmail.com", // must be verified
    subject: `Registration Confirmed – ${eventName}`,
    html: `
      <h2>Hello ${name} </h2>
      <p>Your registration for  <b>${eventName}</b>  at ECLECTICA 2K26 has been confirmed!</p>

      <p><b> Date:</b> March 13, 2026</p>
      <p><b>Venue:</b> MITS - Lakshmi Block</p>
      <p><b>Registered Event:</b> ${eventName}</p>

      <br/>
      <p> If you have any questions feel free to reach out to us at:</p>
      <p>Phone: +91 86884 97800</p><br>
      
      <p> Thank you for registering..</p>
      <p>Team ECLECTICA 2K26</p>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log("✅ Email sent successfully to:", to);
    return { success: true };
  } catch (error) {
    console.error("❌ Email sending failed for:", to, error.response?.body || error);
    
    // Log failed email for admin review
    try {
      const failedEmail = await FailedEmail.create({
        userEmail: to,
        userName: name,
        eventName: eventName,
        rollnumber: registrationData.rollnumber || null,
        errorMessage: error.response?.body?.errors?.[0]?.message || error.message,
        registrationId: registrationData._id || null
      });

      console.log("📧 Failed email logged for admin review:", failedEmail._id);

      // Send admin notification
      await sendAdminNotification(name, to, eventName, error.response?.body?.errors?.[0]?.message || error.message);
    } catch (logError) {
      console.error("Error logging failed email:", logError);
    }

    return { success: false, error: error.message };
  }
};

// Notify admin about failed emails
export const sendAdminNotification = async (userName, userEmail, eventName, errorMessage) => {
  const adminMsg = {
    to: ADMIN_EMAIL,
    from: "bhavaniprakash960@gmail.com",
    subject: `⚠️ Failed Confirmation Email - Manual Action Needed`,
    html: `
      <h2>Email Delivery Failed</h2>
      <p>A confirmation email failed to send. Please manually contact the user or resend the email.</p>
      
      <h3>User Details:</h3>
      <ul>
        <li><b>Name:</b> ${userName}</li>
        <li><b>Email:</b> ${userEmail}</li>
        <li><b>Event:</b> ${eventName}</li>
      </ul>
      
      <h3>Error Details:</h3>
      <p>${errorMessage}</p>
      
      <p>Check the Failed Emails section in your admin dashboard to resend confirmation emails.</p>
    `,
  };

  try {
    await sgMail.send(adminMsg);
    console.log("📧 Admin notification sent");
  } catch (adminError) {
    console.error("Failed to send admin notification:", adminError);
  }
};
