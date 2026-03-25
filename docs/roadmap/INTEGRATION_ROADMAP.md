# Integration Roadmap

This roadmap tracks delivery toward a universal one-click runtime control plane across stacks.

## Stage 1 - Stabilize Current Integrations (now)

Scope:

- Publish canonical integration docs and support matrix.
- Align product narrative with integration-first positioning.
- Ensure support levels map to current code behavior.

Acceptance criteria:

- `docs/product/INTEGRATIONS.md` published and accurate.
- `docs/product/SUPPORT_MATRIX.md` published with no unsupported claims.
- Root docs link to integration docs.

## Stage 2 - Close Core Gaps (next)

Scope:

- Add first-class Rust command discovery (`cargo run`, `cargo test`, common profiles).
- Add first-class Go command discovery (`go run`, `go test`, common module layouts).
- Complete Poetry and Conda environment resolution paths.
- Improve compose lifecycle behavior consistency.

Acceptance criteria:

- Rust and Go rows move from partial runnable to runnable.
- Poetry and Conda move from partial to runnable + auto-prepared where applicable.
- Integration tests cover core discovery + launch paths.

## Stage 3 - Cloud and Orchestration Depth (later)

Scope:

- Complete cloud-job lifecycle contract (submit, parse, poll, status, log surface).
- Add provider adapters with resilient parsing and error mapping.
- Improve orchestrator stop/attach semantics and UX parity.

Acceptance criteria:

- Cloud-job providers expose status updates and traceable job links.
- Orchestrator flows have deterministic run/stop UX with timeline events.
- Provider-specific docs and troubleshooting guides exist.

## Stage 4 - Fully Integrated Standard (release gate)

Scope:

- Establish requirements for marking an integration as fully integrated.
- Add e2e validation suites per integration family.
- Add operational quality bars (error taxonomy, recovery patterns, docs parity).

Definition of fully integrated:

- Discovery coverage for common project layouts.
- Runnable command inference with stable launch behavior.
- Auto-preparation where technically applicable.
- Lifecycle parity (run/stop/logs/timeline/error mapping).
- Documented setup, limits, and troubleshooting.
- Automated validation coverage in CI.

## Prioritized Pending Items

1. Rust and Go command inference.
2. Poetry and Conda resolver completion.
3. Cloud-job lifecycle implementation.
4. Integration e2e tests and release quality gates.
5. UI surfacing for integration readiness states.
