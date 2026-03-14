# UX Restructure — Making the App Make Sense

Based on the product analysis, the app has become fragmented across too many top-level views. This plan reorganizes navigation to be intuitive without changing the visual aesthetic.

## Core Problem

The sidebar has 4 views (`Dashboard`, `Terminal`, `Vault`, `Settings`) that are all treated as equals, but they aren't:
- **Dashboard** and **Terminal** require a project to function
- **Vault** and **Settings** are global tools
- The Terminal is a *supporting tool*, not a destination
- Vault management is disconnected from where secrets are actually used

## Proposed Changes

### 1. Sidebar Navigation Restructure

**Before:** Dashboard | Terminal | Vault | Settings (flat list)

**After:** Two-tier navigation:
| Section | Items | Rationale |
|---|---|---|
| **Project Views** | Dashboard | The primary workspace |
| **Global Tools** | Security, Settings | Always available, no project needed |

Terminal moves to a **bottom pane toggle** in the TopBar. Vault overview + tools move into a **Security** page that replaces it as a sidebar item.

---

### 2. Terminal → Bottom Pane

#### [MODIFY] [TopBar.tsx](file:///d:/github/varlock_ui/src/components/layout/TopBar.tsx)
- Add a "Terminal" toggle button to the right side of the TopBar (next to "Scan")
- Clicking it toggles a bottom pane that shows the `TerminalPanel`

#### [MODIFY] [AppLayout.tsx](file:///d:/github/varlock_ui/src/components/layout/AppLayout.tsx)
- Add a bottom pane container below the main content area
- When `showTerminal` is true, render `TerminalPanel` in a resizable bottom panel
- Remove the `view === "terminal"` routing branch

#### [MODIFY] [Sidebar.tsx](file:///d:/github/varlock_ui/src/components/layout/Sidebar.tsx)
- Remove the "Terminal" nav item
- Rename "Vault" to "Security" (houses vault overview + AI context + team sync)
- Reorder: Dashboard → Security → Settings
- Add a visual separator between project-scoped items and global tools

---

### 3. Security Page (Vault + AI Context + Team Sync)

#### [MODIFY] [AppLayout.tsx](file:///d:/github/varlock_ui/src/components/layout/AppLayout.tsx)
- Rename `VaultView` to `SecurityPage`
- Keep the tabbed interface but rename tabs to be more user-facing:
  - "Overview" → "Vault"
  - "Setup Wizard" → "Import Secrets"
  - "Secret Generator" → "Generator"
  - "AI Context" stays
  - "Team Sync" stays

---

### 4. AppView Type Update

#### [MODIFY] [types.ts](file:///d:/github/varlock_ui/src/lib/types.ts)
- Change `AppView` from `"dashboard" | "terminal" | "settings" | "vault"` to `"dashboard" | "security" | "settings"`
- Remove `"terminal"` and rename `"vault"` to `"security"`

#### [MODIFY] [projectStore.ts](file:///d:/github/varlock_ui/src/stores/projectStore.ts)
- No structural changes, just ensure default view is still `"dashboard"`

---

### 5. Terminal State Management

#### [MODIFY] [settingsStore.ts](file:///d:/github/varlock_ui/src/stores/settingsStore.ts)
- Add `terminalOpen: boolean` and `toggleTerminal()` to the settings store (persisted)

---

## Verification Plan

### Build Verification
- `npm run build` must pass with zero errors
- `cargo check` must pass (no backend changes expected)

### Manual Verification
- Sidebar shows: Dashboard, Security, Settings (with separator)
- Terminal toggle button appears in TopBar
- Clicking Terminal toggle opens/closes bottom pane
- Security page contains all vault tabs
- No dead nav routes

> [!IMPORTANT]
> This restructure only touches navigation and layout. No business logic, no crypto, no CLI integration changes. The aesthetic stays identical.
