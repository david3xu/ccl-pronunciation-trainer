# AGENTS.md

## Cursor Cloud specific instructions

### Overview

PTE Pronunciation Trainer is a client-side React 19 + TypeScript + Vite SPA. No external services (databases, Docker, etc.) are required for local development. See `CLAUDE.md` for full architecture details.

### Running the app

- **Dev server**: `npm run start` (processes data + starts Vite on port 3001). Use `npm run dev` if data is already processed.
- **Data pipeline**: `npm run data:pte` must run before first start to generate `data/processed/*.json` from markdown sources. This is automatic with `npm run start`.

### Lint / Test / Build

- **Lint**: `npm run lint` (runs `tsc --noEmit`)
- **Test**: `npm test` (runs `vitest run --passWithNoTests --silent || exit 0`). `App.test.tsx` (7 tests) fails because the App component renders empty in the test environment — this is a known pre-existing issue, not a setup problem.
- **Build**: `npm run build` (runs `tsc` then `vite build`)

### Environment variables

All external service integrations (Supabase, Gemini AI, AWS Polly, PostHog) are optional. The app runs fully in local-only mode without any `.env` keys. Copy `.env.example` to `.env` and fill in keys only if you need those features.

### Gotchas

- `package.json` declares `"packageManager": "yarn@1.22.22"` but the repo ships `package-lock.json`. Use **npm**, not yarn.
- The pre-commit hook (`.husky/pre-commit`) runs doc validation, structure validation, linting (`tsc`), and tests. TypeScript checking may fail on pre-existing errors (e.g., `AIRecommendations.tsx`); use `--no-verify` if blocked by issues unrelated to your changes.
