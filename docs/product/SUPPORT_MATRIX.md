# Support Matrix

Support levels:

- `Detected`: the stack/tool is recognized during scan.
- `Runnable`: Devpad can launch at least one command for it.
- `Auto-Prepared`: Devpad can automatically prepare/sync runtime prerequisites.
- `Fully Integrated`: complete lifecycle behavior, UX parity, docs, and validation coverage.

| Stack | Framework/Tool | Detected | Runnable | Auto-Prepared | Fully Integrated | Notes |
|---|---|---|---|---|---|---|
| Python | FastAPI + Uvicorn | yes | yes | yes | no | `uvicorn <target> --reload` inferred from dependency and entrypoint heuristics |
| Python | Flask | yes | yes | yes | no | `flask run --reload` inferred when Flask dependency signal exists |
| Python | Django | yes | yes | yes | no | `manage.py` commands inferred (`runserver`, `migrate`) |
| Python | Pytest workflows | yes | yes | yes | no | Uses venv binary when present, falls back to `python -m pytest` |
| Python | Poetry-managed envs | partial | partial | partial | no | manager hooks exist; dedicated poetry env resolution remains incomplete |
| Python | Conda-managed envs | partial | partial | no | no | local conda marker path exists; full conda integration is pending |
| Node.js | npm scripts (generic) | yes | yes | yes | no | script discovery from `package.json`; command typing by heuristics |
| Node.js | Vite | yes | yes | yes | no | dev/watch classification available |
| Node.js | Next.js | yes | yes | yes | no | `next dev` recognized as local process workload |
| Node.js | Expo (local dev) | yes | yes | yes | no | `expo start` recognized as local process workload |
| Orchestrator | Docker Compose | yes | yes | limited | no | `up`/`down` inferred and typed as `orchestrator` |
| Cloud Job | Expo EAS cloud build/submit | yes | yes | n/a | no | cloud-job scaffolding present; full provider lifecycle still maturing |
| Cloud Job | Vercel deploy | yes | yes | n/a | no | cloud-job scaffolding present; end-to-end integration pending |
| Runtime | Rust projects | yes | partial | no | no | runtime detection exists; first-class command inference pending |
| Runtime | Go projects | yes | partial | no | no | runtime detection exists; first-class command inference pending |
| Runtime | Shell fallback | yes | yes | n/a | no | used when no specialized runtime driver applies |
| Env Engine | Varlock | yes | yes | yes | no | load validation + vault URI resolution integrated in process launch path |
| Env Engine | Plain dotenv | yes | yes | limited | no | env scope discovery and selection available |
| Env Engine | No-env mode | yes | yes | n/a | no | commands run without env overlay |

## Pending to reach Fully Integrated

- Rust/Go first-class command discovery and lifecycle semantics.
- Poetry and Conda resolver completion and validation coverage.
- Cloud-job provider polling/status/log retrieval parity in UI.
- End-to-end tests per integration family.
- Integration-specific troubleshooting playbooks.
