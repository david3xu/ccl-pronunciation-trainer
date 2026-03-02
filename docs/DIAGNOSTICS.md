# Diagnostics

## Strengths

- **Modern stack**: React 19, Vite 7, TypeScript strict mode
- **Graceful degradation**: The app works without any external services (Supabase, Polly, Gemini). Features degrade individually rather than crashing.
- **Good state management**: Zustand with persistence middleware. Fine-grained subscriptions prevent unnecessary re-renders.
- **Typed codebase**: Zod schemas and type guards (`src/utils/validation/guards.ts`) validate runtime data.

## Known Issues

### Schema Mismatch — AI Recommendations

`/api/ai-recommendations` returns objects shaped `{ word, difficulty }`, but `recommendationService.ts` expects `{ type, priority, practiceMode }`. Recommendations may display incorrectly or fail silently.

### Analytics Never Initialized

`analyticsService.initialize()` is never called at app startup. PostHog is effectively disabled — no events are tracked in production.

### Auth Session Not Restored

`auth.initialize()` is never called on mount. Supabase sessions are not restored on page refresh, forcing users to re-authenticate.

### Path Aliases Point to Wrong Directory

Vite/Vitest path aliases (`@stores`, `@ts`) are configured to point to `src/ts/`, but the actual modules live directly under `src/`. All imports currently use relative paths as a workaround.

### Broken Validation Script

`validate.js` references `src/js/shared/Config.js`, which does not exist. Running `npm run validate` may fail.

### Untyped Supabase Client

The `Database` type in `supabaseClient.ts` is set to `any`. No generated Supabase types exist, so queries are untyped.

### Unused `openai` Dependency

The `openai` package is listed in `dependencies` but does not appear to be imported anywhere. It adds unnecessary bundle weight.

### Duplicate Recommendation Engines

Two recommendation systems exist:
- `recommendationService.ts` — calls the `/api/ai-recommendations` serverless endpoint
- `recommendationEngine.ts` — queries Supabase directly

It is unclear which is canonical. They may produce conflicting results.

### Large TTS Engine

`TTSEngine.ts` is approximately 1,100 lines and mixes multiple concerns (speech synthesis, queue management, word highlighting, event handling).

## Improvement Opportunities

- Generate Supabase types: `supabase gen types typescript --project-id <id> > src/types/database.ts`
- Consolidate recommendation engines into a single service
- Split `TTSEngine` into smaller, focused modules
- Add E2E tests with Playwright
- Call `analyticsService.initialize()` and `auth.initialize()` on app mount
- Remove unused `openai` dependency
- Fix path aliases in `vite.config.ts` and `vitest.config.ts` to match actual source structure
