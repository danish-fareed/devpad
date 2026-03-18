import { useState, useEffect, useRef, useCallback } from "react";
import { useProjectStore } from "@/stores/projectStore";
import * as commands from "@/lib/commands";
import { X, Folder, Github } from "lucide-react";

interface AddProjectDialogProps {
  onClose: () => void;
}

/**
 * macOS-style sheet dialog for adding a new project.
 */
export function AddProjectDialog({ onClose }: AddProjectDialogProps) {
  const addProject = useProjectStore((s) => s.addProject);
  const cloneProjectFromGithub = useProjectStore((s) => s.cloneProjectFromGithub);
  const [mode, setMode] = useState<"local" | "clone">("local");
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [cloneUrl, setCloneUrl] = useState("");
  const [cloneDestinationParent, setCloneDestinationParent] = useState<string | null>(null);
  const [cloneFolderName, setCloneFolderName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [picking, setPicking] = useState(false);
  const [pickingCloneDest, setPickingCloneDest] = useState(false);

  const dialogRef = useRef<HTMLDivElement>(null);
  const firstFocusRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    firstFocusRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleFocusTrap = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const focusable = dialog.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleFocusTrap);
    return () => document.removeEventListener("keydown", handleFocusTrap);
  }, []);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

  const handlePickDirectory = async () => {
    setPicking(true);
    try {
      const path = await commands.pickDirectory();
      if (path) {
        setSelectedPath(path);
        setError(null);
      }
    } catch (e) {
      setError(String(e));
    } finally {
      setPicking(false);
    }
  };

  const handlePickCloneDestination = async () => {
    setPickingCloneDest(true);
    try {
      const path = await commands.pickDirectory();
      if (path) {
        setCloneDestinationParent(path);
        setError(null);
      }
    } catch (e) {
      setError(String(e));
    } finally {
      setPickingCloneDest(false);
    }
  };

  const inferRepoFolder = (url: string): string => {
    const trimmed = url.trim().replace(/\/+$/, "");
    if (!trimmed) return "";

    if (trimmed.startsWith("git@github.com:")) {
      const sshTail = trimmed.slice("git@github.com:".length);
      const seg = sshTail.split("/").pop() ?? "";
      return seg.replace(/\.git$/, "");
    }

    const seg = trimmed.split("/").pop() ?? "";
    return seg.replace(/\.git$/, "");
  };

  const isGithubUrl = (value: string): boolean => {
    const v = value.trim().toLowerCase();
    return (
      v.startsWith("https://github.com/") ||
      v.startsWith("http://github.com/") ||
      v.startsWith("git@github.com:") ||
      v.startsWith("ssh://git@github.com/")
    );
  };

  const resolvedCloneFolder = cloneFolderName.trim() || inferRepoFolder(cloneUrl);

  const canSubmitLocal = Boolean(selectedPath) && !loading;
  const canSubmitClone =
    isGithubUrl(cloneUrl) &&
    Boolean(cloneDestinationParent) &&
    Boolean(resolvedCloneFolder.trim()) &&
    !loading;

  const handleAdd = async () => {
    setLoading(true);
    setError(null);
    try {
      if (mode === "local") {
        if (!selectedPath) return;
        await addProject(selectedPath);
      } else {
        if (!canSubmitClone || !cloneDestinationParent) return;
        await cloneProjectFromGithub(
          cloneUrl.trim(),
          cloneDestinationParent,
          cloneFolderName.trim() || undefined,
        );
      }
      onClose();
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-project-title"
      onClick={handleBackdropClick}
    >
      <div
        ref={dialogRef}
        className="bg-surface rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.2),0_0_0_1px_rgba(0,0,0,0.08)] w-full max-w-md mx-4 animate-scale-in"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-border-light flex items-center justify-between">
          <h2 id="add-project-title" className="text-[15px] font-bold text-text">
            Add Project
          </h2>
          <button
            ref={firstFocusRef}
            onClick={onClose}
            aria-label="Close dialog"
            className="w-6 h-6 rounded-md flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-tertiary transition-colors cursor-pointer border-none bg-transparent"
          >
            <X size={12} strokeWidth={1.5} aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5">
          <div className="mb-4 rounded-xl bg-surface-secondary p-1 border border-border-light flex gap-1">
            <button
              onClick={() => {
                setMode("local");
                setError(null);
              }}
              className={`flex-1 h-8 rounded-lg text-[12px] font-medium border-none cursor-pointer transition-colors ${
                mode === "local"
                  ? "bg-surface text-text shadow-sm"
                  : "bg-transparent text-text-secondary hover:text-text"
              }`}
            >
              Local Folder
            </button>
            <button
              onClick={() => {
                setMode("clone");
                setError(null);
              }}
              className={`flex-1 h-8 rounded-lg text-[12px] font-medium border-none cursor-pointer transition-colors flex items-center justify-center gap-1.5 ${
                mode === "clone"
                  ? "bg-surface text-text shadow-sm"
                  : "bg-transparent text-text-secondary hover:text-text"
              }`}
            >
              <Github size={12} />
              Clone GitHub
            </button>
          </div>

          {mode === "local" ? (
            <>
              <p className="text-[13px] text-text-secondary mb-4 leading-5">
                Select a project directory that contains (or will contain) a
                .env.schema file.
              </p>

              <button
                onClick={handlePickDirectory}
                disabled={loading || picking}
                className="w-full border border-dashed border-border rounded-xl py-5 text-center hover:border-accent hover:bg-accent-light/30 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed bg-surface-sunken"
              >
                {selectedPath ? (
                  <div>
                    <p className="text-[13px] font-medium text-text mb-0.5">
                      {selectedPath.split(/[\\/]/).pop()}
                    </p>
                    <p className="text-[11px] text-text-muted">{selectedPath}</p>
                  </div>
                ) : (
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-accent-light flex items-center justify-center mx-auto mb-2">
                      <Folder
                        size={18}
                        strokeWidth={1.2}
                        className="text-accent"
                        aria-hidden="true"
                      />
                    </div>
                    <p className="text-[13px] font-medium text-text mb-0.5">
                      {picking ? "Opening folder picker..." : "Choose directory"}
                    </p>
                    <p className="text-[11px] text-text-muted">
                      Select your project folder
                    </p>
                  </div>
                )}
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-text-secondary mb-1">
                  GitHub Repository URL
                </label>
                <input
                  type="text"
                  value={cloneUrl}
                  onChange={(e) => {
                    setCloneUrl(e.target.value);
                    setError(null);
                  }}
                  placeholder="https://github.com/org/repo"
                  className="w-full h-9 px-3 rounded-lg border border-border-light bg-surface text-[12px] text-text placeholder:text-text-muted outline-none focus:border-accent"
                />
                {cloneUrl.trim().length > 0 && !isGithubUrl(cloneUrl) && (
                  <p className="mt-1 text-[11px] text-warning">
                    Enter a valid GitHub URL (https://github.com/... or git@github.com:...)
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-text-secondary mb-1">
                  Destination Folder
                </label>
                <button
                  onClick={handlePickCloneDestination}
                  disabled={loading || pickingCloneDest}
                  className="w-full h-10 px-3 rounded-lg border border-border-light bg-surface text-[12px] text-left text-text hover:border-accent transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cloneDestinationParent
                    ? cloneDestinationParent
                    : (pickingCloneDest ? "Opening folder picker..." : "Choose destination parent folder")}
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-text-secondary mb-1">
                  Project Folder Name (optional)
                </label>
                <input
                  type="text"
                  value={cloneFolderName}
                  onChange={(e) => {
                    setCloneFolderName(e.target.value);
                    setError(null);
                  }}
                  placeholder={inferRepoFolder(cloneUrl) || "repo-name"}
                  className="w-full h-9 px-3 rounded-lg border border-border-light bg-surface text-[12px] text-text placeholder:text-text-muted outline-none focus:border-accent"
                />
                <p className="mt-1 text-[11px] text-text-muted">
                  Final path: {cloneDestinationParent ?? "<destination>"}/{resolvedCloneFolder || "<repo-name>"}
                </p>
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div
              className="mt-3 bg-danger-light text-danger-dark text-[12px] px-3 py-2 rounded-lg"
              role="alert"
            >
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-border-light flex justify-end gap-2">
          <button
            onClick={onClose}
            className="h-10 px-4 text-[13px] font-medium text-text border border-border rounded-xl hover:bg-surface-secondary transition-colors cursor-pointer bg-surface"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={mode === "local" ? !canSubmitLocal : !canSubmitClone}
            className="h-10 px-4 text-[13px] font-bold text-white bg-accent border border-accent rounded-xl hover:bg-accent-dark disabled:opacity-50 transition-colors cursor-pointer"
          >
            {loading ? (mode === "clone" ? "Cloning..." : "Adding...") : (mode === "clone" ? "Clone & Add Project" : "Add Project")}
          </button>
        </div>
      </div>
    </div>
  );
}
