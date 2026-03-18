// ── Vault Tauri Command Wrappers ──

import { invoke } from "@tauri-apps/api/core";
import type { VaultVariable, VaultStatusResult, VaultVariableWithProject } from "./types";

/** Get the current vault status. */
export async function vaultStatus(): Promise<VaultStatusResult> {
  return invoke<VaultStatusResult>("vault_status");
}

/** First-time vault setup. */
export async function vaultSetup(password: string): Promise<void> {
  return invoke("vault_setup", { password });
}

/** Unlock vault with master password. */
export async function vaultUnlock(
  password: string,
  remember: boolean = false
): Promise<void> {
  return invoke("vault_unlock", { password, remember });
}

/** Try auto-unlock from OS keychain. */
export async function vaultAutoUnlock(): Promise<boolean> {
  return invoke<boolean>("vault_auto_unlock");
}

/** Lock the vault. */
export async function vaultLock(): Promise<void> {
  return invoke("vault_lock");
}

/** Check if vault is unlocked. */
export async function vaultIsUnlocked(): Promise<boolean> {
  return invoke<boolean>("vault_is_unlocked");
}

/** Import .env file into vault. Returns the reference .env content. */
export async function vaultImportEnv(
  projectId: string,
  envName: string,
  envContent: string,
  sensitiveKeys: string[]
): Promise<string> {
  return invoke<string>("vault_import_env", {
    projectId,
    envName,
    envContent,
    sensitiveKeys,
  });
}

/** Get all decrypted variables for a project+env. */
export async function vaultGetVariables(
  projectId: string,
  envName: string
): Promise<VaultVariable[]> {
  return invoke<VaultVariable[]>("vault_get_variables", {
    projectId,
    envName,
  });
}

/** Get all decrypted variables across all projects. */
export async function vaultGetAllVariables(): Promise<VaultVariableWithProject[]> {
  return invoke<VaultVariableWithProject[]>("vault_get_all_variables");
}

// ── Sharing ──

export async function vaultShareVariable(
  sourceProjectId: string,
  envName: string,
  key: string,
  targetProjectIds: string[]
): Promise<void> {
  return invoke("vault_share_variable", { sourceProjectId, envName, key, targetProjectIds });
}

export async function vaultUnshareVariable(
  sourceProjectId: string,
  envName: string,
  key: string,
  targetProjectId: string
): Promise<boolean> {
  return invoke<boolean>("vault_unshare_variable", { sourceProjectId, envName, key, targetProjectId });
}

export async function vaultGetSharedTargets(
  sourceProjectId: string,
  envName: string,
  key: string
): Promise<string[]> {
  return invoke<string[]>("vault_get_shared_targets", { sourceProjectId, envName, key });
}

export async function vaultGetVariablesSharedWith(
  targetProjectId: string
): Promise<VaultVariableWithProject[]> {
  return invoke<VaultVariableWithProject[]>("vault_get_variables_shared_with", { targetProjectId });
}

/** Set a variable in the vault. */
export async function vaultSetVariable(
  projectId: string,
  envName: string,
  key: string,
  value: string,
  varType: string = "string",
  sensitive: boolean = false,
  required: boolean = true,
  description: string = ""
): Promise<void> {
  return invoke("vault_set_variable", {
    projectId,
    envName,
    key,
    value,
    varType,
    sensitive,
    required,
    description,
  });
}

/** Delete a variable from the vault. */
export async function vaultDeleteVariable(
  projectId: string,
  envName: string,
  key: string
): Promise<boolean> {
  return invoke<boolean>("vault_delete_variable", {
    projectId,
    envName,
    key,
  });
}

/** Generate a cryptographic secret. */
export async function vaultGenerateSecret(
  secretType: string,
  length?: number
): Promise<string> {
  return invoke<string>("vault_generate_secret", {
    secretType,
    length: length ?? null,
  });
}

/** Resolve all varlock:// references in env content. */
export async function vaultResolveEnv(
  projectId: string,
  envName: string,
  envContent: string
): Promise<Record<string, string>> {
  return invoke<Record<string, string>>("vault_resolve_env", {
    projectId,
    envName,
    envContent,
  });
}

/** Generate a .env file with vault references. */
export async function vaultWriteRefEnv(
  projectId: string,
  envName: string
): Promise<string> {
  return invoke<string>("vault_write_ref_env", {
    projectId,
    envName,
  });
}

/** Remove keychain entry (forget this device). */
export async function vaultForgetDevice(): Promise<void> {
  return invoke("vault_forget_device");
}
