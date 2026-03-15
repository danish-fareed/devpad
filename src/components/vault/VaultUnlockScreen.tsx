import { useState, useEffect } from "react";
import { useVaultStore } from "../../stores/vaultStore";

export function VaultUnlockScreen() {
  const { status, loading, error, setup, unlock, tryAutoUnlock, clearError, checkStatus } =
    useVaultStore();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [autoUnlockAttempted, setAutoUnlockAttempted] = useState(false);

  const isSetup = status?.initialized === false;

  // Try auto-unlock from keychain on mount
  useEffect(() => {
    if (!autoUnlockAttempted && status?.hasKeychainKey) {
      setAutoUnlockAttempted(true);
      tryAutoUnlock();
    }
  }, [status, autoUnlockAttempted, tryAutoUnlock]);

  // Load status on mount
  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (isSetup) {
      if (password !== confirmPassword) {
        useVaultStore.setState({ error: "Passwords do not match" });
        return;
      }
      if (password.length < 8) {
        useVaultStore.setState({
          error: "Password must be at least 8 characters",
        });
        return;
      }
      try {
        await setup(password);
      } catch {
        // Error already set in store
      }
    } else {
      try {
        await unlock(password, remember);
      } catch {
        // Error already set in store
      }
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-surface-secondary">
      <div className="w-full max-w-sm px-6 animate-fade-in">
        <div className="bg-surface rounded-2xl border border-border-light shadow-[0_8px_32px_rgba(0,0,0,0.12)] p-8">
          {/* Devpad logo */}
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <img src="/icon.svg" alt="Devpad Logo" className="w-full h-full object-contain drop-shadow-sm" />
          </div>

          <h1 className="text-xl font-semibold text-text text-center mb-2">
            {isSetup ? "Create Your Vault" : "Unlock Vault"}
          </h1>

          <p className="text-sm text-text-secondary text-center mb-8 leading-relaxed">
            {isSetup
              ? "Set a master password to encrypt your environment secrets."
              : "Enter your master password to access your encrypted environment variables."}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="vault-password" className="text-xs font-medium text-text-muted ml-1 uppercase tracking-wider">
                Master Password
              </label>
              <input
                id="vault-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-surface-secondary border border-border-light rounded-xl text-sm text-text focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all placeholder:text-text-muted/50"
                autoFocus
                disabled={loading}
              />
            </div>

            {isSetup && (
              <div className="space-y-1.5">
                <label htmlFor="vault-confirm" className="text-xs font-medium text-text-muted ml-1 uppercase tracking-wider">
                  Confirm Password
                </label>
                <input
                  id="vault-confirm"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-surface-secondary border border-border-light rounded-xl text-sm text-text focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all placeholder:text-text-muted/50"
                  disabled={loading}
                />
              </div>
            )}

            {!isSetup && (
              <label className="flex items-center gap-2 cursor-pointer group px-1 pt-1">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  disabled={loading}
                  className="w-4 h-4 rounded border-border-light text-accent focus:ring-accent focus:ring-offset-0 bg-surface-secondary accent-accent cursor-pointer"
                />
                <span className="text-sm text-text-secondary group-hover:text-text transition-colors select-none">
                  Remember on this device
                </span>
              </label>
            )}

            {error && (
              <div className="flex items-center gap-2 bg-danger-light text-danger-dark text-sm px-4 py-3 rounded-xl border border-danger/20 mt-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4M12 16h.01" />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 mt-4 bg-accent text-white rounded-xl font-medium text-sm hover:bg-accent-hover disabled:opacity-50 transition-all shadow-[0_2px_8px_rgba(10,132,255,0.25)] hover:shadow-[0_4px_12px_rgba(10,132,255,0.35)] cursor-pointer flex items-center justify-center min-h-[44px]"
              disabled={loading || !password}
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : isSetup ? (
                "Create Vault"
              ) : (
                "Unlock Vault"
              )}
            </button>
          </form>

          <div className="flex items-center justify-center gap-2 mt-6 pt-5 border-t border-border-light/60">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span className="text-[11px] font-medium text-text-muted uppercase tracking-wider">
              XChaCha20-Poly1305 Encrypted
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

