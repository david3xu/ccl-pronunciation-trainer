# App Lifecycle

> Verified against the codebase on 2026-03-02. Every path, import, and sequence
> described here was traced by reading the actual source files.

## 1. Entry Point

```
index.html
  └─ <script type="module" src="/src/main.tsx">
```

`index.html` contains a single `<div id="root">` and loads `src/main.tsx` as an
ES module.

## 2. Module Load Order

When Vite resolves `main.tsx`, **all static imports are evaluated before any
runtime code runs**. The order matters because several modules create singletons
as side effects.

```
main.tsx
├─ App.tsx
│  ├─ AppContent.tsx
│  │  ├─ config/AppConfig.ts      → appConfig singleton, window.appConfig
│  │  ├─ stores/index.ts          → Zustand store (rehydrates from localStorage)
│  │  │  ├─ supabase/authService  → supabaseClient (createClient or mock)
│  │  │  └─ supabase/syncService  → (supabaseClient already loaded)
│  │  ├─ services/audio/TTSEngine → ttsEngine singleton, window.ttsEngine
│  │  │  └─ constructor: reads speechSynthesis, subscribes to store
│  │  ├─ services/ai/interventionEngine
│  │  ├─ services/data/vocabularyLoader
│  │  ├─ services/device/WakeLockService
│  │  └─ services/session/sessionManager
│  └─ shared/ToastProvider
└─ registerSW (PWA service worker, after render)
```

### Singletons created at import time

| Singleton | File | Side effect |
|-----------|------|-------------|
| `appConfig` | `src/config/AppConfig.ts` | `window.appConfig = appConfig` |
| `supabase` | `src/services/supabase/supabaseClient.ts` | `createClient()` or mock if env vars missing |
| `useAppStore` | `src/stores/index.ts` | `window.appStore = useAppStore`; rehydrates from `localStorage['pte-app-storage']` |
| `ttsEngine` | `src/services/audio/TTSEngine.ts` | `window.ttsEngine = ttsEngine`; calls `speechSynthesis.getVoices()` |

### Not initialized at startup

- `analyticsService.initialize()` — never called; PostHog stays disabled
  unless the host app explicitly initializes it
- `auth.initialize()` — the Zustand auth slice method is never called on mount,
  so persisted Supabase sessions are not restored into the store automatically
- `autoSyncManager` — only starts after a successful `auth.initialize()`

## 3. React Render Tree

```
<React.StrictMode>
  <Suspense fallback={null}>        ← App.tsx (catches lazy-loaded children)
    <ToastProvider>
      <Theme>                        ← Radix UI theme (from AppContent)
        <header>
          <nav> Progress | AI Tutor | Insights | Score | Settings </nav>
        </header>

        <!-- Modals (rendered but hidden until toggled) -->
        <DataMigrationModal />
        <LearnerProfileModal />
        <SettingsPanel />
        <Suspense> <AITutorChat /> </Suspense>        ← lazy
        <Suspense> <WeakAreasDashboard /> </Suspense>  ← lazy
        <Suspense> <PronunciationScoring /> </Suspense>← lazy
        <Suspense> <InterventionModal /> </Suspense>   ← lazy
        <Suspense> <AISidebar /> </Suspense>           ← lazy
        <Suspense> <ProgressDashboard /> </Suspense>   ← lazy

        <!-- Main content -->
        <main>
          {isLoading  → <Spinner />}
          {currentItem → <WordCard /> or lazy <RSInterface/ASQInterface/WFDInterface/VocabTypingInterface>}
          {empty       → "No vocabulary items found"}
          <AudioControls />  (vocabulary mode only)
        </main>

        <footer />
      </Theme>
    </ToastProvider>
  </Suspense>
</React.StrictMode>
```

## 4. Data Loading Flow

```
AppContent mounts
  │
  ├─ useEffect([], once)
  │    │
  │    ├─ Read settings.vocabularyBook from Zustand (persisted in localStorage)
  │    ├─ vocabulary.setLoading(true)
  │    │
  │    ├─ loadVocabulary(bookId)          ← src/services/data/vocabularyLoader.ts
  │    │    ├─ Check in-memory cache (5-min TTL)
  │    │    ├─ If miss → fetch(dataPath)
  │    │    ├─ Transform: shadowing → vocabulary shape, segments → vocabulary shape
  │    │    └─ Cache result, return items[]
  │    │
  │    ├─ vocabulary.setDataset(items, bookId)
  │    │    ├─ Sets currentDataset, filteredDataset
  │    │    ├─ Sets currentItem = items[0]
  │    │    └─ Resets audio.currentIndex = 0
  │    │
  │    ├─ Restore persisted progress.currentIndex (if within bounds)
  │    ├─ sessionManager.startSession(...)
  │    └─ wakeLockService.request()
  │
  └─ Cleanup on unmount: abort fetch, complete session, release wake lock
```

### Data path resolution

`AppConfig.ts` → `data.paths.byMode` maps each book ID to a JSON file path:

```
'pte-fib-listening'  → 'data/processed/pte-fib-listening.json'
'pte-beginner'       → 'data/processed/pte-beginner-vocabulary.json'
'di-shadowing'       → 'data/processed/di-shadowing-natural.json'
...
```

These JSON files are generated at build time by `npm run data:pte`
(`scripts/pte-data-pipeline.js`), which reads markdown from
`data/source/pte/` and outputs to `data/processed/`.

## 5. State Management

The app uses a single Zustand store with 7 slices:

| Slice | Purpose | Persisted? |
|-------|---------|------------|
| `audio` | Playback state (isPlaying, index, speed, volume, repeat) | Preferences only |
| `tts` | Speech synthesis state (isSpeaking, voice) | No |
| `settings` | User preferences (book, mode, difficulty, theme) | Yes |
| `vocabulary` | Current dataset, current item, pagination | No |
| `progress` | Completed items, accuracy, streak, session timing | Partial |
| `ui` | Notifications, view state, initialization | No |
| `auth` | Supabase user/session | No |

**Middleware stack:** `subscribeWithSelector` → `devtools` → `persist`

**Persistence:** `localStorage['pte-app-storage']` stores settings, audio
preferences, and progress. Sets are serialized as arrays and restored via
`onRehydrateStorage`.

## 6. User Interaction Flows

### Vocabulary browsing (default mode)
```
User clicks Play → audio.startAutoPlay()
  → useEffect in AudioControls detects isAutoPlaying
  → ttsEngine.speak(cleanText)
  → After speech ends, navigate to next item
  → Loop until end of dataset or user pauses
```

### Switching vocabulary book
```
User opens Settings → selects new book
  → SettingsPanel.handleVocabularyBookChange(bookId)
  → loadVocabulary(bookId, { forceRefresh: true })
  → vocabulary.setDataset(items, bookId)
  → audio.startAutoPlay() if autoPlay enabled
```

### Practice modes (RS/ASQ/WFD)
```
User selects "Task Practice" in Settings
  → practiceType = 'practice', practiceMode = 'practice-repeat-sentence'
  → SettingsPanel fetches practice dataset
  → AppContent renders lazy <RSInterface /> | <ASQInterface /> | <WFDInterface />
```

## 7. Build Pipeline

```
npm run data:pte          ← Markdown → JSON (data pipeline)
npm run dev               ← Vite dev server on port 3001
npm run build             ← tsc + vite build → dist/
npm run start             ← data:pte + dev (convenience)
npm run deploy:pte        ← data:pte + build + validate:all
```

### Data pipeline stages
1. **Stage 2:** Process 33 vocabulary books + 2 segment files → JSON
2. **Stage 2.5:** Generate DI shadowing data from example answers → JSON
3. **Report:** Save processing report to `data/reports/`

## 8. API Routes (Vercel Serverless)

Located in `api/` at the repo root (not under `src/`):

| Route | File | Purpose |
|-------|------|---------|
| `POST /api/ai/chat` | `api/ai/chat.ts` | Gemini-powered AI tutor (streaming SSE) |
| `POST /api/ai-recommendations` | `api/ai-recommendations.ts` | Personalized learning suggestions |
| `POST /api/premium-tts` | `api/premium-tts.ts` | AWS Polly text-to-speech |
| `POST /api/audio/generate` | `api/audio/generate.ts` | Alternative TTS endpoint |
| `POST /api/pronunciation-score` | `api/pronunciation-score.ts` | AI pronunciation scoring |
| `GET /api/voices` | `api/voices.ts` | Available Polly voices |

The Vite dev server includes `scripts/ai-chat-middleware.ts` to handle
`/api/ai/chat` locally (so Gemini chat works in development without Vercel).

## 9. Test Infrastructure

- **Framework:** Vitest 4.x with happy-dom environment
- **Setup:** `src/test/setup.ts` (mocks: speechSynthesis, matchMedia, IntersectionObserver, ResizeObserver)
- **Config:** `vitest.config.ts` (coverage thresholds: 60% lines/functions/branches/statements)
- **Run:** `npm test` → `vitest run --passWithNoTests --silent || exit 0`
- **Tests:** 123 tests across 9 files (as of 2026-03-02)
- **Pre-commit hook:** `.husky/pre-commit` runs docs validation, structure validation, linting, and tests
