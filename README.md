<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/6372bfb4-58dd-410b-8c5d-8f024671c853" />

# Devpad

Devpad is a local-first desktop control plane for running polyglot projects with one-click commands.

It detects project topology, infers runnable commands across common stacks, applies environment loading (Varlock or plain dotenv), prepares runtime prerequisites when possible, and streams execution logs back to the UI.

## Product Direction

- One app to run multi-stack projects from a single dashboard.
- Framework-aware command discovery and launch classification.
- Environment-safe execution with vault-backed secret resolution.
- Local-first security model (no required cloud sync for secrets).

## Integration-First Documentation

- Integration taxonomy: `docs/product/INTEGRATIONS.md`
- Support matrix and maturity levels: `docs/product/SUPPORT_MATRIX.md`
- Project start playbooks by stack: `docs/development/PROJECT_START_TECHNIQUES.md`
- Integration roadmap and pending work: `docs/roadmap/INTEGRATION_ROADMAP.md`
- Module map (frontend/backend boundaries): `docs/architecture/REPO_MODULES.md`

## Support Levels

Devpad support is tracked using four levels:

1. `Detected` - project/runtime is recognized during scan.
2. `Runnable` - at least one command can be launched from the app.
3. `Auto-Prepared` - runtime bootstrap/sync is automated before launch.
4. `Fully Integrated` - full lifecycle behavior, UX parity, docs, and validation coverage.

## Core Technologies

- Frontend: React + TypeScript + Zustand + Tailwind
- Desktop shell/backend: Tauri + Rust
- Local storage: SQLite
- Crypto primitives: Argon2id, HKDF, XChaCha20-Poly1305

## Security

Security and audit artifacts are in `docs/audit`.

- Vault secrets remain local unless explicitly exported.
- Key material is derived and managed with defensive defaults.
- Process execution includes guarded environment resolution.

## Contributor Setup

Prerequisites:

- Node.js 18+
- Rust stable
- Tauri prerequisites for your OS

Install and run:

```bash
npm install
npm run tauri dev
```

Useful checks:

```bash
npm test -- --run
npm run build
```

Rust checks:

```bash
cargo check --manifest-path src-tauri/Cargo.toml
cargo test --manifest-path src-tauri/Cargo.toml
```

## License

Licensed under GNU Affero General Public License v3.0 (AGPLv3). See `LICENSE`.
