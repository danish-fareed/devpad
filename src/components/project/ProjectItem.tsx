import type { Project } from "@/lib/types";
import { STATUS_COLORS } from "@/lib/constants";

interface ProjectItemProps {
  project: Project;
  isActive: boolean;
  isPinned?: boolean;
  onPin?: () => void;
  onUnpin?: () => void;
  onClick: () => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
}

import { Pin } from "lucide-react";

/**
 * Single project row — macOS sidebar source list item with folder icon.
 * Uses a <div> with role="button" to avoid nested <button> HTML violations.
 */
export function ProjectItem({ 
  project, 
  isActive, 
  isPinned, 
  onPin, 
  onUnpin, 
  onClick,
  draggable,
  onDragStart,
  onDragOver,
  onDrop
}: ProjectItemProps) {
  const statusColor = STATUS_COLORS[project.status];

  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className="group relative"
    >
      <div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onClick(); }}
        className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-all w-full text-left rounded-xl border ${
          isActive
            ? "bg-accent/10 border-accent/20"
            : "bg-transparent border-transparent hover:bg-surface-tertiary"
        }`}
      >
        {/* Folder icon */}
        <div className="w-5 h-5 flex items-center justify-center shrink-0">
          <svg
            width="18"
            height="18"
            viewBox="0 0 14 14"
            fill="none"
            className={isActive ? "text-text" : "text-text-muted"}
          >
            <path
              d="M1.5 4V10.5C1.5 11.0523 1.94772 11.5 2.5 11.5H11.5C12.0523 11.5 12.5 11.0523 12.5 10.5V5.5C12.5 4.94772 12.0523 4.5 11.5 4.5H7.5L6 3H2.5C1.94772 3 1.5 3.44772 1.5 4Z"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Name */}
        <div className="overflow-hidden flex-1 min-w-0 flex flex-col justify-center">
          <div
            className={`text-[14px] truncate ${
              isActive ? "text-text font-semibold" : "text-text font-medium"
            }`}
          >
            {project.name}
          </div>
        </div>

        {/* Status dot or pin toggle */}
        <div className="flex items-center gap-1.5 shrink-0">
          {!isActive && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                isPinned ? onUnpin?.() : onPin?.();
              }}
              className={`p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-surface-secondary cursor-pointer border-none bg-transparent flex items-center justify-center ${
                isPinned ? "text-accent opacity-100" : "text-text-muted"
              }`}
              title={isPinned ? "Unpin project" : "Pin project"}
            >
              <Pin size={12} fill={isPinned ? "currentColor" : "none"} />
            </button>
          )}
          <div
            className="w-[7px] h-[7px] rounded-full"
            style={{
              backgroundColor: statusColor,
            }}
          />
        </div>
      </div>
    </div>
  );
}
