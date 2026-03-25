# Integrations

This document defines what Devpad currently supports across stacks and frameworks.

Status labels align to the support levels described in `README.md` and `docs/product/SUPPORT_MATRIX.md`.

## Python

### FastAPI / Uvicorn

- Detection signals:
  - `requirements.txt` or `pyproject.toml` containing `fastapi` or `uvicorn`
  - entrypoint heuristics (`app/main.py`, `main.py`, `app.py`, `src/main.py`, `src/app.py`, `server.py`)
- Inferred commands:
  - `uvicorn <target> --reload`
- Runtime behavior:
  - venv detection/reuse (`.venv`, `venv`, `env`)
  - venv creation when missing
  - dependency sync via manager strategy (`uv`, `poetry`, `pdm`, or `pip`)
- Current level:
  - Detected: yes
  - Runnable: yes
  - Auto-Prepared: yes
  - Fully Integrated: partial

### Flask

- Detection signals:
  - Python project markers and `flask` in dependency metadata
- Inferred commands:
  - `flask run --reload`
- Runtime behavior:
  - same Python venv and sync pipeline as FastAPI
- Current level:
  - Detected: yes
  - Runnable: yes
  - Auto-Prepared: yes
  - Fully Integrated: partial

### Django

- Detection signals:
  - `manage.py`
  - optional `django` dependency signal
- Inferred commands:
  - `python manage.py runserver`
  - `python manage.py migrate`
- Runtime behavior:
  - same Python venv and sync pipeline as FastAPI
- Current level:
  - Detected: yes
  - Runnable: yes
  - Auto-Prepared: yes
  - Fully Integrated: partial

### Python test workflows

- Detection signals:
  - `pytest` in dependency metadata or Python project marker fallback
- Inferred commands:
  - `pytest`
- Runtime behavior:
  - resolves venv `pytest` binary when available
  - falls back to `python -m pytest` when binary is missing
- Current level:
  - Detected: yes
  - Runnable: yes
  - Auto-Prepared: yes
  - Fully Integrated: partial

## Node.js

### Script-based apps (Next, Vite, Expo, generic npm scripts)

- Detection signals:
  - `package.json` scripts
  - runtime/script heuristics for `next dev`, `vite`, `expo start`, watch/dev conventions
- Inferred commands:
  - `npm run <script>` for discovered scripts
- Runtime behavior:
  - manager selection by lockfile or override (`pnpm`, `yarn`, `bun`, `npm`)
  - dependency sync (`install` or `ci`) based on manager and lockfiles
- Current level:
  - Detected: yes
  - Runnable: yes
  - Auto-Prepared: yes
  - Fully Integrated: partial

## Orchestrators

### Docker Compose

- Detection signals:
  - `docker-compose.yml` or `docker-compose.yaml`
  - compose command fingerprints
- Inferred commands:
  - `docker compose up`
  - `docker compose down`
- Runtime behavior:
  - classified as `orchestrator` command type
- Current level:
  - Detected: yes
  - Runnable: yes
  - Auto-Prepared: limited
  - Fully Integrated: partial

## Cloud Jobs

### Expo EAS / Vercel deploy

- Detection signals:
  - command patterns for `eas build`, `eas submit`, `vercel deploy`
- Inferred behavior:
  - classified as `cloud-job`
  - cloud job metadata scaffold (`provider`, parser regex, status/log templates)
- Runtime behavior:
  - launch supported, provider lifecycle depth still evolving
- Current level:
  - Detected: yes
  - Runnable: yes
  - Auto-Prepared: n/a
  - Fully Integrated: pending

## Core Runtime Detection

### Rust and Go

- Detection signals:
  - runtime probes in project scan and launch runtime detection
- Runtime behavior:
  - shell launch path available
- Current level:
  - Detected: yes
  - Runnable: partial
  - Auto-Prepared: no
  - Fully Integrated: pending

## Environment Engines

### Varlock

- Behavior:
  - schema-aware env tier recognition
  - launch-time `varlock load` validation and injected execution
  - vault reference resolution (`varlock://vault/...`) before process spawn
- Current level:
  - Detected: yes
  - Runnable: yes
  - Auto-Prepared: yes
  - Fully Integrated: partial

### Plain dotenv

- Behavior:
  - `.env` scope discovery and selection
  - scoped launch with selected environment context
- Current level:
  - Detected: yes
  - Runnable: yes
  - Auto-Prepared: limited
  - Fully Integrated: partial

### No-env projects

- Behavior:
  - command execution without env overlay
- Current level:
  - Detected: yes
  - Runnable: yes
  - Auto-Prepared: n/a
  - Fully Integrated: partial
