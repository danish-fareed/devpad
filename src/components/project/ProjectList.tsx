import { useProjectStore } from "@/stores/projectStore";
import { ProjectItem } from "./ProjectItem";

/**
 * Renders the project list in the sidebar — macOS source list style.
 */
export function ProjectList() {
  const { projects, activeProject, setActiveProject, isLoading } = useProjectStore();

  if (isLoading && projects.length === 0) {
    return (
      <div className="px-3 py-6 text-center">
        <div className="w-5 h-5 rounded-full bg-sidebar-hover animate-pulse-soft mx-auto mb-2" />
        <p className="text-[11px] text-text-muted">Loading projects...</p>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="px-3 py-6 text-center">
        <p className="text-[12px] text-text-muted">No projects yet.</p>
        <p className="text-[11px] text-text-muted mt-0.5">
          Click "Add Project" below.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0.5 py-1">
      {projects.map((project) => (
        <ProjectItem
          key={project.id}
          project={project}
          isActive={activeProject?.id === project.id}
          onClick={() => {
            setActiveProject(project);
            useProjectStore.getState().setView("dashboard");
          }}
        />
      ))}
    </div>
  );
}
