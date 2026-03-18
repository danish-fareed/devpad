use crate::discovery::commands::{save_custom_command_to_vibestart, scan_project_from_path};
use crate::discovery::types::ProjectScan;
use std::path::Path;

#[tauri::command]
pub fn scan_project(cwd: String) -> Result<ProjectScan, String> {
    let path = Path::new(&cwd);
    if !path.exists() || !path.is_dir() {
        return Err(format!("Directory does not exist: {}", cwd));
    }
    scan_project_from_path(&cwd).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn save_custom_command(
    cwd: String,
    name: String,
    command: String,
    category: String,
) -> Result<(), String> {
    save_custom_command_to_vibestart(&cwd, name, command, category).map_err(|e| e.to_string())
}
