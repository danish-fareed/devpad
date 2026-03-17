# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-03-18

### Added
- Native OS terminal attachment feature. Opens user's OS terminal (Windows Terminal, PowerShell, CMD, macOS Terminal, Linux variants) at the project directory.
- Deep integration with Tauri commands (`open_terminal_at`, `attach_to_process`, `run_in_terminal`, `open_in_editor`, `open_in_explorer`).
- `CommandCard` now features an interactive "Run in Terminal" action and a log viewer.
- Real-time environment variable loading and validation for command execution.

### Changed
- Extensive UI layout overhaul, refining the sidebar appearance and app branding.
- Renamed display names to be uniform across the components (e.g. `AppLayout`, `DashboardPage`).
- Updated app-wide branding, applying custom SVGs and custom fonts correctly locally.
- Version bump to 0.2.0 reflecting significant layout, structure, and backend API enhancements.

### Fixed
- Fixed nested button HTML warnings inside the project lists.
- Fixed layout overflows in specific responsive layouts, guaranteeing scrolling contexts within main dashboard panels.
