import { useProjectStore } from "@/stores/projectStore";

export function DashboardPage() {
  const { projects } = useProjectStore();

  return (
    <div className="flex-1 overflow-auto p-8 bg-surface">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-[18px] font-semibold text-text tracking-tight">Overview</h1>
          <p className="text-[13px] text-text-secondary mt-1">Select a workspace to manage environments and run commands.</p>
        </div>

        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-surface-secondary/50 rounded-xl border border-border border-dashed">
            <h2 className="text-[14px] font-medium text-text mb-1">No projects found</h2>
            <p className="text-[12px] text-text-secondary">Click "Add Project" in the sidebar to get started.</p>
          </div>
        ) : (
          <div>
            <h2 className="text-[12px] font-semibold text-text-muted uppercase tracking-widest mb-4">Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectCard({ project }: { project: any }) {
  const { setActiveProject, setView } = useProjectStore();
  const envCount = project.environments?.length || 0;

  return (
    <button
      onClick={() => {
        setActiveProject(project);
        setView("dashboard");
      }}
      className="text-left bg-surface rounded-xl p-3 border border-border-light hover:bg-surface-secondary hover:border-border transition-all cursor-pointer group flex items-center gap-3"
    >
      <div className="w-10 h-10 rounded-lg bg-surface-secondary border border-border-light flex items-center justify-center shrink-0">
        <svg width="16" height="16" viewBox="0 0 14 14" fill="none" className="text-text-muted group-hover:text-text transition-colors">
          <path d="M1.5 4V10.5C1.5 11.0523 1.94772 11.5 2.5 11.5H11.5C12.0523 11.5 12.5 11.0523 12.5 10.5V5.5C12.5 4.94772 12.0523 4.5 11.5 4.5H7.5L6 3H2.5C1.94772 3 1.5 3.44772 1.5 4Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
        </svg>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="text-[13px] font-medium text-text truncate">
            {project.name}
          </h3>
        </div>
        <p className="text-[11px] text-text-muted truncate mt-0.5">
          {project.path.split(/[\\/]/).slice(-2).join("/")} • {envCount} env{envCount !== 1 && 's'}
        </p>
      </div>

      <div className="shrink-0 flex items-center gap-2 pr-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className={`w-1.5 h-1.5 rounded-full ${project.status === 'ready' ? 'bg-success' : project.status === 'migrationNeeded' ? 'bg-warning' : 'bg-danger'}`} title={project.status === 'ready' ? 'Consistent' : 'Action Required'} />
      </div>
    </button>
  );
}
