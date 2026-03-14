import type { MergedVariable } from "@/lib/types";
import { TYPE_BADGE_STYLES, DEFAULT_TYPE_BADGE } from "@/lib/constants";

interface VariableRowProps {
  variable: MergedVariable;
  onSelect?: (variable: MergedVariable) => void;
}

/**
 * Single variable row — macOS list item with hover states and clean typography.
 */
export function VariableRow({ variable, onSelect }: VariableRowProps) {
  const typeBadge = TYPE_BADGE_STYLES[variable.type] ?? DEFAULT_TYPE_BADGE;

  const statusClass = !variable.valid
    ? "bg-danger-light text-danger-dark"
    : variable.sensitive
      ? "bg-accent-light text-accent"
      : "bg-success-light text-success-dark";

  const statusLabel = !variable.valid
    ? variable.errors[0] ?? "error"
    : variable.sensitive
      ? "secret"
      : "valid";

  const displayValue =
    variable.value === null ? (
      <span className="text-danger">— missing</span>
    ) : variable.sensitive ? (
      <span className="text-accent/60">
        {"•".repeat(Math.min(16, variable.value.length || 12))}
      </span>
    ) : (
      variable.value
    );

  return (
    <button
      type="button"
      onClick={() => onSelect?.(variable)}
      className="w-full text-left grid grid-cols-[200px_1fr_80px_90px] px-4 py-2.5 gap-3 items-center hover:bg-surface-secondary/80 active:bg-surface-secondary transition-colors cursor-pointer border-none bg-transparent"
    >
      {/* Key */}
      <div className="font-mono text-[12px] font-medium text-text truncate">
        {variable.key}
      </div>

      {/* Value */}
      <div className="font-mono text-[12px] text-text-secondary truncate">
        {displayValue}
      </div>

      {/* Type badge */}
      <div className="flex items-center gap-1">
        <span
          className="text-[10px] font-medium px-1.5 py-[2px] rounded-md"
          style={{ backgroundColor: typeBadge.bg, color: typeBadge.text }}
        >
          {variable.type}
        </span>
        {!variable.hasSchema && (
          <span
            className="text-[9px] text-text-muted"
            title="Type inferred — not confirmed in .env.schema"
          >
            *
          </span>
        )}
      </div>

      {/* Status badge */}
      <div className="flex justify-end">
        <span
          className={`text-[10px] font-medium px-1.5 py-[2px] rounded-md truncate ${statusClass}`}
        >
          {statusLabel}
        </span>
      </div>
    </button>
  );
}
