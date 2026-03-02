# Diagnostics

## Strengths

- **Modern stack**: React 19, Vite 7, TypeScript strict mode
- **Graceful degradation**: The app works without any external services (Supabase, Polly, Gemini). Features degrade individually rather than crashing.
- **Good state management**: Zustand with persistence middleware. Fine-grained subscriptions prevent unnecessary re-renders.
- **Typed codebase**: Zod schemas and type guards (`src/utils/validation/guards.ts`) validate runtime data.
- **Centralized logging**: `src/utils/logger.ts` silences debug output in production.
- **Typed analytics accessor**: `getAnalytics()` replaces unsafe `(window as any)` casts.

## Resolved Issues

These were identified during the documentation audit and have been fixed:

- **Schema mismatch** — client now maps `word` → `specificItems` and `difficulty` → `priority` from the API response
- **Analytics never initialized** — `analyticsService.initialize()` now called in `main.tsx` when PostHog key is configured
- **Auth session not restored** — `auth.initialize()` now called on mount in `AppContent.tsx`
- **Path aliases broken** — `vite.config.ts` and `vitest.config.ts` aliases now point to correct `src/` paths
- **Broken validation script** — `validate.js` no longer requires non-existent `src/js/shared/Config.js`
- **Unused `openai` dependency** — removed from `package.json`

## Remaining Known Issues

### Untyped Supabase Client

The `Database` type in `supabaseClient.ts` is set to `any`. No generated Supabase types exist, so queries are untyped.

### Two Recommendation Systems (by design)

Two recommendation systems serve different purposes:
- `recommendationService.ts` — lightweight, calls `/api/ai-recommendations` (Gemini). Used by `AIRecommendations` component for quick suggestions.
- `recommendationEngine.ts` — rich, queries Supabase directly for weak areas, learner profiles, and performance history. Used by `WeakAreasDashboard` for deep analysis.

These are complementary, not duplicative.

### Large TTS Engine

`TTSEngine.ts` is approximately 1,100 lines and mixes multiple concerns (speech synthesis, queue management, word highlighting, event handling).

## Improvement Opportunities

- Generate Supabase types: `supabase gen types typescript --project-id <id> > src/types/database.ts`
- Split `TTSEngine` into smaller, focused modules
- Add E2E tests with Playwright
- Remove `@aws-sdk/client-s3` if only Polly is used (S3 may be unused)
