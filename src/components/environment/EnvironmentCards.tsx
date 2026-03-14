import { useEffect, useRef } from "react";
import { useProjectStore } from "@/stores/projectStore";
import { useEnvironmentStore } from "@/stores/environmentStore";
import { useFileWatcher } from "@/hooks/useFileWatcher";
import { EnvironmentCard } from "./EnvironmentCard";

/**
 * Grid of environment cards — macOS-style clean card layout.
 */
export function EnvironmentCards() {
  const activeProject = useProjectStore((s) => s.activeProject);
  const { activeEnv, loadResult, isLoading, error, loadEnvironment, setActiveEnv } =
    useEnvironmentStore();

  useFileWatcher(activeProject?.id, activeProject?.path);

  const loadIdRef = useRef(0);

  useEffect(() => {
    if (activeProject) {
      const loadId = ++loadIdRef.current;
      loadEnvironment(activeProject.path).catch(() => {});
      void loadId;
    }
  }, [activeProject, loadEnvironment]);

  if (!activeProject) return null;
  if (activeProject.status === "migrationNeeded") return null;

  const environments = activeProject.environments;

  const handleEnvSelect = (env: string) => {
    setActiveEnv(env);
    if (activeProject) {
      loadEnvironment(activeProject.path, env);
    }
  };

  return (
    <div>
      <h3 className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-3">
        Environments
      </h3>

      {error && (
        <div className="bg-danger-light text-danger-dark text-[12px] px-3 py-2.5 rounded-lg mb-3">
          {error}
        </div>
      )}

      {environments.length === 0 && !isLoading && (
        <div className="text-[13px] text-text-muted py-6 text-center">
          No environments found in this project.
        </div>
      )}

      {isLoading && !loadResult && (
        <div className="text-[13px] text-text-muted py-6 text-center animate-pulse-soft">
          Loading environments...
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        {environments.map((env, i) => (
          <EnvironmentCard
            key={env}
            envName={env}
            isActive={activeEnv === env}
            isLoading={isLoading && activeEnv === env}
            variableCount={
              activeEnv === env ? loadResult?.variables.length ?? 0 : 0
            }
            secretCount={
              activeEnv === env
                ? loadResult?.variables.filter((v) => v.sensitive).length ?? 0
                : 0
            }
            valid={activeEnv === env ? loadResult?.valid ?? null : null}
            onSelect={() => handleEnvSelect(env)}
            style={{ animationDelay: `${i * 40}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
