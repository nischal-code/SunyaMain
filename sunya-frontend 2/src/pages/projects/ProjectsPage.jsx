import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import projectApi from "../../api/project.api";
import ProjectFilters from "../../components/project/ProjectFilters";
import ProjectList from "../../components/project/ProjectList";
import Tabs from "../../components/common/Tabs";
import Button from "../../components/common/Button";

const VIEW_TABS = [
  { id: "table", label: "Table" },
  { id: "card", label: "Cards" },
];

const PRIVILEGED_MANAGE_ROLES = ["super_admin", "admin", "manager"];
const PAGE_SIZE = 9;

/**
 * ProjectsPage
 * Lists projects — GET /projects (employees see only their own projects;
 * super_admin/admin/manager see all) — with server-side search/status/
 * department filters and pagination.
 */
const ProjectsPage = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const canManage = PRIVILEGED_MANAGE_ROLES.includes(currentUser?.role);

  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ search: "", status: "", department: "" });
  const [view, setView] = useState("table");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError("");

    projectApi
      .listProjects({
        search: filters.search || undefined,
        status: filters.status || undefined,
        department: filters.department || undefined,
        page,
        limit: PAGE_SIZE,
      })
      .then((res) => {
        if (!isMounted) return;
        const data = res?.data?.data;
        setProjects(data?.projects ?? []);
        setTotalPages(data?.totalPages ?? 1);
        setTotal(data?.total ?? data?.projects?.length ?? 0);
      })
      .catch((err) => {
        if (isMounted) setError(err?.response?.data?.message || "Unable to load projects.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [filters, page]);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Projects</h1>
          <p className="mt-1 text-sm text-gray-500">
            {total} project{total === 1 ? "" : "s"}
          </p>
        </div>
        {canManage && <Button onClick={() => navigate("/projects/create")}>New project</Button>}
      </div>

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <ProjectFilters
          filters={filters}
          onChange={setFilters}
          onReset={() => setFilters({ search: "", status: "", department: "" })}
        />
        <Tabs tabs={VIEW_TABS} activeTab={view} onChange={setView} variant="pills" />
      </div>

      <ProjectList
        projects={projects}
        view={view}
        isLoading={isLoading}
        onView={(p) => navigate(`/projects/${p._id}`)}
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
};

export default ProjectsPage;
