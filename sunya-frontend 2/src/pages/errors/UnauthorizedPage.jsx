import { Link } from "react-router-dom";
import Button from "../../components/common/Button";

/**
 * UnauthorizedPage
 * Route: /unauthorized — reached via RoleBasedRoute when the signed-in
 * user's role isn't in a route's allowedRoles list.
 */
const UnauthorizedPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <p className="text-sm font-semibold text-red-500">403</p>
      <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">Access denied</h1>
      <p className="mt-3 max-w-sm text-sm text-gray-500">
        You don't have permission to view this page. If you think this is a mistake, contact an
        administrator.
      </p>
      <Link to="/dashboard" className="mt-6">
        <Button variant="primary">Back to dashboard</Button>
      </Link>
    </div>
  );
};

export default UnauthorizedPage;
