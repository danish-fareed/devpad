# Varlock Security & Encryption Assessment Report

## Overview
Varlock implements a multi-layered encryption strategy based on a **DEK/KEK (Data Encryption Key / Key Encryption Key)** model. It utilizes industry-standard cryptographic primitives to ensure the confidentiality and integrity of environment variables stored in its vault.

## Cryptographic Stack
| Component | Primitive | Details |
| :--- | :--- | :--- |
| **Password Hashing (KDF)** | Argon2id | 64MB memory, 3 iterations, 4 parallelism. |
| **Authenticated Encryption** | XChaCha20-Poly1305 | 192-bit random nonces per encryption call. |
| **Key Stretching/Derivation** | HKDF-SHA256 | Used for domain separation between encryption and MAC keys. |
| **Secure Randomness** | `OsRng` | Cryptographically secure random number generator. |

## Key Management Architecture
1.  **Master Password**: User-provided password used to derive the KEK.
2.  **KEK (Key Encryption Key)**: Derived from the password via Argon2id and stretched via HKDF.
3.  **DEK (Data Encryption Key)**: A random 256-bit key used to encrypt the actual environment variables.
4.  **Protected DEK**: The DEK is encrypted with the KEK and stored in the SQLite database header alongside a unique salt.
5.  **Memory Lifecycle**: Decrypted DEK is stored in a `VaultState` with `ZeroizeOnDrop` ensuring it is wiped from memory when the application locks or terminates.

## Security Features
-   **Idle Timeout**: Auto-locks the vault after 15 minutes of inactivity (configurable).
-   **Audit Logging**: Every access (read, write, unlock, export) is logged to a local SQLite table without leaking secret values.
-   **Metadata Protection**: Key names are hashed using domain-separated SHA256 before being used as lookups in the database, preventing plaintext key names from being visible in the indices.
-   **Host Keyring Integration**: Optional "Remember Me" feature uses the OS-native keyring (Windows Credential Manager, macOS Keychain, Linux Secret Service).
-   **Zeroization**: Strict use of the `zeroize` crate for keys in memory.

## Findings & Recommendations (Bugs/Improvements)

### 1. Password Lingering in Memory (Low/Medium)
> [!WARNING]
> The `vault_unlock` and `vault_setup` Tauri commands receive the master password as a standard Rust `String`.

-   **Issue**: Rust `String` does not zeroize memory on drop. The password may remain in process memory until that memory is reused.
-   **Recommendation**: Use a dedicated `SecretString` wrapper or `zeroize` the password buffer immediately after key derivation.

### 2. IPC Boundary Security (Low)
> [!NOTE]
> All sensitive data (passwords, decrypted secrets) passes through the Tauri IPC bridge as JSON.

-   **Issue**: While local-only, IPC messages could be intercepted by malicious processes on the same machine or seen in memory during debugging.
-   **Recommendation**: This is a limitation of Tauri's architecture. Ensure the frontend never logs sensitive variables to the console.

### 3. Database Metadata Leakage (Low)
> [!IMPORTANT]
> The SQLite database file is not encrypted at rest; only specific fields are.

-   **Issue**: An attacker with access to the `vault.db` file can see the number of projects, types of variables, and descriptions in plaintext.
-   **Recommendation**: Consider using `SQLCipher` if full-database encryption is required.

### 4. Custom Base64 & Encoding (Informational)
> [!TIP]
> `keyring.rs` and `crypto.rs` contain manual implementations of Base64 encoding/decoding.

-   **Issue**: Generally, it is safer to use audited crates like `base64`. However, these implementations are simple and appear correct.
-   **Recommendation**: Replace with the `base64` crate to reduce the surface area for logic errors.

### 5. HashMap Secret Storage (Low)
> [!WARNING]
> `resolver::resolve_env` returns a full environment map as `HashMap<String, String>`.

-   **Issue**: Large amounts of plaintext secrets are held in non-zeroizing `String` objects while the process is running.
-   **Recommendation**: Implement a custom `SecureMap` that handles zeroization for transient sensitive data.

## Conclusion
The encryption implementation in Varlock follows modern best practices. There are no critical security vulnerabilities that allow unauthorized remote access or trivial local decryption. The identified "bugs" are primarily related to memory hygiene and defensive-in-depth improvements.
