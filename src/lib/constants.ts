/** Terminal font configuration */
export const TERMINAL_FONT_FAMILY =
  '"Geist Mono", "SF Mono", "Cascadia Code", "Fira Code", "JetBrains Mono", monospace';
export const TERMINAL_FONT_SIZE = 13;

/** Terminal theme — macOS Terminal.app inspired light-on-dark */
export const TERMINAL_THEME = {
  background: "#1C1C1E",
  foreground: "#E5E5EA",
  cursor: "#0A84FF",
  cursorAccent: "#1C1C1E",
  selectionBackground: "rgba(10,132,255,0.25)",
  selectionForeground: "#E5E5EA",
  black: "#1C1C1E",
  red: "#FF453A",
  green: "#30D158",
  yellow: "#FFD60A",
  blue: "#0A84FF",
  magenta: "#BF5AF2",
  cyan: "#64D2FF",
  white: "#E5E5EA",
  brightBlack: "#636366",
  brightRed: "#FF6961",
  brightGreen: "#4CD964",
  brightYellow: "#FFD60A",
  brightBlue: "#409CFF",
  brightMagenta: "#DA8FFF",
  brightCyan: "#70D7FF",
  brightWhite: "#FFFFFF",
} as const;

/** Color mapping for project status indicators */
export const STATUS_COLORS = {
  valid: "#34C759",
  warning: "#FF9500",
  error: "#FF3B30",
  migrationNeeded: "#0A84FF",
  unknown: "#AEAEB2",
} as const;

/** Environment badge colors — soft pastels with readable text */
export const ENV_BADGE_STYLES: Record<string, string> = {
  development: "bg-success-light text-success-dark border border-success/10",
  production: "bg-danger-light text-danger-dark border border-danger/10",
  test: "bg-warning-light text-warning-dark border border-warning/10",
  staging: "bg-accent-light text-accent border border-accent/10",
  preview: "bg-surface-tertiary text-text border border-border-light",
};

/** Variable type badge colors */
export const TYPE_BADGE_STYLES: Record<string, string> = {
  // Network & Web
  url: "bg-accent-light text-accent border border-accent/10",
  port: "bg-success-light text-success-dark border border-success/10",
  ipAddress: "bg-accent-light text-accent-dark border border-accent/10",
  email: "bg-accent-light text-accent border border-accent/10",
  
  // Primitives & General
  string: "bg-surface-tertiary text-text-secondary border border-border-light",
  number: "bg-surface-tertiary text-text border border-border-light",
  boolean: "bg-success-light text-success-dark border border-success/10",
  enum: "bg-warning-light text-warning-dark border border-warning/10",
  
  // Data formats & Structure
  json: "bg-surface-tertiary text-text border border-border-light",
  semver: "bg-surface-tertiary text-text-secondary border border-border-light",
  uuid: "bg-surface-tertiary text-text-secondary border border-border-light",
  path: "bg-surface-tertiary text-text-secondary border border-border-light",
  regex: "bg-surface-tertiary text-text-secondary border border-border-light",
  
  // Crypto & Encoding
  hex: "bg-surface-tertiary text-text-secondary border border-border-light",
  base64: "bg-surface-tertiary text-text-secondary border border-border-light",
  md5: "bg-surface-tertiary text-text-secondary border border-border-light",
  tlsCert: "bg-warning-light text-warning-dark border border-warning/10",
  tlsKey: "bg-danger-light text-danger-dark border border-danger/10",
  
  // Dates & Times
  duration: "bg-surface-tertiary text-text border border-border-light",
  isoDate: "bg-surface-tertiary text-text border border-border-light",
  isoDateTime: "bg-surface-tertiary text-text border border-border-light",
  
  // Locales & Media
  color: "bg-surface-tertiary text-text border border-border-light",
  country: "bg-surface-tertiary text-text border border-border-light",
  locale: "bg-surface-tertiary text-text border border-border-light",
  mimeType: "bg-surface-tertiary text-text border border-border-light",
};

/** Default environment badge style for unknown environments */
export const DEFAULT_ENV_BADGE = "bg-surface-tertiary text-text-secondary border border-border-light";

/** Default type badge style for unknown types */
export const DEFAULT_TYPE_BADGE = "bg-surface-tertiary text-text-secondary border border-border-light";
