import { create } from "zustand";

// ── Types ──

export type ThemeMode = "light" | "dark" | "system";

export interface AppSettings {
  /** Theme preference: light, dark, or follow system */
  theme: ThemeMode;
  /** Whether the sidebar is collapsed */
  sidebarCollapsed: boolean;
  /** Terminal font size */
  terminalFontSize: number;
  /** Terminal scrollback lines */
  terminalScrollback: number;
}

// ── Persistence ──

const SETTINGS_KEY = "varlock_settings";

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...getDefaultSettings(), ...parsed };
    }
  } catch {
    // Ignore parse errors
  }
  return getDefaultSettings();
}

function persistSettings(settings: AppSettings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Storage may be unavailable
  }
}

function getDefaultSettings(): AppSettings {
  return {
    theme: "light",
    sidebarCollapsed: false,
    terminalFontSize: 13,
    terminalScrollback: 10000,
  };
}

// ── Resolved theme helper ──

function getSystemTheme(): "light" | "dark" {
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return "light";
}

export function resolveTheme(mode: ThemeMode): "light" | "dark" {
  if (mode === "system") return getSystemTheme();
  return mode;
}

// ── Store ──

interface SettingsState extends AppSettings {
  /** The resolved theme (light or dark), accounting for "system" preference */
  resolvedTheme: "light" | "dark";

  // Actions
  setTheme: (theme: ThemeMode) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setTerminalFontSize: (size: number) => void;
  setTerminalScrollback: (lines: number) => void;
  /** Re-resolve theme (call when system preference changes) */
  syncSystemTheme: () => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => {
  const initial = loadSettings();

  return {
    ...initial,
    resolvedTheme: resolveTheme(initial.theme),

    setTheme: (theme) => {
      const resolved = resolveTheme(theme);
      set({ theme, resolvedTheme: resolved });
      const settings = extractSettings(get());
      persistSettings(settings);
      applyThemeClass(resolved);
    },

    toggleSidebar: () => {
      const collapsed = !get().sidebarCollapsed;
      set({ sidebarCollapsed: collapsed });
      const settings = extractSettings(get());
      persistSettings(settings);
    },

    setSidebarCollapsed: (collapsed) => {
      set({ sidebarCollapsed: collapsed });
      const settings = extractSettings(get());
      persistSettings(settings);
    },

    setTerminalFontSize: (size) => {
      set({ terminalFontSize: size });
      const settings = extractSettings(get());
      persistSettings(settings);
    },

    setTerminalScrollback: (lines) => {
      set({ terminalScrollback: lines });
      const settings = extractSettings(get());
      persistSettings(settings);
    },

    syncSystemTheme: () => {
      const { theme } = get();
      if (theme === "system") {
        const resolved = resolveTheme("system");
        set({ resolvedTheme: resolved });
        applyThemeClass(resolved);
      }
    },
  };
});

// ── Helpers ──

function extractSettings(state: SettingsState): AppSettings {
  return {
    theme: state.theme,
    sidebarCollapsed: state.sidebarCollapsed,
    terminalFontSize: state.terminalFontSize,
    terminalScrollback: state.terminalScrollback,
  };
}

/** Apply or remove the .dark class on the root <html> element */
export function applyThemeClass(resolved: "light" | "dark") {
  const root = document.documentElement;
  if (resolved === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

/** Initialize theme on app startup — call once from main.tsx or App.tsx */
export function initializeTheme() {
  const store = useSettingsStore.getState();
  applyThemeClass(store.resolvedTheme);

  // Listen for system theme changes
  if (typeof window !== "undefined" && window.matchMedia) {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", () => {
      useSettingsStore.getState().syncSystemTheme();
    });
  }
}
