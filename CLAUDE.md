# CLAUDE.md

> Verified against the codebase on 2026-03-02. Every path referenced here exists.

## Project Overview

**PTE Pronunciation Trainer** — A React SPA for PTE exam pronunciation practice.

| Spec | Value |
|------|-------|
| Version | 3.0.2 |
| Stack | React 19 · TypeScript 5.9 · Zustand 5 · Radix UI 3.2 · Tailwind CSS 4 · Vite 7 |
| Package manager | npm (lockfile: `package-lock.json`) |
| Node requirement | >= 16.0.0 |

## Directory Structure

```
src/
├── main.tsx                 ← Vite entry point
├── App.tsx                  ← Root component (Suspense + ToastProvider + AppContent)
├── App.test.tsx
│
├── components/
│   ├── AppContent.tsx       ← Main app coordinator (data loading, routing, modals)
│   ├── ai/                  ← AI features (6 components, all lazy-loaded)
│   ├── audio/               ← AudioControls, VoiceSelector, PremiumVoiceSelector
│   ├── practice/            ← WordCard, RS/ASQ/WFD/VocabTyping interfaces, ProgressDashboard
│   ├── settings/            ← SettingsPanel
│   ├── shared/              ← ErrorBoundary, Skeleton, ToastProvider, ComponentSkeleton
│   ├── migration/           ← DataMigrationModal
│   └── profile/             ← LearnerProfileModal
│
├── config/
│   └── AppConfig.ts         ← Singleton config: data paths, AI settings, TTS, events
│
├── stores/
│   ├── index.ts             ← Zustand store (7 slices: audio, tts, settings, vocabulary, progress, ui, auth)
│   └── types.ts             ← Store type definitions
│
├── services/
│   ├── ai/                  ← recommendationService, interventionEngine, weakAreaDetector, taskPersonas
│   ├── analytics/           ← analyticsService (PostHog), getAnalytics (typed accessor)
│   ├── audio/               ← TTSEngine (Web Speech API), pollyService (AWS Polly)
│   ├── data/                ← vocabularyLoader (shared cache for dataset fetching)
│   ├── device/              ← WakeLockService
│   ├── migration/           ← migrationService
│   ├── profile/             ← learnerProfileService
│   ├── session/             ← sessionManager
│   ├── supabase/            ← supabaseClient, authService, syncService, autoSyncManager
│   └── tts/                 ← persistentCache
│
├── data/
│   ├── DataSchema.ts
│   ├── DatasetManager.ts
│   └── extractors/          ← PTETermsExtractor, SingleIPATermsExtractor, PTESentenceExtractor, PTEQuestionExtractor
│
├── hooks/                   ← useBreakpoint, useMigration, useOnboarding, useSwipeGesture
├── types/                   ← dataset.types.ts, config.types.ts, database.ts
├── utils/                   ← logger, textUtils, templateParser, EventBus, Storage, CacheMigration
│   └── validation/          ← guards.ts (type guards), schemas.ts (Zod schemas)
├── css/                     ← 9 CSS files (tailwind.css, variables.css, animations.css, components.css, style.css, responsive.css, auth.css, analytics.css, shadowing.css)
└── test/
    └── setup.ts             ← Vitest setup (mocks: speechSynthesis, matchMedia, IntersectionObserver, ResizeObserver)

data/
├── source/pte/              ← Source markdown files (vocabs/, rs/, asq/, wfd/, di/, rl/, sgd/, essay-examples/)
└── processed/               ← Generated JSON (37 datasets, created by npm run data:pte)

scripts/
├── pte-data-pipeline.js     ← Markdown → JSON processor
├── ai-chat-middleware.ts     ← Vite dev server middleware for /api/ai/chat
├── generate-natural-di-shadowing.js
├── validate.js, validate-docs.js, validate-structure.js
└── (others: bump-version, dev-proxy, test-gemini-api, etc.)

api/                         ← Vercel serverless functions (NOT under src/)
├── ai/chat.ts               ← Gemini AI tutor (streaming SSE)
├── ai-recommendations.ts    ← Personalized recommendations
├── premium-tts.ts           ← AWS Polly TTS
├── audio/generate.ts        ← Alternative TTS endpoint
├── pronunciation-score.ts   ← AI pronunciation scoring
├── voices.ts                ← Available voices list
└── config.ts                ← Shared API config
```

## Essential Commands

```bash
npm run start           # data:pte + dev (full startup)
npm run dev             # Vite dev server on port 3001
npm run data:pte        # Markdown → JSON pipeline (required before first run)
npm test                # Vitest (123 tests, 9 files)
npm run lint            # tsc --noEmit
npm run build           # tsc + vite build → dist/
npm run deploy:pte      # data:pte + build + validate:all
```

## State Management

Single Zustand store with 7 slices. Middleware: `subscribeWithSelector` → `devtools` → `persist`.

| Slice | Key fields | Persisted? |
|-------|-----------|------------|
| `audio` | isAutoPlaying, currentIndex, volume, repeatMode, playbackSpeed | Preferences only |
| `tts` | isSpeaking, selectedVoice | No |
| `settings` | vocabularyBook, practiceType, difficultyFilter, ttsRate, theme | Yes |
| `vocabulary` | currentDataset, filteredDataset, currentItem, mode, isLoading | No |
| `progress` | completedItems (Set), accuracy, currentStreak, sessionStartTime | Partial |
| `ui` | notification, isInitializing | No |
| `auth` | user, session, isAuthenticated | No |

Access in components:
```typescript
import { useAppStore, useSettings, useVocabulary } from '../stores';
const settings = useSettings();
const { currentItem } = useVocabulary();
```

## Data Architecture

**36 vocabulary books + 3 practice modes + 1 shadowing dataset** in `data.paths.byMode` (AppConfig.ts).

### Dataset types
- **Vocabulary:** `{ word, ipa: { british, american }, phonetic, difficulty, category }`
- **Practice (RS/ASQ/WFD):** `{ sentence|question, metadata: { difficulty, category } }`
- **Shadowing:** `{ fullText, phrases[], template }`

### Data flow
```
data/source/pte/*.md  →  npm run data:pte  →  data/processed/*.json  →  fetch() at runtime
```

## Type Guards

Use guards from `src/utils/validation/guards.ts` instead of `as any`:
```typescript
import { isVocabularyTerm, isPracticeItem } from '../utils/validation/guards';

if (isVocabularyTerm(item)) {
  console.log(item.word);  // TypeScript knows this is VocabularyTerm
}
```

## Logging

Use `src/utils/logger.ts` instead of raw `console.*`:
```typescript
import logger from '../utils/logger';
logger.log('dev only');   // silenced in production
logger.error('always');   // always prints
```

## Analytics

Use typed accessor instead of `(window as any).analyticsService`:
```typescript
import { getAnalytics } from '../services/analytics/getAnalytics';
getAnalytics()?.track('event_name', { ... });
```

## Testing

- **Framework:** Vitest 4.x + happy-dom
- **Setup:** `src/test/setup.ts`
- **Run:** `npm test`
- **Coverage:** 60% thresholds in `vitest.config.ts`
- **Pre-commit:** `.husky/pre-commit` runs docs, structure, lint, and tests

## Common Pitfalls

- `package.json` declares `"packageManager": "yarn@1.22.22"` but the repo uses **npm** (`package-lock.json`)
- `src/ts/` does **not** exist — all source is under `src/` directly
- Vite path aliases (`@stores`, `@ts`, etc.) point to non-existent `src/ts/` paths — imports use relative paths instead
- The data pipeline (`npm run data:pte`) must run before the first `npm run dev`
- AI features (Gemini, Polly) are optional — the app works fully without any `.env` keys
- `analyticsService.initialize()` is never called at startup — PostHog is effectively disabled unless explicitly initialized

## Detailed Lifecycle

See `docs/APP-LIFECYCLE.md` for the complete verified startup sequence, render tree, data loading flow, and interaction patterns.
