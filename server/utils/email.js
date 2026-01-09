// ✅ Pehle line mein require karo
const nodemailer = require("nodemailer");

const sendEmail = async ({ email, subject, html, name }) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      secure: false,
      auth: {
        user: "98bd43002@smtp-brevo.com",
        pass: "mChZyHtTVJRXvEYK",
      },
    });

    const mailOptions = {
      from: `"S.Tatsaya Spa" <raj117557@gmail.com>`,
      to: email,
      subject: subject,
      html: html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent to:", email);
    return info;
  } catch (error) {
    console.error("❌ Failed to send email to", email, ":", error);
    throw error;
  }
};

module.exports = sendEmail;
