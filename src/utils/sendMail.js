import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendConfirmationEmail = async (to, name, eventName) => {
  try {
    await resend.emails.send({
      from: "ECLECTICA 2K26 Events <onboarding@resend.dev>",
      to: to,
      subject: `Registration Confirmed – ${eventName}`,
      html: `
        <h2>Hello ${name} 👋</h2>
        <p>We’re excited to tell you that your registration for <b>${eventName}</b> at <b>ECLECTICA 2k26</b> has been successfully confirmed! ✨</p>
        <p>You’re officially part of something unforgettable.</p>
        <br/>

        <p>📍 <b>Event:</b> ECLECTICA 2k26 – Department Fest</p>
        <p>📅 <b>Date:</b> March 13, 2026</p>
        <p>📌 <b>Venue:</b> College Campus MITS – Lakshmi Block</p>
        <p>🎯 <b>Registered Event:</b> ${eventName}</p>

        <br/>
        <p>If you have any questions or need help, feel free to reach out to us anytime. We’re always happy to help 😊</p>
        <p><b>Phone:</b> +91 86884 97800</p>

        <br/>
        <p>FROM — Team <b>ECLECTICA 2K26</b></p>
      `,
    });

    console.log("Confirmation email sent to:", to);
  } catch (error) {
    console.error("Resend email error:", error);
  }
};
