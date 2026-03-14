import { useSettingsStore } from "@/stores/settingsStore";

/**
 * macOS System Preferences-style settings page.
 * Sections: Appearance, Terminal.
 */
export function SettingsPage() {
  const {
    theme,
    terminalFontSize,
    terminalScrollback,
    setTheme,
    setTerminalFontSize,
    setTerminalScrollback,
  } = useSettingsStore();

  return (
    <div className="flex-1 overflow-auto bg-surface">
      <div className="max-w-2xl mx-auto py-8 px-6 animate-fade-in">
        {/* Page header */}
        <h1 className="text-[22px] font-semibold text-text tracking-tight mb-1">
          Settings
        </h1>
        <p className="text-[13px] text-text-secondary mb-8">
          Configure your Varlock workspace preferences.
        </p>

        {/* ── Appearance Section ── */}
        <SettingsSection
          title="Appearance"
          description="Customize how Varlock looks on your device."
          icon={
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.3" />
              <path d="M8 1.5v1.5M8 13v1.5M1.5 8H3M13 8h1.5M3.4 3.4l1.06 1.06M11.54 11.54l1.06 1.06M3.4 12.6l1.06-1.06M11.54 4.46l1.06-1.06" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
          }
        >
          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-medium text-text">Theme</label>
            <div className="flex gap-3">
              <ThemeCard
                label="Light"
                active={theme === "light"}
                onClick={() => setTheme("light")}
              >
                <LightThemePreview />
              </ThemeCard>
              <ThemeCard
                label="Dark"
                active={theme === "dark"}
                onClick={() => setTheme("dark")}
              >
                <DarkThemePreview />
              </ThemeCard>
              <ThemeCard
                label="System"
                active={theme === "system"}
                onClick={() => setTheme("system")}
              >
                <SystemThemePreview />
              </ThemeCard>
            </div>
          </div>
        </SettingsSection>

        {/* ── Terminal Section ── */}
        <SettingsSection
          title="Terminal"
          description="Adjust terminal display and behavior."
          icon={
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 4l4 4-4 4M9 12h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
        >
          <div className="flex flex-col gap-5">
            {/* Font size */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-[13px] font-medium text-text">
                  Font size
                </label>
                <p className="text-[12px] text-text-muted mt-0.5">
                  Terminal text size in pixels.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTerminalFontSize(Math.max(10, terminalFontSize - 1))}
                  className="w-7 h-7 rounded-lg border border-border bg-surface text-text-secondary hover:bg-surface-secondary hover:text-text flex items-center justify-center cursor-pointer transition-colors text-sm"
                >
                  -
                </button>
                <span className="text-[13px] font-mono text-text w-8 text-center tabular-nums">
                  {terminalFontSize}
                </span>
                <button
                  onClick={() => setTerminalFontSize(Math.min(24, terminalFontSize + 1))}
                  className="w-7 h-7 rounded-lg border border-border bg-surface text-text-secondary hover:bg-surface-secondary hover:text-text flex items-center justify-center cursor-pointer transition-colors text-sm"
                >
                  +
                </button>
              </div>
            </div>

            {/* Scrollback */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-[13px] font-medium text-text">
                  Scrollback lines
                </label>
                <p className="text-[12px] text-text-muted mt-0.5">
                  Maximum number of lines kept in terminal history.
                </p>
              </div>
              <select
                value={terminalScrollback}
                onChange={(e) => setTerminalScrollback(Number(e.target.value))}
                className="h-8 px-3 rounded-lg border border-border bg-surface text-text text-[13px] cursor-pointer hover:border-accent/50 focus:border-accent"
              >
                <option value={1000}>1,000</option>
                <option value={5000}>5,000</option>
                <option value={10000}>10,000</option>
                <option value={50000}>50,000</option>
                <option value={100000}>100,000</option>
              </select>
            </div>
          </div>
        </SettingsSection>

        {/* ── About Section ── */}
        <SettingsSection
          title="About"
          description="Varlock UI application information."
          icon={
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3" />
              <path d="M8 7v4M8 5.25h.005" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
          }
        >
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-text-secondary">Application</span>
              <span className="text-[13px] font-medium text-text">Varlock UI</span>
            </div>
            <div className="h-px bg-border-light" />
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-text-secondary">Runtime</span>
              <span className="text-[13px] font-medium text-text">Tauri 2</span>
            </div>
            <div className="h-px bg-border-light" />
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-text-secondary">Framework</span>
              <span className="text-[13px] font-medium text-text">React 19</span>
            </div>
          </div>
        </SettingsSection>
      </div>
    </div>
  );
}

// ── Sub-components ──

function SettingsSection({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2.5 mb-1.5">
        <div className="w-7 h-7 rounded-lg bg-surface-tertiary flex items-center justify-center text-text-secondary shrink-0">
          {icon}
        </div>
        <div>
          <h2 className="text-[15px] font-semibold text-text">{title}</h2>
          <p className="text-[12px] text-text-muted">{description}</p>
        </div>
      </div>
      <div className="ml-0 mt-3 rounded-xl border border-border-light bg-surface-secondary/50 p-5">
        {children}
      </div>
    </div>
  );
}

function ThemeCard({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-xl border-2 p-2.5 transition-all cursor-pointer ${
        active
          ? "border-accent bg-accent-light/30 shadow-[0_0_0_1px_rgba(10,132,255,0.15)]"
          : "border-border-light bg-surface hover:border-border"
      }`}
    >
      <div className="rounded-lg overflow-hidden mb-2.5 border border-border-light/50">
        {children}
      </div>
      <div className="flex items-center gap-2">
        <div
          className={`w-3.5 h-3.5 rounded-full border-[1.5px] flex items-center justify-center shrink-0 transition-colors ${
            active ? "border-accent" : "border-border"
          }`}
        >
          {active && <div className="w-[7px] h-[7px] rounded-full bg-accent" />}
        </div>
        <span className="text-[12px] font-medium text-text">{label}</span>
      </div>
    </button>
  );
}

/** Mini preview of light theme */
function LightThemePreview() {
  return (
    <div className="h-16 bg-[#F5F5F7] flex">
      <div className="w-8 bg-[#F0F0F2] border-r border-[#E8E8ED]">
        <div className="mt-2 mx-1 h-1.5 rounded bg-[#0A84FF]" />
        <div className="mt-1 mx-1 h-1.5 rounded bg-[#D2D2D7]" />
        <div className="mt-1 mx-1 h-1.5 rounded bg-[#D2D2D7]" />
      </div>
      <div className="flex-1 p-1.5">
        <div className="h-2 w-12 rounded bg-[#D2D2D7] mb-1" />
        <div className="h-1.5 w-16 rounded bg-[#E8E8ED]" />
      </div>
    </div>
  );
}

/** Mini preview of dark theme */
function DarkThemePreview() {
  return (
    <div className="h-16 bg-[#2C2C2E] flex">
      <div className="w-8 bg-[#1C1C1E] border-r border-[#38383A]">
        <div className="mt-2 mx-1 h-1.5 rounded bg-[#0A84FF]" />
        <div className="mt-1 mx-1 h-1.5 rounded bg-[#48484A]" />
        <div className="mt-1 mx-1 h-1.5 rounded bg-[#48484A]" />
      </div>
      <div className="flex-1 p-1.5">
        <div className="h-2 w-12 rounded bg-[#48484A] mb-1" />
        <div className="h-1.5 w-16 rounded bg-[#38383A]" />
      </div>
    </div>
  );
}

/** Mini preview of system theme (split) */
function SystemThemePreview() {
  return (
    <div className="h-16 flex overflow-hidden">
      {/* Light half */}
      <div className="flex-1 bg-[#F5F5F7] flex">
        <div className="w-4 bg-[#F0F0F2] border-r border-[#E8E8ED]">
          <div className="mt-2 mx-0.5 h-1 rounded bg-[#0A84FF]" />
          <div className="mt-0.5 mx-0.5 h-1 rounded bg-[#D2D2D7]" />
        </div>
        <div className="flex-1 p-1">
          <div className="h-1.5 w-6 rounded bg-[#D2D2D7] mb-0.5" />
          <div className="h-1 w-8 rounded bg-[#E8E8ED]" />
        </div>
      </div>
      {/* Dark half */}
      <div className="flex-1 bg-[#2C2C2E] flex">
        <div className="w-4 bg-[#1C1C1E] border-r border-[#38383A]">
          <div className="mt-2 mx-0.5 h-1 rounded bg-[#0A84FF]" />
          <div className="mt-0.5 mx-0.5 h-1 rounded bg-[#48484A]" />
        </div>
        <div className="flex-1 p-1">
          <div className="h-1.5 w-6 rounded bg-[#48484A] mb-0.5" />
          <div className="h-1 w-8 rounded bg-[#38383A]" />
        </div>
      </div>
    </div>
  );
}
