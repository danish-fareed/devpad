import { useEffect } from "react";
import { useSettingsStore } from "@/stores/settingsStore";
import { useVaultStore } from "@/stores/vaultStore";

/**
 * Global hook to auto-lock the vault after a period of user inactivity.
 * Mounts listeners for mouse, keyboard, and touch events.
 */
export function useAutoLock() {
  const { autoLockEnabled, autoLockTimeout } = useSettingsStore();
  const vaultStatus = useVaultStore((s) => s.status);
  const lockVault = useVaultStore((s) => s.lock);

  useEffect(() => {
    // 1. Guard: Bail out early if auto-lock is disabled or the vault is already locked.
    // We don't want to run inactivity timers if there's nothing to lock.
    if (!autoLockEnabled || !vaultStatus?.unlocked) {
      return;
    }

    let timerId: ReturnType<typeof setTimeout>;

    // Convert timeout from minutes to milliseconds explicitly
    const timeoutMs = autoLockTimeout * 60 * 1000;

    // 2. Debounce implementation: Cancel the existing timer and start a new one.
    const resetTimer = () => {
      clearTimeout(timerId);
      timerId = setTimeout(() => {
        // Vault lock triggers app re-render explicitly because App.tsx and AppLayout.tsx depend on it.
        lockVault().catch(console.error);
      }, timeoutMs);
    };

    // 3. Mount listeners
    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "wheel",
    ];

    events.forEach((event) => {
      window.addEventListener(event, resetTimer, { passive: true });
    });

    // Also handle tab visibility changes (e.g. user goes to another tab, timer should still run or reset?)
    // Here we reset the timer when the tab becomes visible again, ensuring they don't get locked out right 
    // exactly as they return if the timer was almost up.
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        resetTimer();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Initial timer start
    resetTimer();

    // 4. Robust Cleanup: Remove all listeners and clear the timer on unmount 
    // or when dependencies (autoLockEnabled, autoLockTimeout, vaultStatus) change.
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearTimeout(timerId);
    };
  }, [autoLockEnabled, autoLockTimeout, vaultStatus?.unlocked, lockVault]);
}
