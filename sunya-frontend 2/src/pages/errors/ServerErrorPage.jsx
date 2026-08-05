import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";

/**
 * ServerErrorPage
 * Generic "something went wrong" screen for unrecoverable errors (e.g.
 * caught by an error boundary at the App level). Not tied to a specific
 * route — navigate here explicitly, or render it as an error boundary's
 * fallback.
 */
const ServerErrorPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <p className="text-sm font-semibold text-red-500">500</p>
      <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">Something went wrong</h1>
      <p className="mt-3 max-w-sm text-sm text-gray-500">
        An unexpected error occurred on our end. Please try again, and contact support if the
        problem persists.
      </p>
      <div className="mt-6 flex items-center gap-3">
        <Button variant="outline" onClick={() => navigate(0)}>
          Reload page
        </Button>
        <Link to="/dashboard">
          <Button variant="primary">Back to dashboard</Button>
        </Link>
      </div>
    </div>
  );
};

export default ServerErrorPage;
