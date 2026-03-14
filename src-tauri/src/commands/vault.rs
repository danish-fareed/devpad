//! Vault Tauri Commands
//!
//! Exposes vault operations to the frontend via Tauri's invoke handler.

use crate::state::vault_state::VaultState;
use crate::vault::{audit, crypto, resolver};
use crate::vault::vault_db::VaultVariable;
use serde::{Deserialize, Serialize};
use tauri::State;
use std::collections::HashMap;

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VaultStatus {
    pub initialized: bool,
    pub unlocked: bool,
    pub has_keychain_key: bool,
}

/// Get the current vault status.
#[tauri::command]
pub fn vault_status(vault: State<'_, VaultState>) -> Result<VaultStatus, String> {
    let initialized = vault.is_initialized()?;
    let unlocked = vault.is_unlocked();
    let has_keychain_key = crate::vault::keyring::has_stored_key();

    Ok(VaultStatus {
        initialized,
        unlocked,
        has_keychain_key,
    })
}

/// First-time vault setup with a master password.
#[tauri::command]
pub fn vault_setup(vault: State<'_, VaultState>, password: String) -> Result<(), String> {
    let dek = vault.db.setup(&password).map_err(|e| e.to_string())?;
    vault.store_dek(dek);
    audit::log_unlock(&vault.db);
    Ok(())
}

/// Unlock the vault with a master password.
#[tauri::command]
pub fn vault_unlock(
    vault: State<'_, VaultState>,
    password: String,
    remember: bool,
) -> Result<(), String> {
    let dek = vault.db.unlock(&password).map_err(|e| e.to_string())?;

    if remember {
        // Store the DEK bytes in the OS keychain for auto-unlock
        crate::vault::keyring::store_key(dek.as_bytes())?;
    }

    vault.store_dek(dek);
    audit::log_unlock(&vault.db);
    Ok(())
}

/// Try to auto-unlock from the OS keychain.
#[tauri::command]
pub fn vault_auto_unlock(vault: State<'_, VaultState>) -> Result<bool, String> {
    match crate::vault::keyring::retrieve_key()? {
        Some(key_bytes) => {
            if key_bytes.len() != 32 {
                return Err("Invalid key length in keychain".to_string());
            }
            let mut arr = [0u8; 32];
            arr.copy_from_slice(&key_bytes);
            let dek = crypto::SecureKey::from_bytes(arr);

            // Verify the DEK works by checking if the vault is initialized
            if vault.is_initialized()? {
                vault.store_dek(dek);
                audit::log_unlock(&vault.db);
                Ok(true)
            } else {
                Ok(false)
            }
        }
        None => Ok(false),
    }
}

/// Lock the vault (zeroize key from memory).
#[tauri::command]
pub fn vault_lock(vault: State<'_, VaultState>) -> Result<(), String> {
    audit::log_lock(&vault.db);
    vault.lock();
    Ok(())
}

/// Check if vault is unlocked.
#[tauri::command]
pub fn vault_is_unlocked(vault: State<'_, VaultState>) -> bool {
    vault.is_unlocked()
}

/// Import a `.env` file into the vault.
/// Rewrites the file with `varlock://vault/KEY` references for sensitive values.
#[tauri::command]
pub fn vault_import_env(
    vault: State<'_, VaultState>,
    project_id: String,
    env_name: String,
    env_content: String,
    sensitive_keys: Vec<String>,
) -> Result<String, String> {
    let dek = vault.require_dek()?;
    let count = vault
        .db
        .import_env(&dek, &project_id, &env_name, &env_content, &sensitive_keys)
        .map_err(|e| e.to_string())?;

    audit::log_import(&vault.db, &project_id, &env_name, count);

    // Generate the reference .env content
    let ref_env = vault
        .db
        .generate_ref_env(&dek, &project_id, &env_name)
        .map_err(|e| e.to_string())?;

    Ok(ref_env)
}

/// Get all decrypted variables for a project+env.
#[tauri::command]
pub fn vault_get_variables(
    vault: State<'_, VaultState>,
    project_id: String,
    env_name: String,
) -> Result<Vec<VaultVariable>, String> {
    let dek = vault.require_dek()?;
    vault
        .db
        .get_variables(&dek, &project_id, &env_name)
        .map_err(|e| e.to_string())
}

/// Set a single variable in the vault.
#[tauri::command]
pub fn vault_set_variable(
    vault: State<'_, VaultState>,
    project_id: String,
    env_name: String,
    key: String,
    value: String,
    var_type: String,
    sensitive: bool,
    required: bool,
    description: String,
) -> Result<(), String> {
    let dek = vault.require_dek()?;
    vault
        .db
        .set_variable(
            &dek,
            &project_id,
            &env_name,
            &key,
            &value,
            &var_type,
            sensitive,
            required,
            &description,
        )
        .map_err(|e| e.to_string())?;

    audit::log_write(&vault.db, &project_id, &env_name, &key);
    Ok(())
}

/// Delete a variable from the vault.
#[tauri::command]
pub fn vault_delete_variable(
    vault: State<'_, VaultState>,
    project_id: String,
    env_name: String,
    key: String,
) -> Result<bool, String> {
    vault
        .db
        .delete_variable(&project_id, &env_name, &key)
        .map_err(|e| e.to_string())
        .map(|deleted| {
            if deleted {
                audit::log_delete(&vault.db, &project_id, &env_name, &key);
            }
            deleted
        })
}

/// Generate a cryptographic secret.
#[tauri::command]
pub fn vault_generate_secret(
    secret_type: String,
    length: Option<usize>,
) -> String {
    crypto::generate_secret(&secret_type, length)
}

/// Resolve all `varlock://` references in an env file content.
/// Returns a fully-resolved environment map.
#[tauri::command]
pub fn vault_resolve_env(
    vault: State<'_, VaultState>,
    project_id: String,
    env_name: String,
    env_content: String,
) -> Result<HashMap<String, String>, String> {
    let dek = vault.require_dek()?;

    audit::log_export(&vault.db, &project_id, &env_name);

    resolver::resolve_env(&env_content, &dek, &vault.db, &project_id, &env_name)
        .map_err(|e| e.to_string())
}

/// Generate a `.env` file with vault references for sensitive values.
#[tauri::command]
pub fn vault_write_ref_env(
    vault: State<'_, VaultState>,
    project_id: String,
    env_name: String,
) -> Result<String, String> {
    let dek = vault.require_dek()?;
    vault
        .db
        .generate_ref_env(&dek, &project_id, &env_name)
        .map_err(|e| e.to_string())
}

/// Remove the keychain entry (for "forget this device").
#[tauri::command]
pub fn vault_forget_device() -> Result<(), String> {
    crate::vault::keyring::delete_key()
}
