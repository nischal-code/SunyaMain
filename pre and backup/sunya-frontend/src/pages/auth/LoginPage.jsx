import LoginForm from "../../components/auth/LoginForm";

/**
 * LoginPage
 * Route: /login (PublicRoute)
 *
 * Thin route wrapper around LoginForm, which owns the actual form
 * state, validation and the call to AuthContext.login() (POST /auth/login).
 */
const LoginPage = () => {
  return <LoginForm />;
};

export default LoginPage;
