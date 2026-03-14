# Phase 1: Varlock Vault — Implementation Walkthrough

## What Was Built

A complete **encrypted environment vault** with XChaCha20-Poly1305 + Argon2id + HKDF + DEK/KEK architecture. Secrets are encrypted at rest and referenced via `varlock://vault/KEY` URIs in `.env` files.

---

## Backend (Rust)

### New Files

| File | Purpose |
|---|---|
| [crypto.rs](file:///d:/github/varlock_ui/src-tauri/src/vault/crypto.rs) | XChaCha20-Poly1305 AEAD, Argon2id KDF, HKDF stretch, DEK/KEK, secret generation |
| [vault_db.rs](file:///d:/github/varlock_ui/src-tauri/src/vault/vault_db.rs) | SQLite vault with encrypted fields, CRUD, import, ref writer, audit log |
| [resolver.rs](file:///d:/github/varlock_ui/src-tauri/src/vault/resolver.rs) | TOCTOU-safe `varlock://vault/KEY` reference resolution |
| [keyring.rs](file:///d:/github/varlock_ui/src-tauri/src/vault/keyring.rs) | OS Keychain (Windows Credential Manager) for key caching |
| [audit.rs](file:///d:/github/varlock_ui/src-tauri/src/vault/audit.rs) | Write-only audit logger for all vault operations |
| [vault_state.rs](file:///d:/github/varlock_ui/src-tauri/src/state/vault_state.rs) | In-memory DEK lifecycle with idle timeout + ZeroizeOnDrop |
| [vault.rs](file:///d:/github/varlock_ui/src-tauri/src/commands/vault.rs) | 14 Tauri commands for all vault operations |

### Modified Files

| File | Change |
|---|---|
| [Cargo.toml](file:///d:/github/varlock_ui/src-tauri/Cargo.toml) | Added `chacha20poly1305`, `argon2`, `hkdf`, `sha2`, `rand`, `zeroize`, `rusqlite`, `keyring`, `chrono`, `thiserror` |
| [lib.rs](file:///d:/github/varlock_ui/src-tauri/src/lib.rs) | Registered vault module, VaultState, 14 commands, background idle checker, window close auto-lock |
| [state/mod.rs](file:///d:/github/varlock_ui/src-tauri/src/state/mod.rs) | Added `vault_state` module |
| [commands/mod.rs](file:///d:/github/varlock_ui/src-tauri/src/commands/mod.rs) | Added `vault` module |

### Test Results — 25/25 ✅

```
test vault::crypto::tests::test_key_derivation_roundtrip ... ok
test vault::crypto::tests::test_hkdf_stretch ... ok
test vault::crypto::tests::test_dek_protect_unprotect ... ok
test vault::crypto::tests::test_dek_wrong_password ... ok
test vault::crypto::tests::test_encrypt_decrypt_roundtrip ... ok
test vault::crypto::tests::test_encrypt_different_nonces ... ok
test vault::crypto::tests::test_decrypt_tampered_data ... ok
test vault::crypto::tests::test_protected_dek_serialization ... ok
test vault::crypto::tests::test_generate_secret_hex ... ok
test vault::crypto::tests::test_generate_secret_uuid ... ok
test vault::crypto::tests::test_generate_secret_alphanumeric ... ok
test vault::vault_db::tests::test_setup_and_unlock ... ok
test vault::vault_db::tests::test_set_and_get_variable ... ok
test vault::vault_db::tests::test_get_all_variables ... ok
test vault::vault_db::tests::test_update_variable ... ok
test vault::vault_db::tests::test_delete_variable ... ok
test vault::vault_db::tests::test_env_isolation ... ok
test vault::vault_db::tests::test_import_env ... ok
test vault::vault_db::tests::test_generate_ref_env ... ok
test vault::vault_db::tests::test_audit_log ... ok
test vault::vault_db::tests::test_wrong_dek_cannot_read ... ok
test vault::resolver::tests::test_resolve_mixed_env ... ok
test vault::resolver::tests::test_resolve_unresolvable_ref ... ok
test vault::resolver::tests::test_is_varlock_ref ... ok
test vault::resolver::tests::test_extract_ref_key ... ok
```

---

## Frontend (React/TypeScript)

### New Files

| File | Purpose |
|---|---|
| [vault.ts](file:///d:/github/varlock_ui/src/lib/vault.ts) | Typed Tauri invoke wrappers for all 14 vault commands |
| [vaultStore.ts](file:///d:/github/varlock_ui/src/stores/vaultStore.ts) | Zustand store: unlock/lock lifecycle, variable CRUD, import, secret gen |
| [VaultUnlockScreen.tsx](file:///d:/github/varlock_ui/src/components/vault/VaultUnlockScreen.tsx) | Master password entry, first-time setup, "remember me", auto-unlock |

### Modified Files

| File | Change |
|---|---|
| [types.ts](file:///d:/github/varlock_ui/src/lib/types.ts) | Added `VaultStatusResult`, `VaultVariable`, `SecretType`, `"vault"` to `AppView` |
| [App.tsx](file:///d:/github/varlock_ui/src/App.tsx) | Vault unlock gate before main app |
| [AppLayout.tsx](file:///d:/github/varlock_ui/src/components/layout/AppLayout.tsx) | Added VaultView with status panel + lock button |
| [Sidebar.tsx](file:///d:/github/varlock_ui/src/components/layout/Sidebar.tsx) | Added "Vault" nav item with shield icon |

### Build Result — ✅

`npm run build` succeeds with no errors.

---

## Architecture Summary

```
User enters password
    ↓
Argon2id (64MB, 3 iter) → 256-bit Master Key
    ↓
HKDF-SHA256 → 512-bit Stretched Key (encryption + MAC halves)
    ↓
XChaCha20-Poly1305 → Decrypt DEK (stored in vault header)
    ↓
DEK encrypts/decrypts all variable values + key names
    ↓
Variables stored in SQLite with encrypted fields
    ↓
.env files contain varlock://vault/KEY references
    ↓
Resolver resolves references from vault at runtime
```

## Next Steps

Phases 2-4 (Setup Wizard, AI Context Generator, Team Sync) are ready to build on this foundation.
