import { useState } from "react";
import { Settings } from "lucide-react";
import { useProjectStore } from "@/stores/projectStore";
import { useEnvironmentStore } from "@/stores/environmentStore";
import { useCommandStore } from "@/stores/commandStore";
import { SettingsModal } from "@/components/settings/SettingsPage";
import { EnvSelectorBar } from "@/components/commands/EnvSelectorBar";
import * as commands from "@/lib/commands";

/**
 * macOS-style toolbar: project title, status badge, scan button, settings, open terminal.
 */
export function TopBar() {
  const { activeProject, view } = useProjectStore();
  const { loadResult, isLoading } = useEnvironmentStore();
  const scan = useCommandStore((s) => s.scan);
  const [showSettings, setShowSettings] = useState(false);

  if (!activeProject) return null;

  const statusLabel = isLoading
    ? "loading..."
    : loadResult
    ? loadResult.valid
      ? "valid"
      : loadResult.errorCount > 0
        ? `${loadResult.errorCount} error${loadResult.errorCount !== 1 ? "s" : ""}`
        : `${loadResult.warningCount} warning${loadResult.warningCount !== 1 ? "s" : ""}`
    : null;

  const statusDot = isLoading
    ? "bg-text-muted animate-pulse-soft"
    : loadResult
    ? loadResult.valid
      ? "bg-success"
      : loadResult.errorCount > 0
        ? "bg-danger"
        : "bg-warning"
    : "bg-text-muted";


  const handleOpenTerminal = () => {
    if (activeProject?.path) {
      commands.openTerminalAt(activeProject.path);
    }
  };


  return (
    <>
      <div className="flex items-center px-5 h-12 border-b border-border-light gap-3 bg-surface shrink-0">
        {/* TopBar Left Items */}
        <div className="flex items-center gap-3">
          {/* Tech stack pills (minimal) */}
          {scan?.techStack && scan.techStack.length > 0 && view === "dashboard" && (
            <div className="flex items-center gap-1.5">
              {scan.techStack.map((tech) => (
                <span
                  key={tech}
                  className={`text-[10px] items-center px-1.5 py-0.5 rounded-md font-medium border ${
                    tech === "varlock"
                      ? "bg-accent/5 text-accent border-accent/20"
                      : "bg-surface-secondary text-text-muted border-border-light"
                  }`}
                >
                  {tech}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Status indicator */}
        {statusLabel && view === "dashboard" && (
          <div className="flex items-center gap-1.5 text-[12px] text-text-secondary">
            <div className={`w-[6px] h-[6px] rounded-full ${statusDot}`} />
            {statusLabel}
          </div>
        )}

        <div className="flex-1" />


        {/* Global Toolbar Actions */}
        {activeProject.status !== "migrationNeeded" && (
          <div className="flex items-center gap-4 ml-1">
            {/* Environment Selector inside TopBar */}
            {view === "dashboard" && <EnvSelectorBar />}

            <div className={`flex items-center gap-1.5 ${view === "dashboard" && "border-l border-border-light pl-4"}`}>
              {/* Settings button */}
              <button
                onClick={() => setShowSettings(true)}
                className="w-8 h-8 rounded-lg transition-colors cursor-pointer border bg-surface text-text-secondary border-border hover:bg-surface-secondary hover:text-text flex items-center justify-center"
                title="Settings"
              >
                <Settings size={14} />
              </button>

              {/* Open OS terminal button */}
              <button
                onClick={handleOpenTerminal}
                className="h-8 px-3 text-[13px] font-medium rounded-lg transition-colors cursor-pointer border flex items-center gap-1.5 bg-surface text-text-secondary border-border hover:bg-surface-secondary hover:text-text"
                title="Open OS terminal at project directory"
              >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className="shrink-0">
                  <path d="M2.5 3l3.5 3.5L2.5 10M7.5 10h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Terminal
              </button>
            </div>
          </div>
        )}
      </div>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </>
  );
}
