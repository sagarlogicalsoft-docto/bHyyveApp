const nodemailer = require("nodemailer");

async function bhiveSendSmtpMail({
  to,
  subject,
  htmlBody,
  fromEmail,
  fromName,
  smtpUser,
  smtpPass,
}) {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // STARTTLS upgrade, jaise PHP code mein tha
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject,
      html: htmlBody,
    });

    return true;
  } catch (err) {
    console.error("SMTP Mail Error:", err.message);
    return false;
  }
}

module.exports = { bhiveSendSmtpMail };