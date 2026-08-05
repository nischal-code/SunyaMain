import { useNavigate } from "react-router-dom";
import Card from "../../components/common/Card";
import ChangePasswordForm from "../../components/auth/ChangePasswordForm";

/**
 * ChangePasswordPage
 * Route: /profile/change-password
 * POST /auth/change-password, via ChangePasswordForm.
 */
const ChangePasswordPage = () => {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-md space-y-6">
      <Card title="Change password" subtitle="Choose a new password for your account.">
        <ChangePasswordForm />
      </Card>

      <button
        type="button"
        onClick={() => navigate("/profile")}
        className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-700"
      >
        &larr; Back to profile
      </button>
    </div>
  );
};

export default ChangePasswordPage;
