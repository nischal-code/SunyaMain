import jwt from "jsonwebtoken";
import crypto from "crypto";
import { env } from "../config/env.js";

export const generateAccessToken = (user) => {
  return jwt.sign(
    { userId: user._id, role: user.role },
    env.ACCESS_TOKEN_SECRET,
    { expiresIn: env.ACCESS_TOKEN_EXPIRY }
  );
};

export const generateRefreshToken = (user) => {
  return jwt.sign(
    { userId: user._id, jti: crypto.randomUUID() },
    env.REFRESH_TOKEN_SECRET,
    { expiresIn: env.REFRESH_TOKEN_EXPIRY }
  );
};

export const verifyAccessToken = (token) => jwt.verify(token, env.ACCESS_TOKEN_SECRET);

export const verifyRefreshToken = (token) => jwt.verify(token, env.REFRESH_TOKEN_SECRET);

/**
 * Refresh tokens are stored hashed (never in plaintext) in the Session
 * collection, similar to how passwords are hashed.
 */
export const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};
