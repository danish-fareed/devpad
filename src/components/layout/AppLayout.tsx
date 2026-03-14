import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { useProjectStore } from "@/stores/projectStore";
import { EnvironmentCards } from "@/components/environment/EnvironmentCards";
import { VariableList } from "@/components/variables/VariableList";
import { TerminalPanel } from "@/components/terminal/TerminalPanel";
import { MigrationWizard } from "@/components/migration/MigrationWizard";
import { ScanResultsPanel } from "@/components/scan/ScanResultsPanel";
import { SettingsPage } from "@/components/settings/SettingsPage";
import { useScanStore } from "@/stores/scanStore";

/**
 * Root layout component — macOS-style collapsible sidebar + main content area.
 * Switches between dashboard, terminal, settings, scan results, and migration views.
 */
export function AppLayout() {
  const { activeProject, view } = useProjectStore();
  const showScanResults = useScanStore((s) => s.showResults);

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-surface-secondary text-text">
      {/* macOS Sidebar (collapsible) */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-surface rounded-tl-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
        {/* TopBar — hidden on settings page */}
        {view !== "settings" && <TopBar />}

        {/* Settings page (no project required) */}
        {view === "settings" ? (
          <SettingsPage />
        ) : activeProject ? (
          activeProject.status === "migrationNeeded" ? (
            <MigrationWizard />
          ) : showScanResults ? (
            <ScanResultsPanel />
          ) : view === "dashboard" ? (
            <DashboardView />
          ) : (
            <TerminalPanel />
          )
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}

function DashboardView() {
  return (
    <div className="flex-1 overflow-auto p-6 flex flex-col gap-6 bg-surface">
      <EnvironmentCards />
      <div className="h-px bg-border-light" />
      <VariableList />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex-1 flex items-center justify-center bg-surface">
      <div className="text-center max-w-xs animate-fade-in">
        <div className="w-14 h-14 rounded-2xl bg-accent-light flex items-center justify-center mx-auto mb-5 shadow-sm">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            className="text-accent"
          >
            <path
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h2 className="text-base font-medium text-text mb-1.5">
          No project selected
        </h2>
        <p className="text-text-secondary text-[13px] leading-5">
          Add a project from the sidebar to get started with Varlock.
        </p>
      </div>
    </div>
  );
}
