# Project Start Techniques

This guide explains how Devpad starts different project types and what is currently automated.

## FastAPI (Uvicorn)

Expected project signals:

- `requirements.txt` or `pyproject.toml`
- FastAPI/Uvicorn dependency markers
- common app entrypoint files (`app/main.py`, `main.py`, `app.py`, etc.)

What Devpad does:

- Detects Python runtime and infers `uvicorn <target> --reload`.
- Resolves or creates venv (`.venv`/`venv`/`env`).
- Syncs dependencies based on configured Python manager.
- Launches with Python-aware substitution when needed.

Current stage:

- Runnable + auto-prepared. Fully integrated status pending broader lifecycle hardening.

## Django

Expected project signals:

- `manage.py`

What Devpad does:

- Infers `python manage.py runserver` and `python manage.py migrate`.
- Applies Python environment prep and sync path.

Current stage:

- Runnable + auto-prepared. Fully integrated status pending expanded command lifecycle tests.

## Flask

Expected project signals:

- Python markers plus Flask dependency indicator.

What Devpad does:

- Infers `flask run --reload`.
- Applies Python environment prep and sync path.

Current stage:

- Runnable + auto-prepared. Fully integrated status pending parity checks.

## Python test-only projects

Expected project signals:

- Python project marker and/or `pytest` dependency hints.

What Devpad does:

- Adds `pytest` runnable command.
- Uses venv `pytest` binary when available.
- Falls back to `python -m pytest` if direct binary is unavailable.

Current stage:

- Runnable + auto-prepared.

## Node projects (Next/Vite/Expo/generic scripts)

Expected project signals:

- `package.json` with scripts.

What Devpad does:

- Discovers scripts and classifies by command type.
- Runs script commands via package manager.
- Auto-selects manager from lockfiles (`pnpm`, `yarn`, `bun`, `npm`).
- Runs dependency sync before launch based on policy.

Current stage:

- Runnable + auto-prepared. Fully integrated status pending broader framework-specific lifecycle checks.

## Docker Compose services

Expected project signals:

- `docker-compose.yml` or `docker-compose.yaml`.

What Devpad does:

- Infers `docker compose up` and `docker compose down`.
- Classifies as `orchestrator`.

Current stage:

- Runnable. Auto-prepared is limited because lifecycle behavior is primarily delegated to compose.

## Rust projects

Expected project signals:

- Rust runtime markers.

What Devpad does now:

- Detects runtime.
- Can run custom shell commands configured by user.

What is pending:

- first-class inferred commands (`cargo run`, `cargo test`, profiles) and deeper lifecycle parity.

Current stage:

- Detected, partially runnable, not auto-prepared.

## Go projects

Expected project signals:

- Go runtime markers.

What Devpad does now:

- Detects runtime.
- Can run custom shell commands configured by user.

What is pending:

- first-class inferred commands (`go run`, `go test`) and deeper lifecycle parity.

Current stage:

- Detected, partially runnable, not auto-prepared.

## Environment handling model

Devpad applies one of three env tiers during launch:

- `varlock`: schema-aware validation and vault-aware resolution.
- `dotenv`: plain environment file scopes.
- `none`: launch without env overlay.

### Recommendation for onboarding projects

1. Ensure root runtime markers exist (`package.json`, `requirements.txt`, `pyproject.toml`, compose file, etc.).
2. Keep runnable commands explicit in scripts or standard entrypoints.
3. Add `.vibestart.json` for custom commands that are not inferable.
4. For Python, keep venv/project metadata consistent and prefer stable dependency managers.
