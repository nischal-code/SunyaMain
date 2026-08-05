import ResetPasswordForm from "../../components/auth/ResetPasswordForm";

/**
 * ResetPasswordPage
 * Route: /reset-password (PublicRoute)
 *
 * Thin route wrapper around ResetPasswordForm, which owns the actual
 * form state, validation and the call to POST /auth/reset-password.
 * Expects the email via router state (set by ForgotPasswordPage), but
 * ResetPasswordForm falls back to an editable field if it's missing.
 */
const ResetPasswordPage = () => {
  return <ResetPasswordForm />;
};

export default ResetPasswordPage;
