# Repo Modules

This document is the canonical module map for Devpad.

## Backend modules (`src-tauri/src`)

- `commands/`
  - Tauri command handlers and API surface exported to frontend.
  - Key areas include project management, discovery, process launch, terminal attach, vault, and Python env actions.
- `discovery/`
  - Project topology detection and runtime identification.
  - Command inference/classification and environment scope detection.
- `launcher/`
  - Runtime orchestration pipeline for launch preparation.
  - Driver implementations for Node, Python, and Shell fallback.
  - Stage timeline model: detect -> prepare -> sync -> launch -> verify -> attach.
- `vault/`
  - Local vault database, encryption, key handling, audit, and secret resolver.
- `db/`
  - Local persistence primitives and migration support.
- `state/`
  - Global app state and synchronization structures.
- `filesystem/`
  - Guarded filesystem access primitives.

## Frontend modules (`src`)

- `components/`
  - Domain UI surfaces for commands, dashboard, environment management, migration, terminal, and vault.
- `stores/`
  - Zustand state orchestration for project lifecycle, command runs, environments, and terminal sessions.
- `lib/commands.ts`
  - Typed frontend bindings to backend Tauri commands.
- `lib/types.ts`
  - Shared UI domain types for discovery results, command models, env tiers, and runtime events.

## Data and control flow

1. User selects project in UI.
2. Frontend calls `scan_project` to get topology, commands, env scopes, and tech stack.
3. User launches command; frontend sends launch request and options.
4. Backend process pipeline prepares runtime and resolves environment context.
5. Process events stream back to UI (`launchTimeline`, `launchLog`, `stdout`, `stderr`, `exit`, `error`).

## Command type model

- `local-process`: long-running local services/dev servers.
- `one-shot`: finite local commands (tests/build/migrate/lint).
- `orchestrator`: service orchestration commands (compose/foreman style).
- `cloud-job`: remote provider submission workflows.

## Environment tier model

- `varlock`: schema-aware env handling with vault references.
- `dotenv`: plain environment files.
- `none`: no env overlay.

## Notes on current maturity

- Python and Node runtime drivers provide the deepest auto-preparation behavior.
- Rust and Go are detected but still require expanded first-class command inference.
- Cloud-job classification exists with lifecycle depth still in progress.
