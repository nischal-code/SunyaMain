import { useMemo, useState } from "react";
import Card from "../common/Card";
import Avatar from "../common/Avatar";
import Select from "../common/Select";
import Button from "../common/Button";
import projectApi from "../../api/project.api";

/**
 * ProjectMembersPanel
 * Manages a project's member list via PATCH /projects/:projectId/team
 * (restricted to super_admin/admin/manager). That endpoint replaces the
 * *entire* team array — there's no incremental add/remove endpoint on the
 * backend — so add/remove here compute the full desired id list from the
 * current `members` prop and send that. Self-contained like
 * ClockInOutWidget: it calls the API itself and reports the resulting
 * member list back via `onChange` so the parent (ProjectDetailPage) can
 * keep the rest of the page (e.g. ProjectDetailHeader's progress) in sync.
 *
 * Props:
 *  - projectId:      string — required
 *  - members:        object[] — required, current members ({ _id, name, email, department, profilePicture })
 *  - availableUsers:  { value, label }[] — users eligible to be added (the
 *      parent already fetched the full user directory, e.g. via userApi.listUsers)
 *  - canManage:      bool — shows the add/remove controls, default false
 *  - onChange:       fn(members) — called with the updated member list after
 *      a successful add or remove
 *  - className:      string
 */
const ProjectMembersPanel = ({
  projectId,
  members = [],
  availableUsers = [],
  canManage = false,
  onChange,
  className = "",
}) => {
  const [selectedUserId, setSelectedUserId] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const [error, setError] = useState("");

  const addableOptions = useMemo(() => {
    const memberIds = new Set(members.map((m) => m._id));
    return availableUsers.filter((option) => !memberIds.has(option.value));
  }, [availableUsers, members]);

  const handleAdd = async () => {
    if (!selectedUserId) return;
    setIsAdding(true);
    setError("");
    try {
      const nextTeamIds = [...members.map((m) => m._id), selectedUserId];
      const { data } = await projectApi.setProjectTeam(projectId, nextTeamIds);
      const updated = data?.data?.project?.team;
      if (updated) onChange?.(updated);
      setSelectedUserId("");
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to add this member.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemove = async (userId) => {
    setRemovingId(userId);
    setError("");
    try {
      const nextTeamIds = members.filter((m) => m._id !== userId).map((m) => m._id);
      const { data } = await projectApi.setProjectTeam(projectId, nextTeamIds);
      const updated = data?.data?.project?.team;
      onChange?.(updated ?? members.filter((m) => m._id !== userId));
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to remove this member.");
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <Card title="Members" subtitle={`${members.length} member${members.length === 1 ? "" : "s"}`} className={className}>
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      <ul className="space-y-3">
        {members.map((member) => (
          <li key={member._id} className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <Avatar src={member.profilePicture?.url} name={member.name} size="sm" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-900">{member.name}</p>
                <p className="truncate text-xs text-gray-400">{member.email}</p>
              </div>
            </div>

            {canManage && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemove(member._id)}
                isLoading={removingId === member._id}
              >
                Remove
              </Button>
            )}
          </li>
        ))}

        {!members.length && <p className="py-4 text-center text-sm text-gray-400">No members yet.</p>}
      </ul>

      {canManage && (
        <div className="mt-4 flex items-end gap-2 border-t border-gray-100 pt-4">
          <Select
            containerClassName="flex-1"
            placeholder="Select an employee to add"
            options={addableOptions}
            value={selectedUserId}
            onChange={(event) => setSelectedUserId(event.target.value)}
          />
          <Button onClick={handleAdd} isLoading={isAdding} disabled={!selectedUserId}>
            Add
          </Button>
        </div>
      )}
    </Card>
  );
};

export default ProjectMembersPanel;