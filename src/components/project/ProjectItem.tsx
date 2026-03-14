import type { Project } from "@/lib/types";
import { STATUS_COLORS } from "@/lib/constants";

interface ProjectItemProps {
  project: Project;
  isActive: boolean;
  onClick: () => void;
}

/** Folder icon color pairs based on project name hash */
const FOLDER_COLORS = [
  { folder: "#0A84FF", tint: "#E8F2FF" },
  { folder: "#34C759", tint: "#E8FAE9" },
  { folder: "#FF9500", tint: "#FFF4E5" },
  { folder: "#AF52DE", tint: "#F3EDFF" },
  { folder: "#FF3B30", tint: "#FFEDED" },
];

/**
 * Single project row — macOS sidebar source list item with folder icon.
 */
export function ProjectItem({ project, isActive, onClick }: ProjectItemProps) {
  const colorIndex =
    project.name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) %
    FOLDER_COLORS.length;
  const folderColor = FOLDER_COLORS[colorIndex]!;
  const statusColor = STATUS_COLORS[project.status];

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2.5 px-2.5 py-[7px] cursor-pointer transition-all w-full text-left rounded-lg border-none ${
        isActive
          ? "bg-accent text-white shadow-[0_1px_3px_rgba(10,132,255,0.25)]"
          : "bg-transparent text-text hover:bg-sidebar-hover"
      }`}
    >
      {/* Folder icon */}
      <div
        className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
        style={{
          backgroundColor: isActive ? "rgba(255,255,255,0.2)" : folderColor.tint,
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          style={{ color: isActive ? "white" : folderColor.folder }}
        >
          <path
            d="M1.5 4V10.5C1.5 11.0523 1.94772 11.5 2.5 11.5H11.5C12.0523 11.5 12.5 11.0523 12.5 10.5V5.5C12.5 4.94772 12.0523 4.5 11.5 4.5H7.5L6 3H2.5C1.94772 3 1.5 3.44772 1.5 4Z"
            stroke="currentColor"
            strokeWidth="1.1"
            strokeLinejoin="round"
            fill="currentColor"
            fillOpacity="0.12"
          />
        </svg>
      </div>

      {/* Name and path */}
      <div className="overflow-hidden flex-1 min-w-0">
        <div
          className={`text-[13px] font-medium truncate ${
            isActive ? "text-white" : "text-text"
          }`}
        >
          {project.name}
        </div>
        <div
          className={`text-[11px] truncate ${
            isActive ? "text-white/60" : "text-text-muted"
          }`}
        >
          {project.path.split(/[\\/]/).slice(-2).join("/")}
        </div>
      </div>

      {/* Status dot */}
      <div
        className="w-[7px] h-[7px] rounded-full shrink-0"
        style={{
          backgroundColor: isActive ? "rgba(255,255,255,0.5)" : statusColor,
        }}
      />
    </button>
  );
}
