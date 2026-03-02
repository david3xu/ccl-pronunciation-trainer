# AGENTS.md

## Cursor Cloud specific instructions

### Overview

PTE Pronunciation Trainer — React 19 + TypeScript + Vite SPA. No external services required for local development. See `CLAUDE.md` for full architecture and `docs/DIAGNOSTICS.md` for known issues.

### Commands

```bash
npm run start           # data pipeline + dev server (port 3001)
npm run dev             # dev server only (if data already processed)
npm run data:pte        # markdown → JSON (must run before first dev)
npm test                # Vitest (123 tests, 9 files)
npm run lint            # tsc --noEmit
npm run build           # tsc + vite build
```

### Environment

All external services optional. App works fully without `.env`. Copy `.env.example` → `.env` for optional Supabase/Gemini/Polly/PostHog integration. AWS and Gemini keys must NOT use `VITE_` prefix (server-side only).

### Patterns

- Use `logger` from `src/utils/logger.ts` — not raw `console.*`
- Use `getAnalytics()` from `src/services/analytics/getAnalytics.ts` — not `(window as any).analyticsService`
- Use type guards from `src/utils/validation/guards.ts` — not `as any` on dataset items
- Components in `src/components/`, hooks in `src/hooks/`, state in `src/stores/`, services in `src/services/`

### Gotchas

- `package.json` declares yarn but repo uses **npm** (`package-lock.json`)
- `src/ts/` does **not** exist — all source under `src/` directly
- Vite path aliases (`@stores`, `@ts`) point to non-existent `src/ts/` — imports use relative paths
- Pre-commit hook (`.husky/pre-commit`) runs doc validation, structure validation, lint, and tests
- Data pipeline (`npm run data:pte`) must run before first `npm run dev`
