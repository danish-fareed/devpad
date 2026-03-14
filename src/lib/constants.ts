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
export const ENV_BADGE_STYLES: Record<
  string,
  { bg: string; text: string }
> = {
  development: { bg: "#E8FAE9", text: "#1E7A2E" },
  production: { bg: "#FFEDED", text: "#A51D14" },
  test: { bg: "#FFF4E5", text: "#8A4D00" },
  staging: { bg: "#E8F2FF", text: "#0055B3" },
  preview: { bg: "#F3EDFF", text: "#6E36D6" },
};

/** Variable type badge colors */
export const TYPE_BADGE_STYLES: Record<
  string,
  { bg: string; text: string }
> = {
  url: { bg: "#E8F2FF", text: "#0055B3" },
  string: { bg: "#F0F0F2", text: "#6E6E73" },
  port: { bg: "#E8FAE9", text: "#1E7A2E" },
  enum: { bg: "#FFF4E5", text: "#8A4D00" },
  number: { bg: "#F3EDFF", text: "#6E36D6" },
  boolean: { bg: "#E8FAE9", text: "#1E7A2E" },
};

/** Default environment badge style for unknown environments */
export const DEFAULT_ENV_BADGE = { bg: "#F0F0F2", text: "#6E6E73" };

/** Default type badge style for unknown types */
export const DEFAULT_TYPE_BADGE = { bg: "#F0F0F2", text: "#6E6E73" };
