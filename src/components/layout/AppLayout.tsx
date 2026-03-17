import { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { useProjectStore } from "@/stores/projectStore";
import { useCommandStore } from "@/stores/commandStore";
import { useEnvironmentStore } from "@/stores/environmentStore";
import { useFileWatcher } from "@/hooks/useFileWatcher";
import { VariableList } from "@/components/variables/VariableList";
import { MigrationWizard } from "@/components/migration/MigrationWizard";
import { ScanResultsPanel } from "@/components/scan/ScanResultsPanel";
import { DashboardPage } from "@/components/dashboard/DashboardPage";
import { VaultPage } from "@/components/vault/VaultPage";
import { CommandGrid } from "@/components/commands/CommandGrid";
import { useScanStore } from "@/stores/scanStore";
import { FolderOpen, Code, TextCursorInput } from "lucide-react";
import * as commands from "@/lib/commands";

/**
 * Root layout — sidebar + main content.
 *
 * Views:
 *   dashboard — command grid + env selector (or global project list if none selected)
 *   vault     — vault overview + tools
 */
export function AppLayout() {
  const { activeProject, view } = useProjectStore();
  const showScanResults = useScanStore((s) => s.showResults);

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-surface-secondary text-text">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-surface">
        {/* TopBar — hidden on vault page */}
        {view !== "vault" && <TopBar />}

        {/* Main content */}
        <div className="flex-1 overflow-auto">
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
            <DashboardPage />
          )}
        </div>
      </div>
    </div>
  );
}

// ── Dashboard view (Project-scoped) ──

function DashboardView() {
  const { activeProject } = useProjectStore();
  const { scanProject, reset } = useCommandStore();
  const { loadEnvironment } = useEnvironmentStore();
  const [showEnvView, setShowEnvView] = useState(true);

  // Watch for file changes
  useFileWatcher(activeProject?.id, activeProject?.path);

  // Scan project for commands when active project changes
  useEffect(() => {
    if (activeProject?.path) {
      scanProject(activeProject.path);
      loadEnvironment(activeProject.path);
    } else {
      reset();
    }
  }, [activeProject?.path, activeProject?.id]);

  return (
    <div className="flex-1 overflow-auto p-5 flex flex-col gap-4 bg-surface relative group/header">
      {/* Project Header & View Tabs */}
      <div className="flex flex-col gap-4 mb-2">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[18px] font-semibold text-text tracking-tight flex items-center gap-2">
              {activeProject?.name}
            </h1>
            <p className="text-[12px] text-text-muted mt-1 font-mono">{activeProject?.path}</p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => activeProject && commands.openInExplorer(activeProject.path)}
              className="px-2.5 h-7 text-[11px] font-medium rounded-md transition-colors cursor-pointer border flex items-center gap-1.5 bg-surface text-text-secondary border-border hover:bg-surface-secondary hover:text-text"
              title="Open OS File Explorer"
            >
              <FolderOpen size={12} />
              Explorer
            </button>
            <button
              onClick={() => activeProject && commands.openInEditor(activeProject.path, "code")}
              className="px-2.5 h-7 text-[11px] font-medium rounded-md transition-colors cursor-pointer border flex items-center gap-1.5 bg-surface text-text-secondary border-border hover:bg-surface-secondary hover:text-text"
              title="Open in VS Code"
            >
              <Code size={12} />
              VS Code
            </button>
            <button
              onClick={() => activeProject && commands.openInEditor(activeProject.path, "cursor")}
              className="px-2.5 h-7 text-[11px] font-medium rounded-md transition-colors cursor-pointer border flex items-center gap-1.5 bg-surface text-text-secondary border-border hover:bg-surface-secondary hover:text-text"
              title="Open in Cursor"
            >
              <TextCursorInput size={12} />
              Cursor
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1 p-1 bg-surface-secondary border border-border-light rounded-lg shadow-sm self-start">
          <button
            onClick={() => setShowEnvView(true)}
            className={`text-[11px] font-medium px-4 py-1.5 rounded-md cursor-pointer border-none transition-all ${
              showEnvView
                ? "bg-text text-surface shadow"
                : "bg-transparent text-text-secondary hover:text-text hover:bg-surface-tertiary"
            }`}
          >
            Variables
          </button>
          <button
            onClick={() => setShowEnvView(false)}
            className={`text-[11px] font-medium px-4 py-1.5 rounded-md cursor-pointer border-none transition-all ${
              !showEnvView
                ? "bg-text text-surface shadow"
                : "bg-transparent text-text-secondary hover:text-text hover:bg-surface-tertiary"
            }`}
          >
            Commands
          </button>
        </div>
      </div>

      {/* Content */}
      {showEnvView ? (
        <VariableList />
      ) : (
        <CommandGrid />
      )}
    </div>
  );
}
