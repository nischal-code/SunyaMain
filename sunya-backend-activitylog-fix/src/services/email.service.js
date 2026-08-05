import nodemailer from "nodemailer";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_SECURE,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

export const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: env.EMAIL_FROM,
      to,
      subject,
      html,
    });
  } catch (error) {
    logger.error(`Email send failed to ${to}: ${error.message}`);
    throw error;
  }
};

export const sendOTPEmail = async (to, otp, purpose) => {
  const heading =
    purpose === "password_reset" ? "Password Reset Request" : "Verify Your Email";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
      <h2 style="color:#111;">Sunya Agency</h2>
      <h3>${heading}</h3>
      <p>Your One-Time Password (OTP) is:</p>
      <div style="font-size: 28px; font-weight: bold; letter-spacing: 4px; margin: 16px 0;">
        ${otp}
      </div>
      <p>This code will expire in ${env.OTP_EXPIRY_MINUTES} minutes.</p>
      <p style="color:#888; font-size: 12px;">If you did not request this, please ignore this email.</p>
    </div>
  `;

  await sendEmail({ to, subject: `Sunya Agency - ${heading}`, html });
};
