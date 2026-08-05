import dotenv from "dotenv";

dotenv.config();

const required = (key, fallback = undefined) => {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    // eslint-disable-next-line no-console
    console.warn(`[env] Warning: ${key} is not set`);
  }
  return value;
};

export const env = {
  NODE_ENV: required("NODE_ENV", "development"),
  PORT: Number(required("PORT", 5000)),
  CLIENT_URL: required("CLIENT_URL", "http://localhost:5173"),

  MONGO_URI: required("MONGO_URI"),

  ACCESS_TOKEN_SECRET: required("ACCESS_TOKEN_SECRET"),
  ACCESS_TOKEN_EXPIRY: required("ACCESS_TOKEN_EXPIRY", "15m"),
  REFRESH_TOKEN_SECRET: required("REFRESH_TOKEN_SECRET"),
  REFRESH_TOKEN_EXPIRY: required("REFRESH_TOKEN_EXPIRY", "7d"),
  REFRESH_TOKEN_EXPIRY_MS: Number(required("REFRESH_TOKEN_EXPIRY_MS", 604800000)),

  OTP_EXPIRY_MINUTES: Number(required("OTP_EXPIRY_MINUTES", 10)),

  COOKIE_SECURE: required("COOKIE_SECURE", "false") === "true",

  SMTP_HOST: required("SMTP_HOST"),
  SMTP_PORT: Number(required("SMTP_PORT", 587)),
  SMTP_SECURE: required("SMTP_SECURE", "false") === "true",
  SMTP_USER: required("SMTP_USER"),
  SMTP_PASS: required("SMTP_PASS"),
  EMAIL_FROM: required("EMAIL_FROM", "Sunya Agency <no-reply@sunya.com>"),

  CLOUDINARY_CLOUD_NAME: required("CLOUDINARY_CLOUD_NAME"),
  CLOUDINARY_API_KEY: required("CLOUDINARY_API_KEY"),
  CLOUDINARY_API_SECRET: required("CLOUDINARY_API_SECRET"),

  RATE_LIMIT_WINDOW_MS: Number(required("RATE_LIMIT_WINDOW_MS", 900000)),
  RATE_LIMIT_MAX: Number(required("RATE_LIMIT_MAX", 100)),
};
