//! OS Keyring integration for caching the master key.
//!
//! Uses Windows Credential Manager / macOS Keychain / Linux Secret Service
//! to store the derived master key for seamless re-unlock without re-entering
//! the password.

const SERVICE_NAME: &str = "com.varlock.vault";
const ACCOUNT_NAME: &str = "master-key";

/// Store the master key bytes in the OS keychain.
pub fn store_key(key_bytes: &[u8]) -> Result<(), String> {
    let entry = keyring::Entry::new(SERVICE_NAME, ACCOUNT_NAME)
        .map_err(|e| format!("Keyring entry error: {}", e))?;

    // Store as base64 since keyring expects a string
    let encoded = base64_encode(key_bytes);
    entry
        .set_password(&encoded)
        .map_err(|e| format!("Failed to store key in keyring: {}", e))?;

    Ok(())
}

/// Retrieve the master key bytes from the OS keychain.
pub fn retrieve_key() -> Result<Option<Vec<u8>>, String> {
    let entry = keyring::Entry::new(SERVICE_NAME, ACCOUNT_NAME)
        .map_err(|e| format!("Keyring entry error: {}", e))?;

    match entry.get_password() {
        Ok(encoded) => {
            let bytes = base64_decode(&encoded)
                .map_err(|e| format!("Failed to decode key from keyring: {}", e))?;
            Ok(Some(bytes))
        }
        Err(keyring::Error::NoEntry) => Ok(None),
        Err(e) => Err(format!("Failed to retrieve key from keyring: {}", e)),
    }
}

/// Delete the master key from the OS keychain.
pub fn delete_key() -> Result<(), String> {
    let entry = keyring::Entry::new(SERVICE_NAME, ACCOUNT_NAME)
        .map_err(|e| format!("Keyring entry error: {}", e))?;

    match entry.delete_credential() {
        Ok(()) => Ok(()),
        Err(keyring::Error::NoEntry) => Ok(()), // Already deleted
        Err(e) => Err(format!("Failed to delete key from keyring: {}", e)),
    }
}

/// Check if a master key is stored in the keychain.
pub fn has_stored_key() -> bool {
    retrieve_key().ok().flatten().is_some()
}

// Simple base64 helpers to avoid a full crate dependency

fn base64_encode(data: &[u8]) -> String {
    const CHARS: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let mut result = String::new();
    for chunk in data.chunks(3) {
        let b0 = chunk[0] as u32;
        let b1 = if chunk.len() > 1 { chunk[1] as u32 } else { 0 };
        let b2 = if chunk.len() > 2 { chunk[2] as u32 } else { 0 };
        let triple = (b0 << 16) | (b1 << 8) | b2;
        result.push(CHARS[((triple >> 18) & 0x3F) as usize] as char);
        result.push(CHARS[((triple >> 12) & 0x3F) as usize] as char);
        if chunk.len() > 1 {
            result.push(CHARS[((triple >> 6) & 0x3F) as usize] as char);
        } else {
            result.push('=');
        }
        if chunk.len() > 2 {
            result.push(CHARS[(triple & 0x3F) as usize] as char);
        } else {
            result.push('=');
        }
    }
    result
}

fn base64_decode(input: &str) -> Result<Vec<u8>, String> {
    let input = input.trim_end_matches('=');
    let mut result = Vec::new();
    let chars: Vec<u8> = input.bytes().collect();

    for chunk in chars.chunks(4) {
        let vals: Vec<u8> = chunk
            .iter()
            .map(|&c| match c {
                b'A'..=b'Z' => c - b'A',
                b'a'..=b'z' => c - b'a' + 26,
                b'0'..=b'9' => c - b'0' + 52,
                b'+' => 62,
                b'/' => 63,
                _ => 0,
            })
            .collect();

        if vals.len() >= 2 {
            result.push((vals[0] << 2) | (vals[1] >> 4));
        }
        if vals.len() >= 3 {
            result.push((vals[1] << 4) | (vals[2] >> 2));
        }
        if vals.len() >= 4 {
            result.push((vals[2] << 6) | vals[3]);
        }
    }

    Ok(result)
}
