# Module Interactions

## Architecture Layers

```
┌─────────────────────────────────────┐
│           UI Layer                  │
│     src/components/                 │
├─────────────────────────────────────┤
│         State Layer                 │
│     src/stores/                     │
├─────────────────────────────────────┤
│        Service Layer                │
│     src/services/                   │
├─────────────────────────────────────┤
│          API Layer                  │
│     api/ (serverless)               │
├─────────────────────────────────────┤
│         Data Layer                  │
│   scripts/ → data/processed/        │
└─────────────────────────────────────┘
```

## UI Layer (`src/components/`)

`AppContent` is the root coordinator that determines which interface to render based on the current practice mode.

Feature-grouped directories:

| Directory | Purpose |
|-----------|---------|
| `ai/` | AI tutor chat, scoring, recommendations, interventions |
| `audio/` | Playback controls, voice selectors |
| `practice/` | WordCard, RS/ASQ/WFD interfaces, progress tracking |
| `settings/` | Settings panel |
| `shared/` | Onboarding modal, skeleton loaders |
| `migration/` | Local-to-cloud data migration |
| `profile/` | Learner profile and onboarding wizard |

AI components (`ai/`) are **lazy-loaded** to reduce initial bundle size.

## State Layer (`src/stores/`)

Single Zustand store with 7 slices:

| Slice | Responsibility |
|-------|---------------|
| `audio` | Playback state, speed, repeat mode, navigation |
| `tts` | Speech synthesis state, current word, selected voice |
| `settings` | User preferences, vocabulary book, theme |
| `vocabulary` | Current dataset, items, filtered data |
| `progress` | Learning progress, accuracy, completion |
| `ui` | Modal visibility, sidebar state |
| `auth` | User session, Supabase authentication |

**Reading state**: Components use selector hooks (`useSettings()`, `useVocabulary()`, etc.) for fine-grained subscriptions.

**Writing state**: Services access the store imperatively via `useAppStore.getState()`.

## Service Layer (`src/services/`)

Business logic separated from UI concerns:

| Service | Responsibility |
|---------|---------------|
| `ai/` | Recommendation engine, intervention engine, weak area detection |
| `audio/TTSEngine.ts` | Web Speech API wrapper |
| `audio/pollyService.ts` | AWS Polly neural voice integration |
| `supabase/authService.ts` | Sign up, sign in, sign out |
| `supabase/syncService.ts` | Progress sync across devices |
| `supabase/autoSyncManager.ts` | Background auto-sync |
| `analytics/analyticsService.ts` | PostHog event tracking |
| `session/sessionManager.ts` | Practice session lifecycle |
| `profile/learnerProfileService.ts` | User profile management |

## API Layer (`api/`)

Vercel serverless functions that hold API keys server-side and proxy requests:

- Gemini AI chat and recommendations
- AWS Polly text-to-speech
- Supabase admin operations

Client-side code never accesses third-party APIs directly for key-protected services.

## Data Layer

### Build-time Pipeline

`scripts/pte-data-pipeline.js` processes markdown source files into JSON:

```
data/source/pte/*.md  →  data/processed/*.json
```

Extractors (in `archive/vanilla-js-legacy/data/extractors/`):
- `PTETermsExtractor.js` — dual IPA (British + American)
- `SingleIPATermsExtractor.js` — single IPA
- `PTESentenceExtractor.js` — RS/WFD sentences
- `PTEQuestionExtractor.js` — ASQ questions
- `DIAnswerExtractor.js` — DI shadowing answers

### Runtime

`vocabularyLoader` fetches processed JSON files on demand and caches them in memory. Datasets are loaded lazily when the user switches vocabulary books or practice modes.
