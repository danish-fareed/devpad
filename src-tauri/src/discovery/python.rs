use crate::discovery::types::{CommandType, DiscoveredCommand};
use std::path::{Path, PathBuf};

#[derive(Debug, Clone)]
pub enum PythonEnvKind {
    Venv,
    Poetry,
    Conda,
}

#[derive(Debug, Clone)]
pub struct PythonEnvInfo {
    pub kind: PythonEnvKind,
    pub root: PathBuf,
    pub interpreter: PathBuf,
}

#[derive(Debug, thiserror::Error)]
pub enum PythonDetectError {
    #[error("io error: {0}")]
    Io(#[from] std::io::Error),
}

#[derive(Debug, Clone)]
pub struct ResolvedLaunchCommand {
    pub command: String,
    pub args: Vec<String>,
    pub interpreter_override: Option<String>,
    pub requires_venv_warning: bool,
}

pub fn python_binary_for_venv(venv_dir: &Path) -> PathBuf {
    if cfg!(windows) {
        venv_dir.join("Scripts").join("python.exe")
    } else {
        venv_dir.join("bin").join("python")
    }
}

pub fn bin_path_for_venv_tool(venv_dir: &Path, tool: &str) -> PathBuf {
    if cfg!(windows) {
        venv_dir.join("Scripts").join(format!("{}.exe", tool))
    } else {
        venv_dir.join("bin").join(tool)
    }
}

pub fn detect_venv_path(node_abs_path: &Path) -> Option<PathBuf> {
    let candidates = [".venv", "venv", ".env"];
    for candidate in candidates {
        let p = node_abs_path.join(candidate);
        if p.is_dir() {
            let py = python_binary_for_venv(&p);
            if py.exists() {
                return Some(p);
            }
        }
    }
    None
}

pub fn resolve_poetry_env(_node_abs_path: &Path) -> Option<PathBuf> {
    None
}

pub fn resolve_conda_env(node_abs_path: &Path) -> Option<PathBuf> {
    let local = node_abs_path.join("conda-meta");
    if local.exists() {
        return Some(node_abs_path.to_path_buf());
    }
    None
}

pub fn detect_python_environment(node_abs_path: &Path) -> Result<PythonEnvInfo, PythonDetectError> {
    if let Some(venv) = detect_venv_path(node_abs_path) {
        return Ok(PythonEnvInfo {
            kind: PythonEnvKind::Venv,
            interpreter: python_binary_for_venv(&venv),
            root: venv,
        });
    }

    if let Some(poetry) = resolve_poetry_env(node_abs_path) {
        return Ok(PythonEnvInfo {
            kind: PythonEnvKind::Poetry,
            interpreter: python_binary_for_venv(&poetry),
            root: poetry,
        });
    }

    if let Some(conda) = resolve_conda_env(node_abs_path) {
        return Ok(PythonEnvInfo {
            kind: PythonEnvKind::Conda,
            interpreter: python_binary_for_venv(&conda),
            root: conda,
        });
    }

    Err(PythonDetectError::Io(std::io::Error::new(
        std::io::ErrorKind::NotFound,
        "no python environment found",
    )))
}

pub fn apply_python_substitution(
    cmd: &DiscoveredCommand,
    env: &PythonEnvInfo,
) -> ResolvedLaunchCommand {
    let mut command = cmd.command.clone();
    let mut args = cmd.args.clone();
    let mut interpreter_override = Some(env.interpreter.to_string_lossy().to_string());
    let mut warning = false;

    let lower = command.to_lowercase();
    if matches!(lower.as_str(), "python" | "python3" | "py") {
        command = env.interpreter.to_string_lossy().to_string();
    } else if lower == "pytest" {
        let pytest = bin_path_for_venv_tool(&env.root, "pytest");
        if pytest.exists() {
            command = pytest.to_string_lossy().to_string();
            interpreter_override = None;
        } else {
            command = env.interpreter.to_string_lossy().to_string();
            args = std::iter::once("-m".to_string())
                .chain(std::iter::once("pytest".to_string()))
                .chain(args)
                .collect();
        }
    } else if lower == "uvicorn" || lower == "gunicorn" {
        let bin = bin_path_for_venv_tool(&env.root, &lower);
        if bin.exists() {
            command = bin.to_string_lossy().to_string();
            interpreter_override = None;
        } else {
            command = env.interpreter.to_string_lossy().to_string();
            args = std::iter::once("-m".to_string())
                .chain(std::iter::once(lower))
                .chain(args)
                .collect();
        }
    } else if cmd.command_type == CommandType::LocalProcess && cmd.requires_venv {
        warning = true;
    }

    ResolvedLaunchCommand {
        command,
        args,
        interpreter_override,
        requires_venv_warning: warning,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn mk_temp_dir(name: &str) -> PathBuf {
        let base =
            std::env::temp_dir().join(format!("varlock_py_test_{}_{}", name, uuid::Uuid::new_v4()));
        std::fs::create_dir_all(&base).expect("create temp dir");
        base
    }

    #[test]
    fn detect_venv_prefers_dotvenv_over_venv() {
        let dir = mk_temp_dir("venv_preference");
        std::fs::create_dir_all(dir.join(".venv")).expect("mkdir .venv");
        std::fs::create_dir_all(dir.join("venv")).expect("mkdir venv");

        let dotvenv_py = python_binary_for_venv(&dir.join(".venv"));
        let dotvenv_parent = dotvenv_py.parent().expect("dotvenv parent");
        std::fs::create_dir_all(dotvenv_parent).expect("mkdir dotvenv bin");
        std::fs::write(&dotvenv_py, "").expect("write dotvenv python");

        let venv_py = python_binary_for_venv(&dir.join("venv"));
        let venv_parent = venv_py.parent().expect("venv parent");
        std::fs::create_dir_all(venv_parent).expect("mkdir venv bin");
        std::fs::write(&venv_py, "").expect("write venv python");

        let found = detect_venv_path(&dir).expect("venv found");
        assert!(found.ends_with(".venv"));
    }

    #[test]
    fn detect_venv_windows_python_path() {
        let path = python_binary_for_venv(Path::new("C:/repo/.venv"));
        if cfg!(windows) {
            assert!(path.to_string_lossy().ends_with("Scripts\\python.exe"));
        } else {
            assert!(path.to_string_lossy().ends_with("bin/python"));
        }
    }

    #[test]
    fn substitute_python_command_to_venv_python() {
        let env = PythonEnvInfo {
            kind: PythonEnvKind::Venv,
            root: PathBuf::from("/tmp/.venv"),
            interpreter: PathBuf::from("/tmp/.venv/bin/python"),
        };

        let cmd = DiscoveredCommand {
            id: "1".to_string(),
            project_id: "p".to_string(),
            node_id: "n".to_string(),
            name: "Run".to_string(),
            command: "python".to_string(),
            args: vec!["main.py".to_string()],
            source: "python".to_string(),
            source_file: "main.py".to_string(),
            command_type: CommandType::LocalProcess,
            cwd_override: ".".to_string(),
            interpreter_override: None,
            requires_venv: true,
            cloud_job_config: None,
            env_scope: crate::discovery::types::EnvScope {
                scope_path: ".".to_string(),
                files: vec![],
                active_env_name: "default".to_string(),
                has_varlock: false,
                is_plain_dotenv: false,
            },
            command_fingerprint: "fp".to_string(),
            raw_cmd: "python main.py".to_string(),
            category: "local-process".to_string(),
            sort_order: 0,
            is_custom: false,
        };

        let resolved = apply_python_substitution(&cmd, &env);
        assert_eq!(resolved.command, "/tmp/.venv/bin/python");
        assert_eq!(resolved.args, vec!["main.py"]);
    }
}
