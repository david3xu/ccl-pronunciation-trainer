# AGENTS.md

## Cursor Cloud specific instructions

### Overview

PTE Pronunciation Trainer is a client-side React 19 + TypeScript + Vite SPA. No external services (databases, Docker, etc.) are required for local development. See `CLAUDE.md` for verified architecture details and `docs/APP-LIFECYCLE.md` for the complete startup sequence.

### Running the app

- **Dev server**: `npm run start` (processes data + starts Vite on port 3001). Use `npm run dev` if data is already processed.
- **Data pipeline**: `npm run data:pte` must run before first start to generate `data/processed/*.json` from markdown sources. This is automatic with `npm run start`.

### Lint / Test / Build

- **Lint**: `npm run lint` (runs `tsc --noEmit`)
- **Test**: `npm test` (Vitest — 123 tests across 9 files, all passing)
- **Build**: `npm run build` (runs `tsc` then `vite build`)

### Environment variables

All external service integrations (Supabase, Gemini AI, AWS Polly, PostHog) are optional. The app runs fully in local-only mode without any `.env` keys. Copy `.env.example` to `.env` and fill in keys only if you need those features. AWS and Gemini keys must **not** use the `VITE_` prefix (server-side only).

### Gotchas

- `package.json` declares `"packageManager": "yarn@1.22.22"` but the repo ships `package-lock.json`. Use **npm**, not yarn.
- `src/ts/` does **not** exist despite old docs referencing it. All source is under `src/` directly.
- Vite path aliases (`@stores`, `@ts`, etc.) point to non-existent `src/ts/` — imports use relative paths.
- The pre-commit hook (`.husky/pre-commit`) runs doc validation, structure validation, linting, and tests.
- Use `src/utils/logger.ts` instead of raw `console.*` calls.
- Use `getAnalytics()` from `src/services/analytics/getAnalytics.ts` instead of `(window as any).analyticsService`.
- Use type guards from `src/utils/validation/guards.ts` instead of `as any` casts on dataset items.
