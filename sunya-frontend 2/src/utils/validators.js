/**
 * validators.js
 * Lightweight client-side validation helpers used by react-hook-form
 * `rules`/`validate` options. These are UX conveniences only — the
 * backend (see src/validators/*.js) is the source of truth and always
 * re-validates.
 */

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidEmail = (value = "") => EMAIL_PATTERN.test(String(value).trim());

// Mirrors the backend password rule: min 8 chars, at least one letter and one number.
export const isValidPassword = (value = "") =>
  typeof value === "string" && value.length >= 8 && /[A-Za-z]/.test(value) && /\d/.test(value);

export const isValidPhone = (value = "") => /^[+]?[\d\s-]{7,15}$/.test(String(value).trim());

export const isRequired = (value) => {
  if (typeof value === "string") return value.trim().length > 0;
  return value !== null && value !== undefined;
};

export const minLength = (value = "", min) => String(value).length >= min;
export const maxLength = (value = "", max) => String(value).length <= max;

/** react-hook-form-friendly rule objects, e.g. {...register("email", emailRule)} */
export const emailRule = {
  required: "Email is required",
  pattern: { value: EMAIL_PATTERN, message: "Enter a valid email address" },
};

export const passwordRule = {
  required: "Password is required",
  validate: (value) =>
    isValidPassword(value) || "Password must be at least 8 characters and include a letter and a number",
};

export const requiredRule = (label = "This field") => ({
  required: `${label} is required`,
});

export default {
  EMAIL_PATTERN,
  isValidEmail,
  isValidPassword,
  isValidPhone,
  isRequired,
  minLength,
  maxLength,
  emailRule,
  passwordRule,
  requiredRule,
};
