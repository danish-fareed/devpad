//! Vault State — in-memory key lifecycle with idle timeout and auto-lock.
//!
//! Holds the decrypted DEK in memory while the vault is unlocked.
//! Implements ZeroizeOnDrop to clean up on process exit.
//! Tracks last access time for idle timeout (checked by background task).

use crate::vault::crypto::SecureKey;
use crate::vault::vault_db::VaultDb;
use std::sync::Mutex;
use std::time::Instant;

/// Default idle timeout: 15 minutes.
const DEFAULT_IDLE_TIMEOUT_SECS: u64 = 15 * 60;

/// Inner state protected by a Mutex.
struct VaultInner {
    /// The decrypted Data Encryption Key (None = locked).
    dek: Option<SecureKey>,
    /// Last time the vault was accessed.
    last_access: Option<Instant>,
    /// Idle timeout in seconds.
    idle_timeout_secs: u64,
}

/// Global vault state managed by Tauri.
pub struct VaultState {
    inner: Mutex<VaultInner>,
    /// The vault database (always available, even when locked).
    pub db: VaultDb,
}

impl VaultState {
    /// Create a new vault state with the database.
    pub fn new(db: VaultDb) -> Self {
        Self {
            inner: Mutex::new(VaultInner {
                dek: None,
                last_access: None,
                idle_timeout_secs: DEFAULT_IDLE_TIMEOUT_SECS,
            }),
            db,
        }
    }

    /// Check if the vault is currently unlocked.
    pub fn is_unlocked(&self) -> bool {
        let inner = self.inner.lock().unwrap();
        inner.dek.is_some()
    }

    /// Check if the vault has been initialized (has a header in the DB).
    pub fn is_initialized(&self) -> Result<bool, String> {
        self.db.is_initialized().map_err(|e| e.to_string())
    }

    /// Store the DEK after successful unlock.
    pub fn store_dek(&self, dek: SecureKey) {
        let mut inner = self.inner.lock().unwrap();
        inner.dek = Some(dek);
        inner.last_access = Some(Instant::now());
    }

    /// Get a clone of the DEK (updates last_access).
    /// Returns None if locked.
    pub fn get_dek(&self) -> Option<SecureKey> {
        let mut inner = self.inner.lock().unwrap();
        inner.last_access = Some(Instant::now());
        inner.dek.clone()
    }

    /// Get the DEK or return an error.
    pub fn require_dek(&self) -> Result<SecureKey, String> {
        self.get_dek()
            .ok_or_else(|| "Vault is locked. Unlock with your master password.".to_string())
    }

    /// Lock the vault — zeroize the DEK.
    pub fn lock(&self) {
        let mut inner = self.inner.lock().unwrap();
        inner.dek = None;
        inner.last_access = None;
    }

    /// Check if the idle timeout has elapsed and auto-lock if so.
    /// Called periodically by a background task.
    pub fn check_idle_timeout(&self) -> bool {
        let mut inner = self.inner.lock().unwrap();
        if let (Some(_), Some(last)) = (&inner.dek, &inner.last_access) {
            if last.elapsed().as_secs() >= inner.idle_timeout_secs {
                inner.dek = None;
                inner.last_access = None;
                return true; // Was locked
            }
        }
        false
    }

    /// Set the idle timeout in seconds.
    #[allow(dead_code)]
    pub fn set_idle_timeout(&self, secs: u64) {
        let mut inner = self.inner.lock().unwrap();
        inner.idle_timeout_secs = secs;
    }
}

/// When VaultState is dropped (process exit), the inner Mutex is dropped,
/// which drops VaultInner, which drops Option<SecureKey>.
/// SecureKey implements ZeroizeOnDrop, so the key material is securely wiped.
impl Drop for VaultState {
    fn drop(&mut self) {
        self.lock();
    }
}
