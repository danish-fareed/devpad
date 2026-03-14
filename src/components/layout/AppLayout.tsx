import { useState, useRef, useCallback } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { useProjectStore } from "@/stores/projectStore";
import { useVaultStore } from "@/stores/vaultStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { EnvironmentCards } from "@/components/environment/EnvironmentCards";
import { VariableList } from "@/components/variables/VariableList";
import { TerminalPanel } from "@/components/terminal/TerminalPanel";
import { MigrationWizard } from "@/components/migration/MigrationWizard";
import { ScanResultsPanel } from "@/components/scan/ScanResultsPanel";
import { SetupWizard } from "@/components/vault/SetupWizard";
import { SecretGenerator } from "@/components/vault/SecretGenerator";
import { AiContextPanel } from "@/components/vault/AiContextPanel";
import { TeamSyncPanel } from "@/components/vault/TeamSyncPanel";
import { useScanStore } from "@/stores/scanStore";

/**
 * Root layout — two-tier sidebar + main content + resizable terminal bottom pane.
 *
 * Views:
 *   dashboard — project env cards + variable list (or global project list if none selected)
 *   vault     — vault overview + tools (import, generator, AI context, team sync)
 */
export function AppLayout() {
  const { activeProject, view } = useProjectStore();
  const showScanResults = useScanStore((s) => s.showResults);
  const { terminalOpen } = useSettingsStore();

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-surface-secondary text-text">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-surface rounded-tl-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
        {/* TopBar — hidden on vault page */}
        {view !== "vault" && <TopBar />}

        {/* Content + terminal split */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Main content */}
          <div className="flex-1 overflow-auto" style={{ minHeight: 200 }}>
            {view === "vault" ? (
              <VaultPage />
            ) : activeProject ? (
              activeProject.status === "migrationNeeded" ? (
                <MigrationWizard />
              ) : showScanResults ? (
                <ScanResultsPanel />
              ) : (
                <DashboardView />
              )
            ) : (
              <GlobalDashboard />
            )}
          </div>

          {/* Terminal bottom pane — available when a project is active */}
          {terminalOpen && activeProject && activeProject.status !== "migrationNeeded" && (
            <TerminalPane />
          )}
        </div>
      </div>
    </div>
  );
}

// ── Terminal bottom pane with drag-to-resize ──

function TerminalPane() {
  const [height, setHeight] = useState(260);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const startH = useRef(0);

  const MIN_HEIGHT = 120;
  const MAX_HEIGHT = 500;

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    startY.current = e.clientY;
    startH.current = height;

    const onMouseMove = (ev: MouseEvent) => {
      if (!isDragging.current) return;
      const delta = startY.current - ev.clientY;
      const next = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, startH.current + delta));
      setHeight(next);
    };

    const onMouseUp = () => {
      isDragging.current = false;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";
  }, [height]);

  return (
    <div className="flex flex-col shrink-0 border-t border-border-light" style={{ height }}>
      <div
        className="h-1 bg-transparent hover:bg-accent/30 cursor-row-resize shrink-0 transition-colors"
        onMouseDown={handleMouseDown}
      />
      <div className="flex-1 overflow-hidden">
        <TerminalPanel />
      </div>
    </div>
  );
}

// ── Dashboard view (Project-scoped) ──

function DashboardView() {
  return (
    <div className="flex-1 overflow-auto p-6 flex flex-col gap-6 bg-surface">
      <EnvironmentCards />
      <div className="h-px bg-border-light" />
      <VariableList />
    </div>
  );
}

// ── Global Dashboard (No project selected) ──

function GlobalDashboard() {
  const { projects } = useProjectStore();

  return (
    <div className="flex-1 overflow-auto p-8 bg-surface">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shadow-sm">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="white" strokeWidth="2" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="white" strokeWidth="2" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="white" strokeWidth="2" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="white" strokeWidth="2" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-semibold text-text tracking-tight">Overview</h1>
            <p className="text-[13px] text-text-secondary mt-0.5">Manage your workspace environments.</p>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-surface-secondary/50 rounded-2xl border border-border-light border-dashed">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="text-text-muted mb-4">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h2 className="text-[15px] font-medium text-text mb-1">No projects found</h2>
            <p className="text-[13px] text-text-secondary">Click "Add Project" in the sidebar to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectCard({ project }: { project: any }) {
  const { setActiveProject, setView } = useProjectStore();

  return (
    <button
      onClick={() => {
        setActiveProject(project);
        setView("dashboard");
      }}
      className="text-left bg-surface rounded-xl p-5 border border-border-light hover:border-accent hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-all cursor-pointer group flex flex-col"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-lg bg-accent-light/30 text-accent flex items-center justify-center shrink-0">
          <svg width="16" height="16" viewBox="0 0 14 14" fill="currentColor">
            <path d="M1.5 4V10.5C1.5 11.0523 1.94772 11.5 2.5 11.5H11.5C12.0523 11.5 12.5 11.0523 12.5 10.5V5.5C12.5 4.94772 12.0523 4.5 11.5 4.5H7.5L6 3H2.5C1.94772 3 1.5 3.44772 1.5 4Z" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-[14px] font-semibold text-text truncate group-hover:text-accent transition-colors">
            {project.name}
          </h3>
          <p className="text-[11px] text-text-muted truncate mt-0.5" title={project.path}>
            {project.path.split(/[\\/]/).slice(-2).join("/")}
          </p>
        </div>
      </div>
      <div className="mt-auto pt-3 border-t border-border-light flex items-center justify-between">
        <span className="text-[11px] font-medium text-text-secondary bg-surface-secondary px-2 py-0.5 rounded-md">
          {project.status === "ready" ? "Ready" : project.status === "migrationNeeded" ? "Migration needed" : "Error"}
        </span>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-text-muted opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0">
          <path d="M5 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </button>
  );
}

// ── Vault page ──

function VaultPage() {
  const { status, lock } = useVaultStore();
  const [activeTab, setActiveTab] = useState<string>("vault");

  const tabs = [
    { id: "vault", label: "Overview" },
    { id: "import", label: "Import Secrets" },
    { id: "generate", label: "Generator" },
    { id: "ai-context", label: "AI Context" },
    { id: "team-sync", label: "Team Sync" },
  ];

  return (
    <div className="flex-1 overflow-auto p-6 bg-surface">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-text">Vault</h1>
              <p className="text-xs text-text-secondary">
                {status?.unlocked ? "Vault unlocked" : "Vault locked"} · XChaCha20-Poly1305
              </p>
            </div>
          </div>
          {status?.unlocked && (
            <button
              onClick={lock}
              className="px-4 py-2 rounded-lg bg-transparent border border-border-light text-text-secondary text-sm font-medium hover:bg-surface-secondary transition-colors cursor-pointer flex items-center gap-2"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Lock
            </button>
          )}
        </div>

        <div className="flex gap-1 mb-6 border-b border-border-light pb-px">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 text-xs font-medium rounded-t-lg cursor-pointer border-none transition-colors ${
                activeTab === tab.id
                  ? "bg-surface-secondary text-accent border-b-2 border-accent"
                  : "bg-transparent text-text-muted hover:text-text hover:bg-surface-secondary/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "vault" && <VaultOverview />}
        {activeTab === "import" && <SetupWizard />}
        {activeTab === "generate" && <SecretGenerator />}
        {activeTab === "ai-context" && <AiContextPanel />}
        {activeTab === "team-sync" && <TeamSyncPanel />}
      </div>
    </div>
  );
}

function VaultOverview() {
  const { status } = useVaultStore();
  return (
    <div>
      <div className="bg-surface-secondary rounded-xl p-6 border border-border-light">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-text-muted text-xs uppercase tracking-wider">Status</span>
            <p className="text-text font-medium mt-1">
              {status?.unlocked ? "🔓 Unlocked" : "🔒 Locked"}
            </p>
          </div>
          <div>
            <span className="text-text-muted text-xs uppercase tracking-wider">Keychain</span>
            <p className="text-text font-medium mt-1">
              {status?.hasKeychainKey ? "✅ Key stored" : "Not stored"}
            </p>
          </div>
          <div>
            <span className="text-text-muted text-xs uppercase tracking-wider">Encryption</span>
            <p className="text-text font-medium mt-1">XChaCha20-Poly1305</p>
          </div>
          <div>
            <span className="text-text-muted text-xs uppercase tracking-wider">KDF</span>
            <p className="text-text font-medium mt-1">Argon2id (64MB)</p>
          </div>
        </div>
      </div>
      <p className="text-text-muted text-xs mt-4 text-center">
        Your secrets are encrypted with a Data Encryption Key (DEK), which itself is encrypted by your master password via Argon2id + HKDF.
      </p>
    </div>
  );
}
