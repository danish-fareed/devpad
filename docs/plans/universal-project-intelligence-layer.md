# Universal Project Intelligence Layer for Devpad

## Section 1 — Detection layer (`src-tauri/src/discovery/detector.rs`)

- Purpose: produce project topology only (nodes, relationships, runtimes, env scopes), no command extraction.
- Entry point (used when user adds a folder):

```rust
pub fn detect_topology(input_path: &Path) -> Result<ProjectTopology, DetectError>;
```

- Supporting signatures:

```rust
pub fn resolve_registration_root(input_path: &Path) -> Result<ResolvedRoot, DetectError>;
pub fn is_monorepo_root(path: &Path) -> Result<MonorepoSignals, DetectError>;
pub fn detect_workspace_package_manager(path: &Path) -> WorkspacePackageManager;
pub fn discover_nested_roots(root: &Path, max_depth: usize) -> Result<Vec<DetectedRoot>, DetectError>;
pub fn detect_runtime_kinds(path: &Path) -> Result<Vec<RuntimeKind>, DetectError>;
pub fn detect_env_scope(project_root: &Path, scope_rel_path: &Path) -> Result<EnvScope, DetectError>;
pub fn is_runnable_node_package(path: &Path) -> Result<bool, DetectError>;
pub fn is_runnable_python_project(path: &Path) -> Result<bool, DetectError>;
pub fn normalize_rel_path(root: &Path, child: &Path) -> Result<String, DetectError>;
```

- Exact monorepo indicators (any true => monorepo root):
  - `package.json` with `workspaces` key (`array` or `object.packages`)
  - `pnpm-workspace.yaml`
  - `turbo.json`
  - `nx.json`
  - `lerna.json`
  - `rush.json`
  - `Cargo.toml` containing `[workspace]`
  - `go.work`

- Registration-root resolution rule:
  - If added path itself is monorepo root => register root.
  - Else walk upward to filesystem boundary (or until `.git` root) and pick nearest ancestor with monorepo indicators.
  - If ancestor found: register ancestor as root and mark originally-added path as initially selected child node.
  - If none found: treat added path as standalone.
  - This solves “user adds `apps/tenant-app` directly” by promoting to workspace root when present.

- Nested root discovery algorithm:
  - DFS with `max_depth = 6`.
  - Do not follow symlinked directories; keep a visited set of canonical paths to prevent recursion loops.
  - Treat git submodules as normal children only when they contain runtime triggers; do not recurse above their own root.
  - Skip directories exactly: `.git`, `node_modules`, `.venv`, `venv`, `.env`, `dist`, `build`, `.next`, `.turbo`, `.nx`, `target`, `.idea`, `.vscode`, `coverage`, `__pycache__`.
  - Root triggers:
    - Node: `package.json`
    - Python: `pyproject.toml` or `requirements.txt` or `setup.py`
    - Rust: `Cargo.toml` (non-workspace child or binary crate)
    - Go: `go.mod`
    - Compose scope: `docker-compose.yml` or `docker-compose.yaml` (marks orchestrator scope; not separate child node unless directory also has runtime trigger)
  - Monorepo child inclusion rule:
    - Include `apps/*` and `services/*` by default.
    - `packages/*` included only if runnable via heuristics below.
  - Runnable filters:
    - Node runnable if scripts include one of `dev|start|serve|preview|android|ios|web`, or file `app.config.js|app.json|eas.json|next.config.*|vite.config.*` exists.
    - Python runnable if one of `main.py|manage.py|app/main.py|wsgi.py|asgi.py` exists, or pyproject defines scripts, or Makefile target suggests run/test/train.
  - Runtime precedence (for deterministic UI ordering when a node matches multiple runtimes):
    - `docker-compose` -> `node` -> `python` -> `rust` -> `go`.

- Sidebar representation model:
  - One top-level entry per registered root project.
  - If monorepo: entry is collapsible; children are discovered runnable child nodes.
  - Selecting root => unified command grid across root + children.
  - Selecting child => command grid filtered to that child only.

- Env scoping during detection:
  - `EnvScope.scope_path` is per node path (`"."`, `backend`, `frontend`, `apps/tenant-app`, etc.).
  - `.env*` files are discovered only within each scope directory (not inherited from sibling scopes).
  - Canonicalize and validate every scope path against project root; reject any normalized path escaping root (e.g. `../`).

- Discovery freshness and incremental refresh:
  - Persist per-project discovery metadata: `topology_version`, `last_scanned_at`, and per-node fingerprint (`package.json`, `pyproject.toml`, `docker-compose.*`, `Cargo.toml`, `go.mod`).
  - On refresh, run incremental scan for changed fingerprints first; fallback to full rescan when root indicators change.
  - Filesystem watcher events are debounced (`300-750ms`) and coalesced by scope path before re-discovery.

## Section 2 — Command discovery layer (`src-tauri/src/discovery/commands.rs`)

- Purpose: build normalized `DiscoveredCommand` list from topology + runtime scanners.
- Entry point:

```rust
pub fn discover_commands(topology: &ProjectTopology) -> Result<Vec<DiscoveredCommand>, DiscoverError>;
```

- Supporting signatures:

```rust
pub fn discover_node_commands(node: &ProjectNode) -> Result<Vec<DiscoveredCommand>, DiscoverError>;
pub fn discover_python_commands(node: &ProjectNode) -> Result<Vec<DiscoveredCommand>, DiscoverError>;
pub fn discover_compose_commands(node: &ProjectNode, project_root: &Path) -> Result<Vec<DiscoveredCommand>, DiscoverError>;
pub fn classify_command_type(cmd: &RawCommand, source: CommandSource) -> CommandType;
pub fn infer_env_scope_for_command(node: &ProjectNode, cmd_cwd_rel: &str) -> EnvScopeRef;
pub fn qualify_command_name(node: &ProjectNode, raw_name: &str) -> String;
```

- Unified grid behavior:
  - Root selection returns merged commands from all descendant runnable nodes + root-level commands.
  - Every card includes `scope_path` and source label format:
    - `source_label = "{scope_path}:{source_file}"` (e.g. `backend:requirements.txt`, `apps/tenant-app:package.json`, `.:docker-compose.yml`).
  - Duplicate command naming policy:
    - Keep stable `id` unique per `(project_id,node_id,name,command,args)` fingerprint.
    - If display names collide in merged root view, qualify with scope for display only (e.g. `dev (frontend)`, `dev (backend)`).

- CWD assignment:
  - `cwd_override` always set relative to registered root (`"."`, `backend`, `frontend`, `apps/tenant-app`).
  - Launcher computes absolute cwd = `project_root.join(cwd_override)`.

- Command type taxonomy + detection heuristics:
  - `orchestrator`
    - Source file is compose (`docker-compose.yml/yaml`) and command starts with `docker compose up`/`docker-compose up`.
    - Also classify `foreman start`, `honcho start`.
  - `cloud-job`
    - Command starts with `eas build` (without `--local`), `eas submit`, `vercel deploy`.
    - Must include job parser config (`cloud_job_config`).
  - `local-process`
    - Script names `dev|start|serve|watch`.
    - Or binaries `expo start`, `next dev`, `vite`, `uvicorn --reload`, `gunicorn --reload`, `jest --watch`, `webpack --watch`.
  - `one-shot`
    - Default fallback.
    - Explicit script names `build|test|lint|typecheck|migrate|format|ci`.
    - `eas build --local` forced one-shot.

- Workspace vs app-level distinction:
  - Root `package.json` scripts tagged `scope_kind = workspace-root`.
  - Child `package.json` scripts tagged `scope_kind = app`.
  - If root script contains `--filter`, `--workspace`, `-w`, `--cwd`, keep in root scope and label `workspace command`.

- Parsing/normalization policy:
  - Parse script commands into `command` + `args` using platform-safe tokenization (preserve quoted segments).
  - Support common inline env prefixes (`FOO=bar cmd`) and shell chains (`&&`, `||`) by storing raw form when lossless splitting is not possible.
  - Keep an optional `raw_command` field in discovery pipeline for exact replay/debugging.

## Section 3 — Python runtime layer (`src-tauri/src/discovery/python.rs`)

- Purpose: detect interpreter and rewrite python commands without shell activation.
- Signatures:

```rust
pub fn detect_python_environment(node_abs_path: &Path) -> Result<PythonEnvInfo, PythonDetectError>;
pub fn detect_venv_path(node_abs_path: &Path) -> Option<PathBuf>;
pub fn resolve_poetry_env(node_abs_path: &Path) -> Option<PathBuf>;
pub fn resolve_conda_env(node_abs_path: &Path) -> Option<PathBuf>;
pub fn python_binary_for_venv(venv_dir: &Path) -> PathBuf;
pub fn bin_path_for_venv_tool(venv_dir: &Path, tool: &str) -> PathBuf;
pub fn apply_python_substitution(cmd: &DiscoveredCommand, env: &PythonEnvInfo) -> ResolvedLaunchCommand;
```

- Venv detection order (stop at first valid):
  1. `<node>/.venv`
  2. `<node>/venv`
  3. `<node>/.env` (directory only, not dotenv file)
  4. Poetry env (via `poetry env info -p` if `poetry.lock` exists; cached result persisted)
  5. Conda env if `<node>/conda-meta` exists or `CONDA_PREFIX` points to env with `conda-meta`

- Platform interpreter paths:
  - Windows: `{venv}/Scripts/python.exe`
  - Unix: `{venv}/bin/python`

- Substitution rules:
  - `python ...` / `python3 ...` / `py ...` => replace executable with venv python path.
  - `pytest ...` => use `{venv}/Scripts/pytest.exe` (win) or `{venv}/bin/pytest` (unix), fallback `python -m pytest`.
  - `uvicorn ...` / `gunicorn ...` => use venv binary path if exists, else `python -m uvicorn|gunicorn`.
  - `python script.py` remains positional args; only executable replaced.
  - Module-style command already represented as `python -m module` keeps `-m`.
  - For discovered Python commands with `requires_venv=true` and no venv found: keep original executable and attach warning metadata.

- Card display:
  - Add badge `venv: <name>` (e.g. `.venv`, `poetry`, `conda`) with tooltip full interpreter path.
  - If none found and `requires_venv=true`: warning badge `No venv (using system)`.

## Section 4 — Process launcher modifications (`src-tauri/src/commands/process.rs`)

- Keep current `varlock_run` behavior for existing payloads; add optional launch options.
- Updated request model:

```rust
#[derive(Deserialize)]
pub struct RunCommandRequest {
    pub project_id: String,
    pub command_id: String,
    pub command: String,
    pub args: Vec<String>,
    pub env_name: Option<String>,
    pub launch_options: Option<LaunchOptions>, // new, optional
}

#[derive(Deserialize, Default)]
pub struct LaunchOptions {
    pub cwd_override: Option<String>,
    pub interpreter_override: Option<String>,
    pub command_type: Option<CommandType>,
    pub orchestrator_stop: Option<StopStrategy>,
    pub env_scope_path: Option<String>,
}
```

- New routing function:

```rust
pub fn run_with_type(req: &RunCommandRequest, resolved: &ResolvedLaunchContext) -> Result<LaunchHandle, LaunchError>;
```

- Command-type behavior:
  - `local-process`
    - Play: spawn tmux session as today.
    - Stop: SIGTERM/Kill existing logic.
    - Terminal: attach tmux.
  - `one-shot`
    - Play: spawn detached worker, wait for exit, persist exit code; no long-lived session required.
    - Stop: optional force kill only while running.
  - `orchestrator`
    - Play: run `docker compose up` (or source command) in tmux.
    - Stop: execute configured stop command (`docker compose down`) in same cwd; do not SIGTERM primary process first.
  - `cloud-job`
    - Play: execute submit command as one-shot; parse job id; return `LaunchHandle::Cloud`.
    - Terminal icon opens `cloud_job_config.log_url_template` with `job_id`; no tmux attach.
    - Polling uses bounded retry with exponential backoff and jitter; terminal states include `unknown` for provider/API ambiguity.

- Env loading changes:
  - Resolve env by `env_scope_path`, not always project root.
  - Vault key format must remain: `varlock-key-hash:v2:{normalized_cwd}:{env_name}:{key}`.
  - For plain `.env`, use `env_name = "default"`.
  - If varlock present in scope: load schema values first, fallback to `.env` for missing keys only.
  - Maintain in-memory-only secret injection and stream ingress redaction.

- Stop endpoint extension:

```rust
pub fn stop_command(session_id: &str) -> Result<StopResult, LaunchError>;
```

- It reads persisted `session_kind` and `stop_strategy` from DB (see Section 5).
- Orchestrator stop strategy must preserve compose flags from launch (`-f`, `--project-name`, `--profile`) when building down command.

## Section 5 — Database schema additions (`src-tauri/src/db/`)

- New migration file: `migrations/00xx_project_intelligence.sql`.
- Exact SQL:

```sql
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS project_nodes (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  parent_id TEXT NULL,
  name TEXT NOT NULL,
  rel_path TEXT NOT NULL,                     -- "." for root
  node_type TEXT NOT NULL CHECK (node_type IN ('standalone','monorepo-root','monorepo-child','subproject')),
  workspace_package_manager TEXT NULL CHECK (workspace_package_manager IN ('bun','npm','pnpm','yarn')),
  runtimes_json TEXT NOT NULL,                -- JSON array of runtime strings
  python_interpreter_path TEXT NULL,
  is_runnable INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY(parent_id) REFERENCES project_nodes(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_project_nodes_project_relpath
  ON project_nodes(project_id, rel_path);

CREATE INDEX IF NOT EXISTS idx_project_nodes_project_parent
  ON project_nodes(project_id, parent_id);

CREATE TABLE IF NOT EXISTS env_scopes (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  node_id TEXT NOT NULL,
  scope_path TEXT NOT NULL,                   -- relative to project root
  files_json TEXT NOT NULL,                   -- JSON array of file names
  active_env_name TEXT NOT NULL DEFAULT 'default',
  has_varlock INTEGER NOT NULL DEFAULT 0,
  is_plain_dotenv INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY(node_id) REFERENCES project_nodes(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_env_scopes_project_scope
  ON env_scopes(project_id, scope_path);

CREATE TABLE IF NOT EXISTS discovered_commands_v2 (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  node_id TEXT NOT NULL,
  name TEXT NOT NULL,
  command TEXT NOT NULL,
  args_json TEXT NOT NULL,
  source TEXT NOT NULL,
  source_file TEXT NOT NULL,
  command_type TEXT NOT NULL CHECK (command_type IN ('local-process','one-shot','cloud-job','orchestrator')),
  cwd_override TEXT NOT NULL DEFAULT '.',
  interpreter_override TEXT NULL,
  requires_venv INTEGER NOT NULL DEFAULT 0,
  cloud_job_config_json TEXT NULL,
  env_scope_path TEXT NOT NULL DEFAULT '.',
  command_fingerprint TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY(node_id) REFERENCES project_nodes(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_discovered_commands_v2_project
  ON discovered_commands_v2(project_id);

CREATE INDEX IF NOT EXISTS idx_discovered_commands_v2_project_node_type
  ON discovered_commands_v2(project_id, node_id, command_type);

CREATE TABLE IF NOT EXISTS run_sessions_v2 (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  command_id TEXT NOT NULL,
  session_kind TEXT NOT NULL CHECK (session_kind IN ('local-process','one-shot','cloud-job','orchestrator')),
  stop_strategy_json TEXT NULL,
  cloud_job_id TEXT NULL,
  cloud_status TEXT NULL,
  last_status_at TEXT NULL,
  cwd_abs TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS project_discovery_state (
  project_id TEXT PRIMARY KEY,
  topology_version INTEGER NOT NULL DEFAULT 1,
  root_fingerprint TEXT NULL,
  last_scanned_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
);
```

- Migration strategy for existing installs:
  - Create tables only (non-destructive).
  - Backfill one `project_nodes` root row per existing `projects.id` with `rel_path='.'`, `node_type='standalone'`.
  - Existing command table remains; new UI/API reads from `discovered_commands_v2` first, falls back to legacy table if empty.
  - Existing run sessions remain valid; new sessions use `run_sessions_v2`.

- Rust data model definitions (new entities):

```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ProjectNodeType { Standalone, MonorepoRoot, MonorepoChild, Subproject }

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RuntimeKind { Node, Python, DockerCompose, Rust, Go }

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum WorkspacePackageManager { Bun, Npm, Pnpm, Yarn }

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectNode {
    pub id: String,
    pub project_id: String,
    pub parent_id: Option<String>,
    pub name: String,
    pub path: String, // absolute path
    pub rel_path: String,
    pub node_type: ProjectNodeType,
    pub runtimes: Vec<RuntimeKind>,
    pub python_interpreter_path: Option<String>,
    pub workspace_package_manager: Option<WorkspacePackageManager>,
    pub is_runnable: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum CommandType { LocalProcess, OneShot, CloudJob, Orchestrator }

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CloudJobConfig {
    pub provider: String, // "eas" | "vercel"
    pub submit_parser_regex: String,
    pub job_id_field_name: String,
    pub status_command_template: String,
    pub log_url_template: String,
    pub poll_interval_ms: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EnvScope {
    pub scope_path: String,
    pub files: Vec<String>,
    pub active_env_name: String,
    pub has_varlock: bool,
    pub is_plain_dotenv: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiscoveredCommand {
    pub id: String,
    pub project_id: String,
    pub node_id: String,
    pub name: String,
    pub command: String,
    pub args: Vec<String>,
    pub source: String,
    pub source_file: String,
    pub command_type: CommandType,
    pub cwd_override: String,
    pub interpreter_override: Option<String>,
    pub requires_venv: bool,
    pub cloud_job_config: Option<CloudJobConfig>,
    pub env_scope: EnvScope,
}
```

## Section 6 — Frontend type updates (`src/lib/types.ts`)

- Exact interfaces:

```ts
export type ProjectNodeType = "standalone" | "monorepo-root" | "monorepo-child" | "subproject";
export type RuntimeKind = "node" | "python" | "docker-compose" | "rust" | "go";
export type WorkspacePackageManager = "bun" | "npm" | "pnpm" | "yarn";
export type CommandType = "local-process" | "one-shot" | "cloud-job" | "orchestrator";

export interface ProjectNode {
  id: string;
  projectId: string;
  parentId: string | null;
  name: string;
  path: string;
  relPath: string;
  nodeType: ProjectNodeType;
  runtimes: RuntimeKind[];
  pythonInterpreterPath: string | null;
  workspacePackageManager: WorkspacePackageManager | null;
  isRunnable: boolean;
  sortOrder: number;
}

export interface EnvScope {
  scopePath: string;
  files: string[];
  activeEnvName: string; // "default" for plain .env
  hasVarlock: boolean;
  isPlainDotenv: boolean;
}

export interface CloudJobConfig {
  provider: "eas" | "vercel" | "generic";
  submitParserRegex: string;
  jobIdFieldName: string;
  statusCommandTemplate: string;
  logUrlTemplate: string;
  pollIntervalMs: number;
}

export interface DiscoveredCommand {
  id: string;
  projectId: string;
  nodeId: string;
  name: string;
  command: string;
  args: string[];
  source: string;
  sourceFile: string;
  commandType: CommandType;
  cwdOverride: string;
  interpreterOverride: string | null;
  requiresVenv: boolean;
  cloudJobConfig: CloudJobConfig | null;
  envScope: EnvScope;
  commandFingerprint: string;
}

export interface ProjectTopology {
  projectId: string;
  rootNodeId: string;
  nodes: ProjectNode[];
  commands: DiscoveredCommand[];
  envScopes: EnvScope[];
}

export type CommandRunState =
  | { state: "idle" }
  | { state: "running"; startedAt: number; sessionId?: string }
  | { state: "completed"; exitCode: number; finishedAt: number }
  | { state: "failed"; error: string; finishedAt: number }
  | { state: "cloud-submitted"; jobId: string; submittedAt: number; logUrl?: string }
  | { state: "cloud-building"; jobId: string; updatedAt: number; logUrl?: string }
  | { state: "cloud-done"; jobId: string; updatedAt: number; logUrl?: string }
  | { state: "cloud-failed"; jobId: string; updatedAt: number; logUrl?: string };
```

## Section 7 — Sidebar UI changes (`src/components/layout/Sidebar.tsx`)

- Rendering rules:
  - Top-level item = registered root project.
  - If root has children (`nodeType=monorepo-child|subproject`), render chevron and collapsible list.
  - Child row label: `name` and small runtime pills (`node`, `python`, `docker`).
  - Status dot shown per child based on aggregate running command state in that child scope.
  - Ordering uses persisted `sort_order` (project-level and child-level).

- Drag-and-drop folder behavior:
  - Use `@dnd-kit/core` + `@dnd-kit/sortable` (+ keyboard sensor) for sidebar reorder interactions.
  - Allow reorder of root projects and children within the same parent.
  - Cross-parent node moves are disabled in V1 (visual blocked drop target + no DB write).
  - Persist new order optimistically; rollback UI if persistence fails.

- Interaction:
  - Clicking root selects `selectedNodeId = rootNodeId`; command grid shows merged commands.
  - Clicking child selects that node; grid filters `command.nodeId === selectedNodeId`.
  - Persist selected node per project in store.
  - Persist collapsed/expanded state per project root in store.

- Project A example:
  - `dooghoont-monorepo-lite` (parent)
    - `apps/tenant-app`
    - `apps/customer-app`
    - `apps/rider-app`
  - `packages/*` hidden unless runnable heuristics true.

- Project B example:
  - `TradeAgenticSystem` (parent/root view merged)
    - `backend`
    - `frontend`
    - `agent` (if runnable python detection passes)

## Section 8 — Command card changes (`src/components/commands/CommandCard.tsx`)

- Card layout fields always visible:
  - Title, source label (`{scopePath}:{sourceFile}`), command type badge, runtime badge, optional venv badge.

- Per-type button behavior:
  - `local-process`
    - Idle: `Play`, `Terminal` disabled.
    - Running: `Stop`, `Terminal` enabled.
    - Log peek: tail from tmux stream.
  - `one-shot`
    - Idle: `Run`.
    - Running: spinner + optional `Kill`.
    - Completed: show exit code chip.
    - Log peek: static captured output.
  - `orchestrator`
    - Idle: `Up`.
    - Running: `Down` (calls stop strategy compose down), `Terminal` enabled.
    - Log peek: prefixed multi-service output.
  - `cloud-job`
    - Idle: `Submit`.
    - Submitted/building: status chip + `Open Logs` (browser), no terminal attach.
    - Done/failed: final status chip + `Open Logs`.

- Explicit EAS state machine:
  - `idle -> cloud-submitted(jobId) -> cloud-building -> cloud-done | cloud-failed`
  - Transition source:
    - submit parser extracts `jobId`
    - polling command updates status
    - failure in submit => `failed` with error details.

## Section 9 — Env selector changes (`src/components/commands/EnvSelectorBar.tsx`)

- Selector is command-scope aware.
- Root view with mixed scopes:
  - Show `Scope` segmented control (`All`, plus each discovered `scopePath`).
  - Default `All`; selecting a scope filters grid and env selector context.
- Child view:
  - Scope fixed to selected node’s `env_scope_path`.

- Plain `.env` behavior:
  - If `isPlainDotenv=true` and only `.env` present:
    - Show `Environment: default` as non-dropdown chip (disabled caret).
    - No switching UI.
- Multi-suffix behavior:
  - Detect names from `.env.{name}` and show dropdown.
- Varlock interaction:
  - If `has_varlock=true`, selector still uses same env names.
  - If no matching env in schema, fallback `.env` in same scope.
- Migration prompt behavior:
  - If no varlock and plain `.env` only: banner `Migrate .env to .env.schema (default env)`.
  - Wizard defaults to single env `"default"`; optional advanced step for adding `development/staging/production`.

## Section 10 — Test plan

- Unit tests (`detector.rs`):
  - `detect_standalone_node_project_topology`
  - `detect_monorepo_root_from_package_workspaces`
  - `resolve_added_child_path_to_workspace_root`
  - `discover_nested_children_ignores_non_runnable_packages`
  - `detect_polyglot_subprojects_under_single_root`
  - `detect_plain_dotenv_scope_sets_default_env`
  - `discover_nested_children_ignores_symlink_loops`
  - `detect_runtime_precedence_is_deterministic`

- Unit tests (`python.rs`):
  - `detect_venv_prefers_dotvenv_over_venv`
  - `detect_venv_windows_python_path`
  - `detect_venv_unix_python_path`
  - `substitute_python_command_to_venv_python`
  - `substitute_pytest_to_venv_binary_with_module_fallback`
  - `substitute_uvicorn_and_gunicorn_to_venv_bin`
  - `no_venv_returns_warning_and_keeps_original_command`

- Integration fixtures:
  - `fixtures/project_a_dooghoont/` with explicit `package.json` scripts for root and three apps.
  - `fixtures/project_b_tradeagentic/` with root compose, backend `.env`, frontend `package.json`, agent python marker.
- Integration tests:
  - `integration_discovery_project_a_exact_commands`
    - Assert exact commands include:
      - root workspace scripts (with filter flags)
      - app scripts for tenant/customer/rider
      - `eas build --platform all` classified as `cloud-job`
  - `integration_discovery_project_b_exact_commands`
    - Assert exact commands include:
      - root `docker compose up/down` orchestrator
      - backend python commands with `cwd_override=backend`
      - frontend node commands with `cwd_override=frontend`
      - agent command inference if entrypoint exists
  - `integration_env_scope_resolution_per_command`
    - backend commands map to `backend/.env` only; frontend unaffected.
  - `integration_plain_dotenv_uses_default_env_name_for_vault_key`
    - verifies key format uses `default`.
  - `integration_duplicate_command_names_are_scope_qualified_in_root_view`
  - `integration_incremental_refresh_updates_changed_scope_only`

- Launcher integration tests:
  - `run_local_process_with_cwd_override`
  - `run_python_with_interpreter_override_inside_tmux`
  - `stop_orchestrator_executes_compose_down`
  - `run_cloud_job_returns_handle_without_tmux_session`

- Frontend UI tests:
  - `sidebar_renders_monorepo_parent_and_children`
  - `sidebar_root_selection_shows_merged_commands`
  - `command_card_cloud_job_eas_state_machine`
  - `command_card_orchestrator_buttons_up_down`
  - `env_selector_plain_dotenv_default_non_switchable`
  - `env_selector_scope_switches_between_backend_frontend`
  - `sidebar_dnd_reorder_root_projects_persists_sort_order`
  - `sidebar_dnd_reorder_children_within_parent`
  - `sidebar_dnd_disallow_cross_parent_move`
  - `sidebar_dnd_keyboard_reorder_accessible`

- Backward compatibility tests:
  - `legacy_varlock_run_payload_without_launch_options_still_runs`
  - `legacy_projects_without_project_nodes_fallback_to_root_node`
