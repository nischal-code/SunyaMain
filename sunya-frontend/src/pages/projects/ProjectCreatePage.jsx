import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import Card from "../../components/common/Card";
import ProjectCreateForm from "../../components/project/ProjectCreateForm";

const PRIVILEGED_MANAGE_ROLES = ["super_admin", "admin", "manager"];

/**
 * ProjectCreatePage
 * POST /projects (super_admin/admin/manager only). Redirects to the new
 * project's detail page on success, where members can then be added via
 * ProjectMembersPanel.
 */
const ProjectCreatePage = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const canAccess = PRIVILEGED_MANAGE_ROLES.includes(currentUser?.role);

  if (!canAccess) {
    return (
      <Card>
        <p className="py-6 text-center text-sm text-gray-500">
          You don't have permission to create new projects.
        </p>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">New project</h1>
        <p className="mt-1 text-sm text-gray-500">
          You can add members once the project has been created.
        </p>
      </div>

      <Card>
        <ProjectCreateForm onSuccess={(project) => navigate(`/projects/${project._id}`)} />
      </Card>
    </div>
  );
};

export default ProjectCreatePage;
