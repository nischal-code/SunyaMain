import RegisterForm from "../../components/auth/RegisterForm";

/**
 * RegisterPage
 * Route: /register (PublicRoute)
 *
 * Thin route wrapper around RegisterForm, which owns the actual form
 * state, validation and the call to POST /auth/register. On success,
 * RegisterForm navigates to /verify-otp with the email in route state.
 */
const RegisterPage = () => {
  return <RegisterForm />;
};

export default RegisterPage;
