import OTPVerificationForm from "../../components/auth/OTPVerificationForm";

/**
 * VerifyOTPPage
 * Route: /verify-otp (PublicRoute)
 *
 * Thin route wrapper around OTPVerificationForm, which owns the actual
 * form state, the call to POST /auth/verify-email, and resending a new
 * code via POST /auth/resend-otp. Expects the email via router state
 * (set by RegisterPage), but falls back to an editable field if missing.
 */
const VerifyOTPPage = () => {
  return <OTPVerificationForm />;
};

export default VerifyOTPPage;
