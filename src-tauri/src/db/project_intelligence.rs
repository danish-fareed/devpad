use rusqlite::Connection;

pub const MIGRATION_00XX_PROJECT_INTELLIGENCE: &str = r#"
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS project_nodes (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  parent_id TEXT NULL,
  name TEXT NOT NULL,
  rel_path TEXT NOT NULL,
  node_type TEXT NOT NULL CHECK (node_type IN ('standalone','monorepo-root','monorepo-child','subproject')),
  workspace_package_manager TEXT NULL CHECK (workspace_package_manager IN ('bun','npm','pnpm','yarn')),
  runtimes_json TEXT NOT NULL,
  python_interpreter_path TEXT NULL,
  is_runnable INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_project_nodes_project_relpath
  ON project_nodes(project_id, rel_path);

CREATE INDEX IF NOT EXISTS idx_project_nodes_project_parent
  ON project_nodes(project_id, parent_id);

CREATE TABLE IF NOT EXISTS env_scopes (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  node_id TEXT NOT NULL,
  scope_path TEXT NOT NULL,
  files_json TEXT NOT NULL,
  active_env_name TEXT NOT NULL DEFAULT 'default',
  has_varlock INTEGER NOT NULL DEFAULT 0,
  is_plain_dotenv INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
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
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
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
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS project_discovery_state (
  project_id TEXT PRIMARY KEY,
  topology_version INTEGER NOT NULL DEFAULT 1,
  root_fingerprint TEXT NULL,
  last_scanned_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
"#;

pub fn apply_project_intelligence_migration(conn: &Connection) -> Result<(), rusqlite::Error> {
    conn.execute_batch(MIGRATION_00XX_PROJECT_INTELLIGENCE)
}
