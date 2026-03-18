# Working Notes: Project Intelligence + Onboarding

## Scope and command UX improvements

- Moved scope selection out of the global sidebar and into the project overview context.
- Reworked scope navigation into a compact `ScopesBar` with drag-and-drop ordering.
- Fixed command-page rendering and selection stability issues:
  - removed unstable Zustand selector usage that caused `useSyncExternalStore` infinite updates,
  - corrected child-scope command filtering so node-scoped commands are always visible,
  - added defensive rendering fallbacks in command cards for incomplete metadata.

## Scoped environment loading behavior

- Environment loading now follows active selection:
  - root selection loads from project root,
  - child scope selection loads from that node path,
  - root + explicit scope filter resolves to the matching scoped node path.

## Add Project: GitHub clone flow

- Added a full clone onboarding mode in `AddProjectDialog` with two tabs:
  - `Local Folder` (existing behavior),
  - `Clone GitHub` (new behavior).
- Clone mode includes:
  - GitHub URL input with inline validation,
  - destination parent folder picker,
  - optional target folder name override,
  - computed final clone path preview.

### Backend support

- Added new Tauri command: `project_clone_github`.
- Validates URL format, destination path, and folder name safety.
- Runs `git clone` in a blocking task and returns actionable failure messages.
- Reuses project registration flow to auto-add and open cloned repositories.

### Frontend/store wiring

- Added frontend invoke wrapper: `projectCloneGithub`.
- Added store action: `cloneProjectFromGithub`.
- Successful clone immediately registers and activates the project.

## Quality checks run

- `npm test -- --run`
- `npx tsc --noEmit`
- `npm run build`
- `cargo check`
- `cargo test --lib`

All checks completed successfully.
