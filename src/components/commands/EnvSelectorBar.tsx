import { useProjectStore } from "@/stores/projectStore";
import { useEnvironmentStore } from "@/stores/environmentStore";
import { useCommandStore } from "@/stores/commandStore";
import { useState } from "react";
import { ChevronDown, Layers3 } from "lucide-react";

export function EnvSelectorBar() {
  const { activeProject } = useProjectStore();
  const { activeEnv, setActiveEnv, loadResult } = useEnvironmentStore();
  const scan = useCommandStore((s) => s.scan);
  const selectedNodeId = useCommandStore((s) => s.selectedNodeId);
  const selectedScopePath = useCommandStore((s) => s.selectedScopePath);
  const setSelectedScopePath = useCommandStore((s) => s.setSelectedScopePath);
  const running = useCommandStore((s) => s.running);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showScopeDropdown, setShowScopeDropdown] = useState(false);

  if (!activeProject) return null;

  const envs = activeProject.environments || [];
  const currentEnv = activeEnv || envs[0] || "development";
  const envTier = scan?.envTier || "none";
  const scopes = scan?.envScopes ?? [];
  const isRootView = Boolean(scan && selectedNodeId === scan.rootNodeId);
  const selectedNode = scan?.nodes.find((n) => n.id === selectedNodeId);
  const fixedChildScope = !isRootView ? selectedNode?.relPath ?? "." : null;
  const isPlainRootDotenv = scopes.some(
    (s) => s.scopePath === "." && s.isPlainDotenv,
  );
  const activeScopeLabel =
    !isRootView && fixedChildScope
      ? fixedChildScope
      : selectedScopePath === "all"
        ? "All scopes"
        : selectedScopePath;
  const runningCount = Object.values(running).filter(
    (r) => r.status === "running",
  ).length;
  const vaultRefCount = loadResult?.variables?.filter((v) => v.isVaultRef).length ?? 0;

  // Env dot color
  const dotColor =
    loadResult?.valid === true
      ? "bg-success"
      : loadResult?.valid === false
        ? loadResult.errorCount > 0
          ? "bg-danger"
          : "bg-warning"
        : "bg-text-muted";

  return (
    <div className="rounded-lg border border-border-light bg-surface-secondary/40 px-3 py-2">
      <div className="flex items-center gap-2.5 flex-wrap">
        <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider shrink-0">Scope</span>

        {isRootView && scopes.length > 1 ? (
          <div className="relative">
            <button
              onClick={() => setShowScopeDropdown((v) => !v)}
              className="h-7 px-2.5 rounded-lg border border-border-light bg-surface text-[11px] text-text flex items-center gap-1.5 hover:border-accent transition-colors cursor-pointer"
            >
              <Layers3 size={12} className="text-text-muted" />
              <span>{activeScopeLabel}</span>
              <ChevronDown size={10} className="text-text-muted" />
            </button>

            {showScopeDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowScopeDropdown(false)} />
                <div className="absolute top-full left-0 mt-1 bg-surface border border-border-light rounded-xl shadow-lg z-50 min-w-[190px] py-1 animate-fade-in">
                  <button
                    onClick={() => {
                      setSelectedScopePath("all");
                      setShowScopeDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-[12px] transition-colors cursor-pointer border-none bg-transparent flex items-center gap-2 ${selectedScopePath === "all" ? "text-accent font-medium bg-accent/5" : "text-text hover:bg-surface-secondary"}`}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full ${selectedScopePath === "all" ? "bg-accent" : "bg-text-muted/30"}`} />
                    All scopes
                  </button>
                  {scopes.map((scope) => (
                    <button
                      key={scope.scopePath}
                      onClick={() => {
                        setSelectedScopePath(scope.scopePath);
                        setShowScopeDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-[12px] transition-colors cursor-pointer border-none bg-transparent flex items-center gap-2 ${selectedScopePath === scope.scopePath ? "text-accent font-medium bg-accent/5" : "text-text hover:bg-surface-secondary"}`}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full ${selectedScopePath === scope.scopePath ? "bg-accent" : "bg-text-muted/30"}`} />
                      {scope.scopePath}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="h-7 px-2.5 rounded-lg border border-border-light bg-surface text-[11px] text-text flex items-center gap-1.5">
            <Layers3 size={12} className="text-text-muted" />
            <span>{activeScopeLabel}</span>
          </div>
        )}

        <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider shrink-0 ml-1">Environment</span>

        <div className="relative">
          <button
            onClick={() => {
              if (!isPlainRootDotenv) {
                setShowDropdown(!showDropdown);
              }
            }}
            className={`h-7 px-2.5 rounded-lg border border-border-light bg-surface text-[11px] flex items-center gap-1.5 transition-colors ${isPlainRootDotenv ? "opacity-70 cursor-not-allowed" : "hover:border-accent cursor-pointer"}`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
            <span className="font-medium text-text">{currentEnv}</span>
            {!isPlainRootDotenv && <ChevronDown size={10} strokeWidth={1.2} className="opacity-50" />}
          </button>

          {showDropdown && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
              <div className="absolute top-full left-0 mt-1 bg-surface border border-border-light rounded-xl shadow-lg z-50 min-w-[160px] py-1 animate-fade-in">
                {envs.map((env) => (
                  <button
                    key={env}
                    onClick={() => {
                      setActiveEnv(env);
                      setShowDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-[12px] hover:bg-surface-secondary transition-colors cursor-pointer border-none bg-transparent flex items-center gap-2 ${env === currentEnv ? "text-accent font-medium" : "text-text"}`}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full ${env === currentEnv ? "bg-accent" : "bg-text-muted/30"}`} />
                    {env}
                  </button>
                ))}
                {envs.length === 0 && <div className="px-3 py-2 text-[11px] text-text-muted">No environments found</div>}
              </div>
            </>
          )}
        </div>

        <div className="flex-1" />

        {loadResult && (
          <span className="text-[11px] text-text-secondary">
            {loadResult.variables?.length ?? 0} vars
            {vaultRefCount > 0 && <span> · {vaultRefCount} vault secret{vaultRefCount !== 1 ? "s" : ""}</span>}
            {loadResult.warningCount > 0 && <span className="text-warning"> · {loadResult.warningCount} warning{loadResult.warningCount !== 1 ? "s" : ""}</span>}
          </span>
        )}

        {envTier === "varlock" && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-accent-light text-accent font-medium">varlock</span>}
        {envTier === "dotenv" && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-surface-tertiary text-text-muted font-medium">.env</span>}

        {runningCount > 0 && (
          <span className="flex items-center gap-1 text-[11px] text-success-dark">
            <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-soft" />
            {runningCount} running
          </span>
        )}
      </div>
    </div>
  );
}
