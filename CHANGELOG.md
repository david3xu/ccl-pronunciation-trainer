# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

## [3.0.2] - 2026-03-02

### Added
- GitHub Actions CI pipeline (lint, test, build)
- Shared vocabulary cache service (5-min TTL)
- Typed analytics accessor (replaces window.analyticsService casts)
- Logger utility (silences debug output in production)
- Test coverage: 123 tests across 9 files (stores, hooks, components, utils)
- Empty-state UI for datasets with zero items
- Accessibility: ARIA labels, semantic HTML, role attributes

### Changed
- Moved Gemini API key from client to server proxy (security)
- Lazy-loaded 6 heavy AI/scoring components
- Restricted CORS from wildcard to app origin
- Replaced 70+ console.* calls with centralized logger
- Replaced 30+ as-any casts with proper type guards
- Removed PII (email, name) from PostHog analytics
- Un-commented 15 core vocabulary books in config
- Fixed ErrorBoundary test logic
- Fixed wrong vocabulary book IDs in AudioControls

### Removed
- Dead Jest config and 5 unused dependencies
- Stale documentation referencing non-existent src/ts/ paths

## [3.0.1] - 2025-11-01

### Added
- AI-powered features: Gemini chat, pronunciation scoring, recommendations
- AWS Polly premium TTS (18 neural voices)
- Supabase integration (auth, cloud sync, analytics)
- DI Shadowing practice mode
- Session tracking and proactive interventions
- React 19 + TypeScript migration (100%)
- Zustand state management (replaces EventBus)

## [3.0.0] - 2025-10-01

### Changed
- Complete React + TypeScript rewrite from vanilla JavaScript
- Migrated from EventBus to Zustand store architecture

## [2.5.4] - 2025-10-01

### Added
- Production-ready vanilla JS release
- Comprehensive documentation

## [1.0.0] - Initial Release

### Added
- Basic pronunciation training with Web Speech API
- PTE FIB Listening vocabulary
