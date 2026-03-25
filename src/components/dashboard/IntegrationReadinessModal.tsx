import { Icon } from "@iconify/react";
import { X } from "lucide-react";
import type { ProjectScan } from "@/lib/types";

type LevelStatus = "yes" | "partial" | "no" | "na";

interface IntegrationRow {
  id: string;
  label: string;
  icon: string;
  detected: LevelStatus;
  runnable: LevelStatus;
  autoPrepared: LevelStatus;
  fullyIntegrated: LevelStatus;
}

const LEVEL_LABELS: Record<LevelStatus, string> = {
  yes: "Yes",
  partial: "Partial",
  no: "No",
  na: "N/A",
};

const LEVEL_STYLES: Record<LevelStatus, string> = {
  yes: "bg-success-light text-success-dark border-success/20",
  partial: "bg-warning-light text-warning-dark border-warning/20",
  no: "bg-surface-secondary text-text-muted border-border-light",
  na: "bg-surface-secondary text-text-muted border-border-light",
};

function hasStack(scan: ProjectScan | null, name: string): boolean {
  return Boolean(scan?.techStack?.includes(name));
}

function buildRows(scan: ProjectScan | null): IntegrationRow[] {
  const rows: IntegrationRow[] = [];
  const hasCloudJobs = Boolean(scan?.commands?.some((command) => command.commandType === "cloud-job"));

  if (hasStack(scan, "Node.js")) {
    rows.push({
      id: "node",
      label: "Node.js (Next/Vite/Expo)",
      icon: "logos:nodejs-icon",
      detected: "yes",
      runnable: "yes",
      autoPrepared: "yes",
      fullyIntegrated: "partial",
    });
  }

  if (hasStack(scan, "Python")) {
    rows.push({
      id: "python",
      label: "Python (FastAPI/Flask/Django)",
      icon: "logos:python",
      detected: "yes",
      runnable: "yes",
      autoPrepared: "yes",
      fullyIntegrated: "partial",
    });
  }

  if (hasStack(scan, "Docker")) {
    rows.push({
      id: "docker",
      label: "Docker Compose",
      icon: "logos:docker-icon",
      detected: "yes",
      runnable: "yes",
      autoPrepared: "partial",
      fullyIntegrated: "partial",
    });
  }

  if (hasCloudJobs) {
    rows.push({
      id: "cloud-jobs",
      label: "Cloud Jobs (EAS/Vercel)",
      icon: "logos:vercel-icon",
      detected: "yes",
      runnable: "yes",
      autoPrepared: "na",
      fullyIntegrated: "no",
    });
  }

  if (hasStack(scan, "Rust")) {
    rows.push({
      id: "rust",
      label: "Rust",
      icon: "logos:rust",
      detected: "yes",
      runnable: "partial",
      autoPrepared: "no",
      fullyIntegrated: "no",
    });
  }

  if (hasStack(scan, "Go")) {
    rows.push({
      id: "go",
      label: "Go",
      icon: "logos:go",
      detected: "yes",
      runnable: "partial",
      autoPrepared: "no",
      fullyIntegrated: "no",
    });
  }

  if (scan?.envTier === "varlock") {
    rows.push({
      id: "varlock",
      label: "Varlock Environment Engine",
      icon: "mdi:shield-key-outline",
      detected: "yes",
      runnable: "yes",
      autoPrepared: "yes",
      fullyIntegrated: "partial",
    });
  } else if (scan?.envTier === "dotenv") {
    rows.push({
      id: "dotenv",
      label: "Dotenv Environment Engine",
      icon: "simple-icons:dotenv",
      detected: "yes",
      runnable: "yes",
      autoPrepared: "partial",
      fullyIntegrated: "partial",
    });
  } else {
    rows.push({
      id: "no-env",
      label: "No Environment Overlay",
      icon: "mdi:variable-off",
      detected: "yes",
      runnable: "yes",
      autoPrepared: "na",
      fullyIntegrated: "partial",
    });
  }

  return rows;
}

function LevelBadge({ value }: { value: LevelStatus }) {
  return (
    <span
      className={`text-[10px] px-2 py-0.5 rounded-md border font-medium ${LEVEL_STYLES[value]}`}
      title={LEVEL_LABELS[value]}
    >
      {LEVEL_LABELS[value]}
    </span>
  );
}

interface IntegrationReadinessModalProps {
  scan: ProjectScan | null;
  projectName: string;
  onClose: () => void;
}

export function IntegrationReadinessModal({ scan, projectName, onClose }: IntegrationReadinessModalProps) {
  const rows = buildRows(scan);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-2xl bg-surface rounded-xl shadow-2xl overflow-hidden border border-border-light animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-light bg-surface-secondary/50">
          <div>
            <h2 className="text-[15px] font-semibold text-text">Integration Readiness</h2>
            <p className="text-[11px] text-text-muted mt-0.5">{projectName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md text-text-muted hover:bg-surface hover:text-text transition-colors cursor-pointer border-none bg-transparent"
          >
            <X size={14} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 max-h-[60vh] overflow-y-auto">
          {/* Legend */}
          <div className="flex items-center gap-4 mb-4 pb-4 border-b border-border-light">
            <span className="text-[10px] text-text-muted font-medium uppercase tracking-wider">Levels:</span>
            <div className="flex items-center gap-3 text-[10px] text-text-secondary">
              <span>Detected</span>
              <span className="text-text-muted">/</span>
              <span>Runnable</span>
              <span className="text-text-muted">/</span>
              <span>Auto-Prepared</span>
              <span className="text-text-muted">/</span>
              <span>Fully Integrated</span>
            </div>
          </div>

          {/* Integration Rows */}
          {rows.length === 0 ? (
            <div className="py-8 text-center">
              <div className="w-12 h-12 rounded-full bg-surface-secondary flex items-center justify-center mx-auto mb-3">
                <Icon icon="mdi:puzzle-outline" className="w-6 h-6 text-text-muted" />
              </div>
              <p className="text-[13px] text-text-secondary">No integrations detected for this project.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {rows.map((row) => (
                <div
                  key={row.id}
                  className="rounded-lg border border-border-light bg-surface-secondary/30 px-3 py-2.5 flex items-center gap-3 hover:bg-surface-secondary/50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-surface border border-border-light flex items-center justify-center shrink-0">
                    <Icon icon={row.icon} className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 text-[13px] font-medium text-text truncate flex-1">{row.label}</div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <LevelBadge value={row.detected} />
                    <LevelBadge value={row.runnable} />
                    <LevelBadge value={row.autoPrepared} />
                    <LevelBadge value={row.fullyIntegrated} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer info */}
          <div className="mt-5 pt-4 border-t border-border-light">
            <p className="text-[11px] text-text-muted leading-relaxed">
              Integration readiness shows how well each detected stack is supported. Visit the{" "}
              <span className="text-accent font-medium">Integrations</span> page in the sidebar to see all available integrations.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border-light bg-surface-secondary/30 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-[12px] font-medium bg-surface border border-border-light text-text hover:bg-surface-secondary transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
