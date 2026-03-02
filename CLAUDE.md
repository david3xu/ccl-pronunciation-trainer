# CLAUDE.md

> Rebuilt from scratch on 2026-03-02 by reading every source file. Every path here exists.

## Quick Reference

| | |
|---|---|
| **Name** | PTE Pronunciation Trainer (`pte-vocabulary-trainer`) |
| **Version** | 3.0.2 |
| **Stack** | React 19 · TypeScript 5.9 · Zustand 5 · Radix UI · Tailwind 4 · Vite 7 |
| **Package manager** | npm (`package-lock.json`). Ignore `"packageManager": "yarn"` in `package.json`. |
| **Node** | >= 16 |
| **Dev server** | `npm run start` (data pipeline + Vite on port 3001) |
| **Test** | `npm test` (Vitest, 123 tests) |
| **Lint** | `npm run lint` (`tsc --noEmit`) |
| **Build** | `npm run build` (`tsc` + `vite build`) |

## Source Layout

```
src/
├── main.tsx                    Entry point (mounts App)
├── App.tsx                     Suspense + ToastProvider + AppContent
├── components/
│   ├── AppContent.tsx          Main coordinator (data loading, routing, modals)
│   ├── ai/                     6 components (lazy-loaded): AITutorChat, AISidebar, etc.
│   ├── audio/                  AudioControls, VoiceSelector, PremiumVoiceSelector
│   ├── practice/               WordCard, RS/ASQ/WFD/VocabTyping interfaces, ProgressDashboard
│   ├── settings/               SettingsPanel
│   ├── shared/                 ErrorBoundary, Skeleton, ToastProvider, ComponentSkeleton
│   ├── migration/              DataMigrationModal
│   └── profile/                LearnerProfileModal
├── config/AppConfig.ts         Singleton: data paths, AI settings, events, build config
├── stores/
│   ├── index.ts                Zustand store (7 slices), persisted to localStorage
│   └── types.ts                Store type definitions
├── services/
│   ├── ai/                     recommendationService, interventionEngine, weakAreaDetector, taskPersonas, ratingService
│   ├── analytics/              analyticsService (PostHog), getAnalytics (typed accessor)
│   ├── audio/                  TTSEngine (Web Speech + Polly), pollyService
│   ├── data/                   vocabularyLoader (shared cache, 5-min TTL)
│   ├── device/                 WakeLockService
│   ├── session/                sessionManager (Supabase + IndexedDB offline)
│   ├── supabase/               supabaseClient, authService, syncService, autoSyncManager
│   ├── tts/                    persistentCache
│   ├── migration/              migrationService
│   └── profile/                learnerProfileService
├── data/                       DataSchema, DatasetManager, extractors/ (4 TypeScript extractors)
├── hooks/                      useBreakpoint, useMigration, useOnboarding, useSwipeGesture
├── types/                      dataset.types, config.types, database
├── utils/                      logger, textUtils, templateParser, EventBus, Storage, CacheMigration
│   └── validation/             guards.ts (type guards), schemas.ts (Zod)
├── css/                        9 files: tailwind, variables, animations, components, style, responsive, auth, analytics, shadowing
└── test/setup.ts               Vitest setup (mocks: speechSynthesis, matchMedia, etc.)

api/                            Vercel serverless functions (repo root, NOT under src/)
├── ai/chat.ts                  Gemini streaming SSE
├── ai-recommendations.ts       Personalized suggestions
├── premium-tts.ts              AWS Polly TTS
├── audio/generate.ts           Alternative TTS with S3 caching
├── pronunciation-score.ts      Gemini scoring
├── voices.ts                   Voice list
└── config.ts                   Shared API config

data/
├── source/pte/                 Markdown source files
└── processed/                  Generated JSON (37 datasets)

scripts/
├── pte-data-pipeline.js        Markdown → JSON processor
├── ai-chat-middleware.ts       Vite dev middleware for /api/ai/chat
└── validate*.js                Docs, structure, dataset validators
```

## Zustand Store (7 Slices)

| Slice | Key state | Persisted? |
|-------|-----------|------------|
| `audio` | isAutoPlaying, currentIndex, volume, repeatMode | Prefs only |
| `tts` | isSpeaking, selectedVoice | No |
| `settings` | vocabularyBook, practiceType, difficultyFilter, ttsRate, theme | Yes |
| `vocabulary` | currentDataset, filteredDataset, currentItem, isLoading | No |
| `progress` | completedItems (Set), accuracy, currentStreak | Partial |
| `ui` | notification, isInitializing | No |
| `auth` | user, session, isAuthenticated | No |

## Patterns to Follow

**Type safety** — use guards from `src/utils/validation/guards.ts`:
```typescript
import { isVocabularyTerm, isPracticeItem } from '../utils/validation/guards';
if (isVocabularyTerm(item)) item.word; // narrowed
```

**Logging** — use `src/utils/logger.ts`:
```typescript
import logger from '../utils/logger';
logger.log('dev-only');   // silenced in production
logger.error('always');   // always prints
```

**Analytics** — use typed accessor:
```typescript
import { getAnalytics } from '../services/analytics/getAnalytics';
getAnalytics()?.track('event', { ... });
```

## Known Issues (see docs/DIAGNOSTICS.md for full list)

- Schema mismatch between `/api/ai-recommendations` response and `recommendationService.ts` client expectations
- `analyticsService.initialize()` never called — PostHog disabled at runtime
- `auth.initialize()` never called on mount — sessions not restored on refresh
- Vite path aliases (`@stores`, `@ts`) point to non-existent `src/ts/` — all imports use relative paths
- Two recommendation engines coexist (`recommendationService` API-based, `recommendationEngine` Supabase-based)
- `openai` package in dependencies but appears unused

## Documentation Index

| File | Content |
|------|---------|
| `README.md` | Project overview, quick start, features |
| `CHANGELOG.md` | Version history |
| `docs/ARCHITECTURE.md` | System design, layers, data flow |
| `docs/SETUP.md` | Dev environment setup |
| `docs/TESTING.md` | Test framework, coverage, commands |
| `docs/CONTRIBUTING.md` | Contribution guidelines |
| `docs/DEPLOYMENT.md` | Build and deploy |
| `docs/SECURITY.md` | Security policy |
| `docs/MODULES.md` | Module interactions |
| `docs/DIAGNOSTICS.md` | Known issues and improvement areas |
