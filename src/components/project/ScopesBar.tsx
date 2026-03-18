import { useMemo, useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useProjectStore } from "@/stores/projectStore";
import { useCommandStore } from "@/stores/commandStore";
import { CircleDot, GripHorizontal, Layers } from "lucide-react";
import type { ProjectNode } from "@/lib/types";

interface ScopePillProps {
  node: ProjectNode;
  selected: boolean;
  onSelect: () => void;
  isDragging: boolean;
}

function ScopePill({ node, selected, onSelect, isDragging }: ScopePillProps) {
  const sortable = useSortable({ id: node.id });
  const style = {
    transform: CSS.Transform.toString(sortable.transform),
    transition: sortable.transition,
  };

  const runtimeText = node.runtimes
    .map((runtime) => {
      if (runtime === "docker-compose") return "docker";
      return runtime;
    })
    .slice(0, 1)
    .join("");

  return (
    <div
      ref={sortable.setNodeRef}
      style={style}
      className={`group flex items-center h-8 pl-1.5 pr-3 rounded-full border cursor-pointer transition-colors shadow-sm whitespace-nowrap shrink-0 ${
        selected
          ? "bg-accent/10 border-accent/20"
          : "bg-surface hover:bg-surface-secondary border-border-light hover:border-border shadow-none"
      } ${isDragging ? "opacity-60 z-10 scale-[1.02] shadow-md bg-surface-secondary" : "opacity-100"}`}
      onClick={onSelect}
    >
      <div
        className={`shrink-0 w-6 h-6 flex items-center justify-center rounded-full cursor-grab active:cursor-grabbing mr-1 transition-colors ${selected ? "text-accent/70 hover:text-accent hover:bg-accent/10" : "text-text-muted/50 hover:text-text-muted hover:bg-surface-tertiary"}`}
        {...sortable.attributes}
        {...sortable.listeners}
        onClick={(e) => e.stopPropagation()}
        aria-label={`Reorder scope ${node.name}`}
      >
        <GripHorizontal size={12} />
      </div>
      
      <CircleDot size={10} className={`shrink-0 mr-1.5 ${selected ? "text-accent" : "text-text-muted/70 group-hover:text-text-muted"}`} />
      
      <span className={`text-[12px] font-medium leading-none transition-colors ${selected ? "text-accent-dark" : "text-text group-hover:text-text"}`}>
        {node.name}
      </span>
      
      {runtimeText && (
        <span className={`shrink-0 text-[9px] px-1.5 py-0.5 ml-2 rounded-full uppercase tracking-wide font-semibold transition-colors ${selected ? "bg-accent/10 text-accent" : "bg-surface-secondary border border-border-light text-text-muted"}`}>
          {runtimeText}
        </span>
      )}
    </div>
  );
}

export function ScopesBar() {
  const { activeProject, getSelectedNodeForProject, setSelectedNodeForProject, getScopeOrderForProject, setScopeOrderForProject } = useProjectStore();
  const scan = useCommandStore((s) => s.scan);
  const selectedNodeId = useCommandStore((s) => s.selectedNodeId);
  const setSelectedNodeId = useCommandStore((s) => s.setSelectedNodeId);

  const [draggedId, setDraggedId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const nodeChildrenByRoot = useMemo(() => {
    if (!scan) return new Map<string, ProjectNode[]>();
    const root = scan.nodes.find((n) => n.id === scan.rootNodeId);
    const map = new Map<string, ProjectNode[]>();
    if (!root) return map;

    const children = scan.nodes.filter((n) => n.parentId === root.id);
    const persistedOrder = activeProject ? getScopeOrderForProject(activeProject.id) : null;
    const persistedIndex = new Map(
      (persistedOrder ?? []).map((id, idx) => [id, idx]),
    );

    const ordered = [...children].sort((a, b) => {
      const aIdx = persistedIndex.get(a.id);
      const bIdx = persistedIndex.get(b.id);
      if (aIdx !== undefined && bIdx !== undefined) return aIdx - bIdx;
      if (aIdx !== undefined) return -1;
      if (bIdx !== undefined) return 1;
      return a.sortOrder - b.sortOrder;
    });

    map.set(
      root.id,
      ordered,
    );
    return map;
  }, [scan, activeProject, getScopeOrderForProject]);

  if (!scan || !activeProject) return null;

  const root = scan.nodes.find((n) => n.id === scan.rootNodeId);
  if (!root) return null;

  const children = nodeChildrenByRoot.get(root.id) ?? [];
  if (children.length === 0) return null;

  const selected = selectedNodeId ?? getSelectedNodeForProject(activeProject.id) ?? root.id;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5 text-text-secondary text-[11px] font-medium ml-1">
        <Layers size={12} className="opacity-70" />
        <span className="uppercase tracking-wider">Scopes</span>
        <span className="text-text-muted/60 lowercase font-normal ml-1">Drag to prioritize</span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {/* Root Node Pill */}
        <div
          onClick={() => {
            setSelectedNodeId(root.id);
            setSelectedNodeForProject(activeProject.id, root.id);
          }}
          className={`group flex items-center h-8 px-3 rounded-full border cursor-pointer transition-colors shadow-sm shrink-0 ${
            selected === root.id
              ? "bg-accent/10 border-accent/20"
              : "bg-surface hover:bg-surface-secondary border-border-light hover:border-border shadow-none"
          }`}
        >
          <CircleDot size={10} className={`shrink-0 mr-1.5 ${selected === root.id ? "text-accent" : "text-text-muted/70 group-hover:text-text-muted"}`} />
          <span className={`text-[12px] font-medium leading-none transition-colors ${selected === root.id ? "text-accent-dark" : "text-text group-hover:text-text"}`}>
            Root (All)
          </span>
          <span className={`shrink-0 text-[9px] px-1.5 py-0.5 ml-2 rounded-full uppercase tracking-wide font-semibold transition-colors ${selected === root.id ? "bg-accent/10 text-accent" : "bg-surface-secondary border border-border-light text-text-muted"}`}>
            merged
          </span>
        </div>

        <div className="w-px h-5 bg-border-light shrink-0 mx-0.5" />

        {/* Draggable Children */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={(event: DragStartEvent) => setDraggedId(String(event.active.id))}
          onDragEnd={(event: DragEndEvent) => {
            const activeId = String(event.active.id);
            const overId = event.over ? String(event.over.id) : null;
            setDraggedId(null);
            if (!overId || activeId === overId) return;

            const ids = children.map((n) => n.id);
            const oldIndex = ids.indexOf(activeId);
            const newIndex = ids.indexOf(overId);
            if (oldIndex < 0 || newIndex < 0) return;
            setScopeOrderForProject(activeProject.id, arrayMove(ids, oldIndex, newIndex));
          }}
        >
          <SortableContext items={children.map((n) => n.id)} strategy={horizontalListSortingStrategy}>
            {children.map((node) => (
              <ScopePill
                key={node.id}
                node={node}
                selected={selected === node.id}
                isDragging={draggedId === node.id}
                onSelect={() => {
                  setSelectedNodeId(node.id);
                  setSelectedNodeForProject(activeProject.id, node.id);
                }}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
