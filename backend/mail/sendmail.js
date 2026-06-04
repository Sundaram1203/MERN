const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_FROM_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((err) => {
  if (err) {
    console.warn("⚠️  SMTP not ready (emails will be skipped):", err.message);
  } else {
    console.log("✅ SMTP Ready");
  }
});

const sendRegisterMail = async (data) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
        .container { background: #fff; border-radius: 8px; padding: 30px; max-width: 500px; margin: auto; }
        h2 { color: #1a1a2e; }
        table { border-collapse: collapse; width: 100%; margin-top: 16px; }
        td { border: 1px solid #ddd; padding: 10px 14px; }
        .otp { font-size: 28px; font-weight: bold; color: #e94560; letter-spacing: 6px; }
        .footer { margin-top: 20px; color: #888; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Welcome to User Module!</h2>
        <p>Dear <strong>${data.first_name} ${data.last_name}</strong>,</p>
        <p>Your registration has been completed successfully. Use the OTP below to verify your account:</p>
        <p class="otp">${data.otp}</p>
        <p>This OTP is valid for <strong>5 minutes</strong>.</p>
        <table>
          <tr><td><b>Name</b></td><td>${data.first_name} ${data.last_name}</td></tr>
          <tr><td><b>Email</b></td><td>${data.email}</td></tr>
        </table>
        <p class="footer">If you did not register, please ignore this email.</p>
      </div>
    </body>
    </html>
  `;

  return transporter.sendMail({
    from: process.env.EMAIL_FROM_USER,
    to: data.email,
    subject: "Verify Your Account - OTP",
    html
  });
};

module.exports = { sendRegisterMail };
