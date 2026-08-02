import ForgotPasswordForm from "../../components/auth/ForgotPasswordForm";

/**
 * ForgotPasswordPage
 * Route: /forgot-password (PublicRoute)
 *
 * Thin route wrapper around ForgotPasswordForm, which owns the actual
 * form state, validation and the call to POST /auth/forgot-password.
 * On success it navigates to /reset-password with the email in route state.
 */
const ForgotPasswordPage = () => {
  return <ForgotPasswordForm />;
};

export default ForgotPasswordPage;
