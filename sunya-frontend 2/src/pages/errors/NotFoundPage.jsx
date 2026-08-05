import { Link } from "react-router-dom";
import Button from "../../components/common/Button";

/**
 * NotFoundPage
 * Route: * (catch-all, see routes/AppRoutes.jsx)
 */
const NotFoundPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <p className="text-sm font-semibold text-primary-600">404</p>
      <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">Page not found</h1>
      <p className="mt-3 max-w-sm text-sm text-gray-500">
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <Link to="/dashboard" className="mt-6">
        <Button variant="primary">Back to dashboard</Button>
      </Link>
    </div>
  );
};

export default NotFoundPage;
