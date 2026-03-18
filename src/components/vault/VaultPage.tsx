import { useState, useEffect } from "react";
import { useVaultStore } from "@/stores/vaultStore";
import { useProjectStore } from "@/stores/projectStore";
import { SetupWizard } from "./SetupWizard";
import { SecretGenerator } from "./SecretGenerator";
import { AiContextPanel } from "./AiContextPanel";
import { TeamSyncPanel } from "./TeamSyncPanel";
import { Shield, Lock, Unlock, Activity, Plus, Folder, EyeOff, Eye, Copy, Share2, X, Check } from "lucide-react";
import type { VaultVariable, Project } from "@/lib/types";
import { vaultGetSharedTargets } from "@/lib/vault";

export function VaultPage() {
  const { status, lock, globalVariables, loadAllGlobalVariables, loading } = useVaultStore();
  const { projects } = useProjectStore();
  const [activeTab, setActiveTab] = useState<string>("vault");

  useEffect(() => {
    if (status?.unlocked && projects.length > 0) {
      loadAllGlobalVariables(projects);
    }
  }, [status?.unlocked, projects, loadAllGlobalVariables]);

  const tabs = [
    { id: "vault", label: "Overview" },
    { id: "import", label: "Import Secrets" },
    { id: "generate", label: "Generator" },
    { id: "ai-context", label: "AI Context" },
    { id: "team-sync", label: "Team Sync" },
  ];

  return (
    <div className="flex-1 overflow-auto p-6 bg-surface">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center shadow-sm">
              <Shield size={24} strokeWidth={1.5} className="text-accent" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-text">Vault</h1>
              <p className="text-sm text-text-secondary">
                {status?.unlocked ? "Securely storing your environment variables" : "Vault locked"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {status?.unlocked && (
              <button
                onClick={lock}
                className="px-4 py-2 rounded-lg bg-transparent border border-border-light text-text-secondary text-sm font-medium hover:bg-surface-secondary transition-all cursor-pointer flex items-center gap-2"
              >
                <Lock size={14} />
                Lock Vault
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-1 mb-8 border-b border-border-light pb-px">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-[13px] font-medium rounded-t-lg cursor-pointer border-none transition-all ${
                activeTab === tab.id
                  ? "bg-surface-secondary text-accent border-b-2 border-accent"
                  : "bg-transparent text-text-muted hover:text-text hover:bg-surface-secondary/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="animate-fade-in">
          {activeTab === "vault" && (
            <div className="space-y-8">
              <VaultOverview />
              <div className="h-px bg-border-light" />
              <GlobalSecretsList 
                globalVariables={globalVariables} 
                projects={projects} 
                loading={loading}
              />
            </div>
          )}
          {activeTab === "import" && <SetupWizard />}
          {activeTab === "generate" && <SecretGenerator />}
          {activeTab === "ai-context" && <AiContextPanel />}
          {activeTab === "team-sync" && <TeamSyncPanel />}
        </div>
      </div>
    </div>
  );
}

function VaultOverview() {
  const { status } = useVaultStore();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-surface-secondary rounded-2xl p-6 border border-border-light shadow-sm">
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${status?.unlocked ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
             {status?.unlocked ? (
               <Unlock size={20} />
             ) : (
               <Lock size={20} />
             )}
          </div>
          <div>
            <span className="text-text-muted text-[11px] uppercase tracking-wider font-semibold">Security Status</span>
            <p className="text-text font-medium mt-0.5">
              {status?.unlocked ? "Vault Unlocked" : "Vault Locked"}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-surface-secondary rounded-2xl p-6 border border-border-light shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
            <Activity size={20} />
          </div>
          <div>
            <span className="text-text-muted text-[11px] uppercase tracking-wider font-semibold">Encryption Engine</span>
            <p className="text-text font-medium mt-0.5">XChaCha20-Poly1305</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function GlobalSecretsList({ 
  globalVariables, 
  projects, 
  loading 
}: { 
  globalVariables: Record<string, VaultVariable[]>, 
  projects: any[],
  loading: boolean
}) {
  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin mx-auto mb-4" />
        <p className="text-sm text-text-muted">Loading secrets from all projects...</p>
      </div>
    );
  }

  const projectIds = Object.keys(globalVariables).filter(id => {
    const vars = globalVariables[id];
    return vars && vars.length > 0;
  });

  if (projectIds.length === 0) {
    return (
      <div className="py-20 text-center bg-surface-secondary/50 rounded-2xl border border-border-light border-dashed">
        <div className="w-12 h-12 rounded-full bg-surface-tertiary flex items-center justify-center mx-auto mb-4">
          <Plus size={24} strokeWidth={1.5} className="text-text-muted" />
        </div>
        <h3 className="text-[15px] font-medium text-text mb-1">No secrets stored in Vault</h3>
        <p className="text-sm text-text-secondary">Variables stored in Vault across your projects will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-[11px] font-semibold text-text-muted uppercase tracking-widest">Global Secrets</h2>
      {projectIds.map(projectId => {
        const project = projects.find(p => p.id === projectId);
        const vars = globalVariables[projectId];
        if (!vars || vars.length === 0) return null;
        return (
          <div key={projectId} className="bg-surface rounded-2xl border border-border-light overflow-hidden shadow-sm">
            <div className="px-5 py-3 bg-surface-secondary border-b border-border-light flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-accent/10 flex items-center justify-center text-accent">
                  <Folder size={14} />
                </div>
                <span className="text-[13px] font-semibold text-text">{project?.name || projectId}</span>
              </div>
              <span className="text-[11px] font-medium text-text-muted">{vars.length} secrets</span>
            </div>
            <div className="divide-y divide-border-light">
              {vars.map(v => (
                <SecretRow key={`${projectId}-${v.env}-${v.key}`} variable={v} projectId={projectId} projects={projects} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SecretRow({ variable, projectId, projects }: { variable: VaultVariable; projectId: string; projects: Project[] }) {
  const [revealed, setRevealed] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  return (
    <div className="px-5 py-3 flex items-center justify-between hover:bg-surface-secondary/50 transition-colors group">
      <div className="min-w-0 flex-1 flex items-center gap-4">
        <div className="w-40 shrink-0">
          <span className="font-mono text-xs font-medium text-text truncate block">{variable.key}</span>
          <span className="text-[10px] text-text-muted uppercase tracking-tighter">{variable.env}</span>
        </div>
        <div className="font-mono text-xs text-text-secondary truncate flex-1">
          {revealed ? variable.value : "•".repeat(16)}
        </div>
      </div>
      <div className="flex items-center gap-2 ml-4">
        <button
          onClick={() => setRevealed(!revealed)}
          className="p-1.5 rounded-md hover:bg-surface-tertiary text-text-muted hover:text-text transition-colors cursor-pointer"
          title={revealed ? "Hide secret" : "Reveal secret"}
        >
          {revealed ? (
            <EyeOff size={14} />
          ) : (
            <Eye size={14} />
          )}
        </button>
        <button
          onClick={() => navigator.clipboard.writeText(variable.value)}
          className="p-1.5 rounded-md hover:bg-surface-tertiary text-text-muted hover:text-text transition-colors cursor-pointer"
          title="Copy secret"
        >
           <Copy size={14} />
        </button>
        <button
          onClick={() => setShowShareModal(true)}
          className="p-1.5 rounded-md hover:bg-surface-tertiary text-text-muted hover:text-text transition-colors cursor-pointer"
          title="Share variable"
        >
           <Share2 size={14} />
        </button>
      </div>

      {showShareModal && (
        <ShareVariableModal
          variable={variable}
          projectId={projectId}
          projects={projects}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}

function ShareVariableModal({ 
  variable, 
  projectId, 
  projects, 
  onClose 
}: { 
  variable: VaultVariable; 
  projectId: string; 
  projects: Project[]; 
  onClose: () => void;
}) {
  const { shareVariable, unshareVariable } = useVaultStore();
  const [sharedTargets, setSharedTargets] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Projects that are NOT the source project
  const availableProjects = projects.filter(p => p.id !== projectId);

  useEffect(() => {
    async function fetchTargets() {
      try {
        const targets = await vaultGetSharedTargets(projectId, variable.env, variable.key);
        setSharedTargets(targets);
      } catch (e) {
        setError(String(e));
      } finally {
        setLoading(false);
      }
    }
    fetchTargets();
  }, [projectId, variable]);

  const toggleShare = async (targetId: string) => {
    try {
      const isShared = sharedTargets.includes(targetId);
      if (isShared) {
        await unshareVariable(projectId, variable.env, variable.key, targetId);
        setSharedTargets(prev => prev.filter(id => id !== targetId));
      } else {
        await shareVariable(projectId, variable.env, variable.key, [targetId]);
        setSharedTargets(prev => [...prev, targetId]);
      }
    } catch (e) {
      setError(String(e));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-sm p-4">
      <div className="bg-surface rounded-2xl shadow-xl border border-border-light w-full max-w-md overflow-hidden animate-fade-in">
        <div className="px-5 py-4 border-b border-border-light flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-text">Share Variable</h3>
            <p className="text-xs text-text-secondary mt-0.5 font-mono">{variable.key}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-secondary text-text-muted hover:text-text transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
        
        <div className="p-5 max-h-[60vh] overflow-y-auto">
          <p className="text-xs text-text-secondary mb-4 leading-relaxed">
            Select the projects that should have access to this vault variable. It will appear as if it was defined in their environments.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-danger-light border border-danger/20 rounded-xl text-xs text-danger-dark">
              {error}
            </div>
          )}

          {loading ? (
            <div className="py-8 flex justify-center">
              <div className="w-5 h-5 rounded-full border-2 border-accent border-t-transparent animate-spin" />
            </div>
          ) : availableProjects.length === 0 ? (
            <div className="text-center py-6 text-sm text-text-muted bg-surface-secondary rounded-xl">
              No other projects available to share with.
            </div>
          ) : (
            <div className="space-y-2">
              {availableProjects.map(p => {
                const isShared = sharedTargets.includes(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => toggleShare(p.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                      isShared 
                        ? "bg-accent-light/50 border-accent/30 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]" 
                        : "bg-surface-secondary/50 border-border-light hover:bg-surface-secondary"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isShared ? 'bg-accent text-white' : 'bg-surface border border-border-light text-text-muted'}`}>
                        <Folder size={14} />
                      </div>
                      <div>
                        <div className={`text-[13px] font-medium ${isShared ? 'text-accent-dark' : 'text-text'}`}>
                          {p.name}
                        </div>
                        <div className="text-[10px] text-text-muted mt-0.5 truncate max-w-[200px]">
                          {p.path.split(/[\\/]/).slice(-2).join("/")}
                        </div>
                      </div>
                    </div>
                    {isShared && (
                      <div className="w-5 h-5 rounded-full bg-accent text-white flex items-center justify-center shadow-sm">
                        <Check size={12} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-border-light bg-surface-secondary/50">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-surface border border-border-light rounded-xl text-sm font-medium text-text hover:bg-surface-secondary transition-colors cursor-pointer shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
