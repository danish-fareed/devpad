import { useEnvironmentStore } from "@/stores/environmentStore";

const FILTERS = [
  { key: "all" as const, label: "All" },
  { key: "secrets" as const, label: "Secrets" },
  { key: "errors" as const, label: "Errors" },
  { key: "required" as const, label: "Required" },
];

/**
 * macOS-style segmented filter pills for the variable list.
 */
export function VariableFilters() {
  const { filter, setFilter } = useEnvironmentStore();

  return (
    <div className="flex bg-surface-tertiary rounded-lg p-[2px] gap-0.5">
      {FILTERS.map((f) => (
        <button
          key={f.key}
          onClick={() => setFilter(f.key)}
          className={`text-[11px] font-medium px-2.5 py-[3px] rounded-md transition-all cursor-pointer border-none ${
            filter === f.key
              ? "bg-surface text-text shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
              : "bg-transparent text-text-secondary hover:text-text"
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
