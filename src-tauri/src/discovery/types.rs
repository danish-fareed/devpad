use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "kebab-case")]
pub enum ProjectNodeType {
    Standalone,
    MonorepoRoot,
    MonorepoChild,
    Subproject,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(rename_all = "kebab-case")]
pub enum RuntimeKind {
    Node,
    Python,
    DockerCompose,
    Rust,
    Go,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "kebab-case")]
pub enum WorkspacePackageManager {
    Bun,
    Npm,
    Pnpm,
    Yarn,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProjectNode {
    pub id: String,
    pub project_id: String,
    pub parent_id: Option<String>,
    pub name: String,
    pub path: String,
    pub rel_path: String,
    pub node_type: ProjectNodeType,
    pub runtimes: Vec<RuntimeKind>,
    pub python_interpreter_path: Option<String>,
    pub workspace_package_manager: Option<WorkspacePackageManager>,
    pub is_runnable: bool,
    pub sort_order: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "kebab-case")]
pub enum CommandType {
    LocalProcess,
    OneShot,
    CloudJob,
    Orchestrator,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CloudJobConfig {
    pub provider: String,
    pub submit_parser_regex: String,
    pub job_id_field_name: String,
    pub status_command_template: String,
    pub log_url_template: String,
    pub poll_interval_ms: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EnvScope {
    pub scope_path: String,
    pub files: Vec<String>,
    pub active_env_name: String,
    pub has_varlock: bool,
    pub is_plain_dotenv: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
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
    pub command_fingerprint: String,
    // Backward-compatible UI fields
    pub raw_cmd: String,
    pub category: String,
    pub sort_order: i32,
    pub is_custom: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProjectTopology {
    pub project_id: String,
    pub root_node_id: String,
    pub nodes: Vec<ProjectNode>,
    pub commands: Vec<DiscoveredCommand>,
    pub env_scopes: Vec<EnvScope>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProjectScan {
    pub project_id: String,
    pub root_node_id: String,
    pub nodes: Vec<ProjectNode>,
    pub commands: Vec<DiscoveredCommand>,
    pub env_scopes: Vec<EnvScope>,
    pub tech_stack: Vec<String>,
    pub has_varlock: bool,
    pub env_tier: String,
    pub env_files: Vec<String>,
}
