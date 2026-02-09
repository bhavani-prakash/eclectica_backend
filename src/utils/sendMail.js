import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export const sendConfirmationEmail = async (to, name, eventName) => {
    const mailOptions = {
        from: `"ECLECTICA 2K26- Events" <${process.env.EMAIL_USER}>`,
        to,
        subject: `Registration Confirmed – ${eventName}`,
        html: `
      <h2>Hello ${name} 👋</h2>
      <p>We’re excited to tell you that your registration for <b>${eventName}</b>  at ECLECTICA 2k26 has been successfully confirmed! ✨</p>
      <p> You’re officially part of something unforgettable.</p>
      <br/>
          <p>  📍 Event: <b>ECLECTICA 2k26</b> – Department Fest <p>
          <p>  📅 Date: March 13, 2026</>
          <p>  📌 Venue: College Campus MITS -Lakshmi Block</p>
          <p>  🎯 Registered Event: <b>${eventName}</b></p>
      </pre>
      <p> If you have any questions or need help, feel free to reach out to us anytime. We’re always happy to help 😊 </p>
      <p> <b>Phone :</b> +91 86884 97800 </p><br />

      <p> FROM —  Team <b>ECLECTICA 2K26 </b></p>
    `
    };

    await transporter.sendMail(mailOptions);
};
