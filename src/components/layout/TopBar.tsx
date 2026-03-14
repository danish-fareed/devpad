import { useProjectStore } from "@/stores/projectStore";
import { useEnvironmentStore } from "@/stores/environmentStore";
import { useScanStore } from "@/stores/scanStore";

/**
 * macOS-style toolbar: project title, status badge, scan button.
 * Navigation is now handled by the sidebar, so the segmented control is removed.
 */
export function TopBar() {
  const { activeProject, view } = useProjectStore();
  const { loadResult, isLoading } = useEnvironmentStore();
  const { runScan, state: scanState, showResults } = useScanStore();

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

  const handleScan = () => {
    if (activeProject?.path && scanState !== "scanning") {
      runScan(activeProject.path);
    }
  };

  const showActions = activeProject.status !== "migrationNeeded" && view === "dashboard";

  return (
    <div className="flex items-center px-5 h-12 border-b border-border-light gap-3 bg-surface shrink-0">
      {/* Project title + status */}
      <h1 className="text-[14px] font-semibold text-text tracking-tight">
        {activeProject.name}
      </h1>

      {/* Status indicator */}
      {statusLabel && view === "dashboard" && (
        <div className="flex items-center gap-1.5 text-[12px] text-text-secondary">
          <div className={`w-[6px] h-[6px] rounded-full ${statusDot}`} />
          {statusLabel}
        </div>
      )}

      {/* View label for terminal */}
      {view === "terminal" && (
        <div className="flex items-center gap-1.5 text-[12px] text-text-secondary">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-text-muted">
            <path d="M2.5 3l3 3-3 3M7 9h2.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Terminal
        </div>
      )}

      <div className="flex-1" />

      {showActions && (
        <>
          {/* Scan button */}
          <button
            onClick={handleScan}
            disabled={scanState === "scanning"}
            className={`h-7 px-3 text-[12px] font-medium rounded-md transition-colors cursor-pointer border ${
              showResults
                ? "bg-accent text-white border-accent"
                : "bg-surface text-text-secondary border-border hover:bg-surface-secondary hover:text-text"
            } disabled:opacity-50`}
          >
            {scanState === "scanning" ? (
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 border-[1.5px] border-current border-t-transparent rounded-full animate-spin" />
                Scanning
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 13 13"
                  fill="none"
                  className="shrink-0"
                  aria-hidden="true"
                >
                  <path
                    d="M6.5 1v2m0 7v2m-4-5.5h2m7 0h2M3.26 3.26l1.06 1.06m5.36 5.36l1.06 1.06m0-7.48l-1.06 1.06M4.32 9.68l-1.06 1.06"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                </svg>
                Scan
              </span>
            )}
          </button>
        </>
      )}
    </div>
  );
}
