import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import projectApi from "../../api/project.api";
import userApi from "../../api/user.api";

import Card from "../../components/common/Card";
import Loader from "../../components/common/Loader";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import ProjectDetailHeader from "../../components/project/ProjectDetailHeader";
import ProjectEditForm from "../../components/project/ProjectEditForm";
import ProjectMembersPanel from "../../components/project/ProjectMembersPanel";

const PRIVILEGED_MANAGE_ROLES = ["super_admin", "admin", "manager"];
const PRIVILEGED_DELETE_ROLES = ["super_admin", "admin"];

/**
 * ProjectDetailPage
 * GET /projects/:projectId. Shows the project summary + member list, with
 * edit (PATCH /projects/:projectId) and delete (DELETE /projects/:projectId)
 * actions for super_admin/admin/manager.
 */
const ProjectDetailPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const canManage = PRIVILEGED_MANAGE_ROLES.includes(currentUser?.role);
  const canDelete = PRIVILEGED_DELETE_ROLES.includes(currentUser?.role);

  const [project, setProject] = useState(null);
  const [userOptions, setUserOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError("");

    projectApi
      .getProjectById(projectId)
      .then((res) => {
        if (isMounted) setProject(res?.data?.data?.project ?? res?.data?.data ?? null);
      })
      .catch((err) => {
        if (isMounted) setError(err?.response?.data?.message || "Unable to load this project.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [projectId]);

  useEffect(() => {
    if (!canManage) return;
    userApi
      .listUsers({})
      .then((res) => {
        const users = res?.data?.data?.users ?? [];
        setUserOptions(users.map((u) => ({ value: u._id, label: `${u.name} (${u.email})` })));
      })
      .catch(() => {});
  }, [canManage]);

  const handleUpdated = (updatedProject) => {
    if (!updatedProject) return;
    setProject((prev) => ({ ...prev, ...updatedProject }));
    setIsEditing(false);
  };

  const handleMembersChange = (members) => {
    setProject((prev) => (prev ? { ...prev, members } : prev));
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setDeleteError("");
    try {
      await projectApi.deleteProject(projectId);
      navigate("/projects", { replace: true });
    } catch (err) {
      setDeleteError(err?.response?.data?.message || "Unable to delete this project.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) return <Loader fullScreen text="Loading project…" />;

  if (error || !project) {
    return (
      <Card>
        <p className="py-6 text-center text-sm text-red-600">{error || "Project not found."}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
        ← Back
      </Button>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <ProjectDetailHeader
          project={project}
          canManage={canManage}
          onEdit={() => setIsEditing(true)}
          onDelete={canDelete ? () => setIsConfirmingDelete(true) : undefined}
          className="lg:col-span-2"
        />

        <ProjectMembersPanel
          projectId={project._id}
          members={project.members || []}
          availableUsers={userOptions}
          canManage={canManage}
          onChange={handleMembersChange}
        />
      </div>

      <Modal isOpen={isEditing} onClose={() => setIsEditing(false)} title="Edit project" size="lg">
        <ProjectEditForm project={project} onSuccess={handleUpdated} onCancel={() => setIsEditing(false)} />
      </Modal>

      <ConfirmDialog
        isOpen={isConfirmingDelete}
        title="Delete project?"
        message={
          deleteError || `This will permanently delete "${project.name}". This action cannot be undone.`
        }
        confirmText="Delete"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setIsConfirmingDelete(false)}
      />
    </div>
  );
};

export default ProjectDetailPage;
