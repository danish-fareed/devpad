import { useState, useEffect } from "react";
import { useSettingsStore } from "@/stores/settingsStore";
import { createPortal } from "react-dom";

interface SettingsModalProps {
  onClose: () => void;
}

/**
 * macOS System Preferences-style settings modal.
 * Sections: Appearance, Terminal.
 */
export function SettingsModal({ onClose }: SettingsModalProps) {
  const {
    theme,
    terminalFontSize,
    terminalScrollback,
    setTheme,
    setTerminalFontSize,
    setTerminalScrollback,
  } = useSettingsStore();

  const [activeTab, setActiveTab] = useState<"appearance" | "terminal" | "about">("appearance");

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-surface rounded-xl shadow-[0_24px_80px_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.06)] w-full max-w-[600px] h-[450px] mx-4 animate-scale-in flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3 border-b border-border-light flex items-center justify-between bg-surface shrink-0">
          <div className="flex gap-1 bg-surface-secondary p-1 rounded-lg">
            <TabButton
              active={activeTab === "appearance"}
              onClick={() => setActiveTab("appearance")}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="3" stroke="currentColor" strokeWidth="1.2" />
                <path d="M7 1v1M7 12v1M1 7h1M12 7h1M2.8 2.8l.7.7M10.5 10.5l.7.7M2.8 11.2l.7-.7M10.5 3.5l.7-.7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              Appearance
            </TabButton>
            <TabButton
              active={activeTab === "terminal"}
              onClick={() => setActiveTab("terminal")}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 4l4 3-4 3M7 10h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Terminal
            </TabButton>
            <TabButton
              active={activeTab === "about"}
              onClick={() => setActiveTab("about")}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.2" />
                <path d="M7 6v4M7 4h.01" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              About
            </TabButton>
          </div>
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-md flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-tertiary transition-colors cursor-pointer border-none bg-transparent shrink-0"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "appearance" && (
            <div className="flex flex-col gap-2 max-w-sm mx-auto">
              <label className="text-[13px] font-medium text-text mt-2 mb-2">Theme Preference</label>
              <div className="flex gap-3">
                <ThemeCard label="Light" active={theme === "light"} onClick={() => setTheme("light")}>
                  <LightThemePreview />
                </ThemeCard>
                <ThemeCard label="Dark" active={theme === "dark"} onClick={() => setTheme("dark")}>
                  <DarkThemePreview />
                </ThemeCard>
                <ThemeCard label="System" active={theme === "system"} onClick={() => setTheme("system")}>
                  <SystemThemePreview />
                </ThemeCard>
              </div>
            </div>
          )}

          {activeTab === "terminal" && (
            <div className="flex flex-col gap-6 max-w-sm mx-auto mt-2">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-[13px] font-medium text-text">Font size</label>
                  <p className="text-[12px] text-text-muted mt-0.5">Terminal text size in pixels.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setTerminalFontSize(Math.max(10, terminalFontSize - 1))}
                    className="w-7 h-7 rounded-lg border border-border bg-surface text-text-secondary hover:bg-surface-secondary hover:text-text flex items-center justify-center cursor-pointer"
                  >
                    -
                  </button>
                  <span className="text-[13px] font-mono text-text w-6 text-center tabular-nums">
                    {terminalFontSize}
                  </span>
                  <button
                    onClick={() => setTerminalFontSize(Math.min(24, terminalFontSize + 1))}
                    className="w-7 h-7 rounded-lg border border-border bg-surface text-text-secondary hover:bg-surface-secondary hover:text-text flex items-center justify-center cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="h-px bg-border-light" />

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-[13px] font-medium text-text">Scrollback</label>
                  <p className="text-[12px] text-text-muted mt-0.5">History length limit.</p>
                </div>
                <select
                  value={terminalScrollback}
                  onChange={(e) => setTerminalScrollback(Number(e.target.value))}
                  className="h-8 px-2 rounded-lg border border-border bg-surface text-text text-[13px] cursor-pointer"
                >
                  <option value={1000}>1,000</option>
                  <option value={5000}>5,000</option>
                  <option value={10000}>10,000</option>
                  <option value={50000}>50,000</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === "about" && (
            <div className="flex flex-col gap-4 max-w-sm mx-auto mt-6">
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
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-md text-[12px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer border-none ${
        active ? "bg-surface shadow-sm text-text" : "bg-transparent text-text-muted hover:text-text"
      }`}
    >
      {children}
    </button>
  );
}

function ThemeCard({ label, active, onClick, children }: { label: string; active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-xl border-2 p-2.5 transition-all cursor-pointer ${
        active ? "border-accent bg-accent-light/30 shadow-[0_0_0_1px_rgba(10,132,255,0.15)]" : "border-border-light bg-surface hover:border-border"
      }`}
    >
      <div className="rounded-lg overflow-hidden mb-2.5 border border-border-light/50">{children}</div>
      <div className="flex items-center justify-center gap-1.5">
        <div className={`w-3 h-3 rounded-full border-[1.5px] flex items-center justify-center shrink-0 ${active ? "border-accent" : "border-border"}`}>
          {active && <div className="w-1.5 h-1.5 rounded-full bg-accent" />}
        </div>
        <span className="text-[12px] font-medium text-text">{label}</span>
      </div>
    </button>
  );
}

function LightThemePreview() {
  return (
    <div className="h-16 bg-[#F5F5F7] flex">
      <div className="w-8 bg-[#F0F0F2] border-r border-[#E8E8ED]">
        <div className="mt-2 mx-1 h-1.5 rounded bg-[#0A84FF]" />
        <div className="mt-1 mx-1 h-1.5 rounded bg-[#D2D2D7]" />
      </div>
      <div className="flex-1 p-1.5">
        <div className="h-2 w-10 rounded bg-[#D2D2D7] mb-1" />
        <div className="h-1.5 w-12 rounded bg-[#E8E8ED]" />
      </div>
    </div>
  );
}

function DarkThemePreview() {
  return (
    <div className="h-16 bg-[#2C2C2E] flex">
      <div className="w-8 bg-[#1C1C1E] border-r border-[#38383A]">
        <div className="mt-2 mx-1 h-1.5 rounded bg-[#0A84FF]" />
        <div className="mt-1 mx-1 h-1.5 rounded bg-[#48484A]" />
      </div>
      <div className="flex-1 p-1.5">
        <div className="h-2 w-10 rounded bg-[#48484A] mb-1" />
        <div className="h-1.5 w-12 rounded bg-[#38383A]" />
      </div>
    </div>
  );
}

function SystemThemePreview() {
  return (
    <div className="h-16 flex overflow-hidden">
      <div className="flex-1 bg-[#F5F5F7]" />
      <div className="flex-1 bg-[#2C2C2E]" />
    </div>
  );
}
