import { create } from "zustand";
import type { Project, AppView } from "@/lib/types";
import * as commands from "@/lib/commands";

const PINNED_STORAGE_KEY = "varlock_pinned_projects";
const SELECTED_NODE_STORAGE_KEY = "varlock_selected_nodes";
const COLLAPSED_ROOTS_STORAGE_KEY = "varlock_collapsed_roots";
const SCOPE_ORDER_STORAGE_KEY = "varlock_scope_order";

interface ProjectState {
  /** All managed projects */
  projects: Project[];
  /** Currently selected project */
  activeProject: Project | null;
  /** Pinned project IDs for sidebar */
  pinnedProjectIds: string[];
  /** Current view mode */
  view: AppView;
  /** Per-project selected node ID */
  selectedNodeByProject: Record<string, string>;
  /** Per-project collapsed root state */
  collapsedRootsByProject: Record<string, boolean>;
  /** Per-project ordered scope node IDs (children only) */
  scopeOrderByProject: Record<string, string[]>;
  /** Loading state */
  isLoading: boolean;
  /** Error message */
  error: string | null;

  // Actions
  loadProjects: () => Promise<void>;
  setActiveProject: (project: Project | null) => void;
  addProject: (path: string) => Promise<Project>;
  cloneProjectFromGithub: (
    url: string,
    destinationParent: string,
    folderName?: string,
  ) => Promise<Project>;
  removeProject: (id: string) => Promise<void>;
  refreshActiveProject: () => Promise<void>;
  setView: (view: AppView | string) => void;
  clearError: () => void;
  pinProject: (projectId: string) => void;
  unpinProject: (projectId: string) => void;
  reorderPinnedProjects: (projectIds: string[]) => void;
  setSelectedNodeForProject: (projectId: string, nodeId: string) => void;
  getSelectedNodeForProject: (projectId: string) => string | null;
  setRootCollapsedForProject: (projectId: string, collapsed: boolean) => void;
  isRootCollapsedForProject: (projectId: string) => boolean;
  setScopeOrderForProject: (projectId: string, nodeIds: string[]) => void;
  getScopeOrderForProject: (projectId: string) => string[] | null;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  activeProject: null,
  pinnedProjectIds: (() => {
    try {
      return JSON.parse(localStorage.getItem(PINNED_STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  })(),
  view: "dashboard",
  selectedNodeByProject: (() => {
    try {
      return JSON.parse(localStorage.getItem(SELECTED_NODE_STORAGE_KEY) || "{}");
    } catch {
      return {};
    }
  })(),
  collapsedRootsByProject: (() => {
    try {
      return JSON.parse(localStorage.getItem(COLLAPSED_ROOTS_STORAGE_KEY) || "{}");
    } catch {
      return {};
    }
  })(),
  scopeOrderByProject: (() => {
    try {
      return JSON.parse(localStorage.getItem(SCOPE_ORDER_STORAGE_KEY) || "{}");
    } catch {
      return {};
    }
  })(),
  isLoading: false,
  error: null,

  loadProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const projects = await commands.projectList();
      const active = get().activeProject;
      set({
        projects,
        isLoading: false,
        // Keep active project if it still exists
        activeProject: active
          ? projects.find((p) => p.id === active.id) ?? projects[0] ?? null
          : projects[0] ?? null,
      });
    } catch (e) {
      set({ isLoading: false, error: String(e) });
    }
  },

  setActiveProject: (project) => {
    set({ activeProject: project, view: "dashboard" });
  },

  addProject: async (path) => {
    set({ isLoading: true, error: null });
    try {
      const project = await commands.projectAdd(path);
      set((state) => ({
        projects: [...state.projects, project],
        activeProject: project,
        isLoading: false,
      }));
      return project;
    } catch (e) {
      set({ isLoading: false, error: String(e) });
      throw e;
    }
  },

  removeProject: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await commands.projectRemove(id);
      set((state) => {
        const projects = state.projects.filter((p) => p.id !== id);
        return {
          projects,
          isLoading: false,
          activeProject:
            state.activeProject?.id === id
              ? projects[0] ?? null
              : state.activeProject,
        };
      });
    } catch (e) {
      set({ isLoading: false, error: String(e) });
    }
  },

  refreshActiveProject: async () => {
    await get().loadProjects();
  },

  setView: (view: string) => {
    // Sanitize stale view values from old sessions
    const sanitized: AppView =
      view === "terminal" ? "dashboard" :
      view === "settings" ? "dashboard" :
      view === "security" ? "vault" :
      (view as AppView);
    set({ view: sanitized });
  },

  pinProject: (projectId) => {
    const current = get().pinnedProjectIds;
    if (current.includes(projectId)) return;
    const next = [...current, projectId];
    localStorage.setItem(PINNED_STORAGE_KEY, JSON.stringify(next));
    set({ pinnedProjectIds: next });
  },

  unpinProject: (projectId) => {
    const next = get().pinnedProjectIds.filter((id) => id !== projectId);
    localStorage.setItem(PINNED_STORAGE_KEY, JSON.stringify(next));
    set({ pinnedProjectIds: next });
  },

  reorderPinnedProjects: (projectIds) => {
    localStorage.setItem(PINNED_STORAGE_KEY, JSON.stringify(projectIds));
    set({ pinnedProjectIds: projectIds });
  },

  cloneProjectFromGithub: async (url, destinationParent, folderName) => {
    set({ isLoading: true, error: null });
    try {
      const project = await commands.projectCloneGithub(url, destinationParent, folderName);
      set((state) => ({
        projects: [...state.projects, project],
        activeProject: project,
        isLoading: false,
      }));
      return project;
    } catch (e) {
      set({ isLoading: false, error: String(e) });
      throw e;
    }
  },

  setSelectedNodeForProject: (projectId, nodeId) => {
    const next = {
      ...get().selectedNodeByProject,
      [projectId]: nodeId,
    };
    localStorage.setItem(SELECTED_NODE_STORAGE_KEY, JSON.stringify(next));
    set({ selectedNodeByProject: next });
  },

  getSelectedNodeForProject: (projectId) => {
    return get().selectedNodeByProject[projectId] ?? null;
  },

  setRootCollapsedForProject: (projectId, collapsed) => {
    const next = {
      ...get().collapsedRootsByProject,
      [projectId]: collapsed,
    };
    localStorage.setItem(COLLAPSED_ROOTS_STORAGE_KEY, JSON.stringify(next));
    set({ collapsedRootsByProject: next });
  },

  isRootCollapsedForProject: (projectId) => {
    return Boolean(get().collapsedRootsByProject[projectId]);
  },

  setScopeOrderForProject: (projectId, nodeIds) => {
    const next = {
      ...get().scopeOrderByProject,
      [projectId]: nodeIds,
    };
    localStorage.setItem(SCOPE_ORDER_STORAGE_KEY, JSON.stringify(next));
    set({ scopeOrderByProject: next });
  },

  getScopeOrderForProject: (projectId) => {
    return get().scopeOrderByProject[projectId] ?? null;
  },

  clearError: () => set({ error: null }),
}));
