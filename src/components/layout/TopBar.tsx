import { useState } from "react";
import { Settings, ChevronDown, Minus, Square, X } from "lucide-react";
import { useProjectStore } from "@/stores/projectStore";
import { useEnvironmentStore } from "@/stores/environmentStore";
import { useCommandStore } from "@/stores/commandStore";
import { SettingsModal } from "@/components/settings/SettingsPage";
import { ENV_BADGE_STYLES, DEFAULT_ENV_BADGE } from "@/lib/constants";
import { getCurrentWindow } from "@tauri-apps/api/window";

/**
 * Top bar — env switcher with status + tech stack pills + settings.
 */
export function TopBar() {
  const { activeProject, view } = useProjectStore();
  const { loadResult, isLoading, activeEnv, setActiveEnv, loadEnvironment } = useEnvironmentStore();
  const scan = useCommandStore((s) => s.scan);
  const [showSettings, setShowSettings] = useState(false);
  const [showEnvDropdown, setShowEnvDropdown] = useState(false);
  let appWindow: ReturnType<typeof getCurrentWindow> | null = null;
  try {
    appWindow = getCurrentWindow();
  } catch (e) {
    console.warn("Not running in Tauri environment", e);
  }

  const handleDrag = (e: React.MouseEvent) => {
    // Only drag on left mouse button and when clicking the bar background itself
    if (e.button !== 0) return;
    // Don't drag if clicking on an interactive element
    const target = e.target as HTMLElement;
    if (target.closest('button, a, input, select, [data-no-drag]')) return;
    e.preventDefault();
    appWindow?.startDragging();
  };

  // Status config
  const statusLabel = (!activeProject || isLoading)
    ? "loading…"
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

  const envBadge = ENV_BADGE_STYLES[activeEnv] ?? DEFAULT_ENV_BADGE;
  const environments = activeProject?.environments ?? [];

  const handleEnvSwitch = (env: string) => {
    setActiveEnv(env);
    setShowEnvDropdown(false);
    if (activeProject?.path) {
      loadEnvironment(activeProject.path, env);
    }
  };

  return (
    <>
      <div onMouseDown={handleDrag} className="flex items-center pl-5 pr-0 h-11 border-b border-border-light gap-3 bg-surface shrink-0">
        {/* Env switcher */}
        {activeProject && view === "dashboard" && (
          <div className="relative" data-no-drag>
            <button
              onClick={() => setShowEnvDropdown(!showEnvDropdown)}
              className="flex items-center gap-1.5 h-7 px-2.5 rounded-lg border border-border-light hover:bg-surface-secondary transition-colors cursor-pointer bg-transparent"
            >
              <span
                className={`text-[10px] font-semibold px-1.5 py-[1px] rounded ${envBadge}`}
              >
                {activeEnv}
              </span>
              <ChevronDown size={10} strokeWidth={1.5} className="text-text-muted" />
            </button>

            {/* Dropdown */}
            {showEnvDropdown && environments.length > 0 && (
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-40 cursor-default"
                  onClick={() => setShowEnvDropdown(false)}
                />
                <div className="absolute top-full left-0 mt-1 z-50 w-40 bg-surface rounded-lg shadow-[0_4px_24px_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.05)] py-1 animate-slide-down">
                  {environments.map((env) => {
                    const badge = ENV_BADGE_STYLES[env] ?? DEFAULT_ENV_BADGE;
                    return (
                      <button
                        key={env}
                        onClick={() => handleEnvSwitch(env)}
                        className={`w-full text-left px-3 py-1.5 text-[12px] flex items-center gap-2 cursor-pointer border-none bg-transparent transition-colors ${
                          env === activeEnv
                            ? "text-text font-medium bg-surface-secondary"
                            : "text-text-secondary hover:bg-surface-secondary hover:text-text"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${badge.split(' ')[1]}`} // Extract text-* class for background color trick
                        />
                        {env}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* Status indicator */}
        {activeProject && statusLabel && view === "dashboard" && (
          <div className="flex items-center gap-1.5 text-[11px] text-text-secondary">
            <div className={`w-[5px] h-[5px] rounded-full ${statusDot}`} />
            {statusLabel}
          </div>
        )}

        {/* Tech stack pills */}
        {activeProject && scan?.techStack && scan.techStack.length > 0 && view === "dashboard" && (
          <div className="flex items-center gap-1.5 ml-2">
            {scan.techStack.map((tech) => (
              <span
                key={tech}
                className={`text-[10px] items-center px-1.5 py-0.5 rounded-md font-medium border ${
                  tech === "varlock"
                    ? "bg-accent/5 text-accent border-accent/15"
                    : "bg-surface-secondary text-text-muted border-border-light"
                }`}
              >
                {tech}
              </span>
            ))}
          </div>
        )}

        <div className="flex-1" />

        {/* Settings and Window Controls */}
        <div className="flex items-center h-full">
          {(!activeProject || activeProject.status !== "migrationNeeded") && (
            <div className="flex items-center pr-3">
              <button
                data-no-drag
                onClick={() => setShowSettings(true)}
                className="w-7 h-7 rounded-lg transition-colors cursor-pointer border bg-surface text-text-muted border-border-light hover:bg-surface-secondary hover:text-text flex items-center justify-center"
                title="Settings"
              >
                <Settings size={13} strokeWidth={1.3} />
              </button>
            </div>
          )}

          {/* Window Controls - Native styling (h-full w-12, no gaps) */}
          <div className="flex h-full">
            <button
              data-no-drag
              onClick={() => appWindow?.minimize()}
              className="w-12 h-full flex justify-center items-center hover:bg-surface-secondary text-text-muted hover:text-text transition-colors border-none bg-transparent cursor-default"
              title="Minimize"
            >
              <Minus size={14} strokeWidth={1.5} />
            </button>
            <button
              data-no-drag
              onClick={() => appWindow?.toggleMaximize()}
              className="w-12 h-full flex justify-center items-center hover:bg-surface-secondary text-text-muted hover:text-text transition-colors border-none bg-transparent cursor-default"
              title="Maximize"
            >
              <Square size={13} strokeWidth={1.5} />
            </button>
            <button
              data-no-drag
              onClick={() => appWindow?.close()}
              className="w-[46px] h-full flex justify-center items-center hover:bg-danger hover:text-white text-text-muted transition-colors border-none bg-transparent cursor-default"
              title="Close"
            >
              <X size={15} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </>
  );
}
