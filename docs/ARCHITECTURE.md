# Architecture

PTE Pronunciation Trainer — system architecture reference (v3.0.2).

---

## High-Level Layers

```
Browser
  │
  ├─ index.html
  │    └─ <div id="root">
  │         └─ src/main.tsx  (ReactDOM.createRoot, StrictMode, PWA registration)
  │              └─ src/App.tsx  (Suspense + ToastProvider wrapper)
  │                   └─ src/components/AppContent.tsx  (main UI coordinator)
  │
  ├─ Zustand Store  (src/stores/index.ts — single global store, 7 slices)
  │    ├─ audio        – playback controls (isPlaying, speed, repeatMode)
  │    ├─ tts          – Web Speech / Polly state (isSpeaking, currentWord)
  │    ├─ settings     – user prefs (practiceType, vocabularyBook, theme)
  │    ├─ vocabulary   – loaded dataset (items, currentItem, filteredDataset)
  │    ├─ progress     – session stats (currentIndex, accuracy, streak)
  │    ├─ ui           – transient UI flags (notification)
  │    └─ auth         – Supabase auth (user, isAuthenticated)
  │
  ├─ Services  (src/services/)
  │    ├─ ai/            – recommendation, intervention, weak-area detection
  │    ├─ analytics/     – PostHog singleton + getAnalytics() accessor
  │    ├─ audio/         – TTSEngine (Web Speech API), pollyService (AWS Polly)
  │    ├─ data/          – vocabularyLoader (fetch cache, 5-min TTL)
  │    ├─ device/        – WakeLockService
  │    ├─ migration/     – local-to-cloud data migration
  │    ├─ profile/       – learner profile management
  │    ├─ session/       – sessionManager (Supabase + IndexedDB offline)
  │    ├─ supabase/      – client, auth, sync, autoSyncManager
  │    └─ tts/           – persistentCache (TTS audio caching)
  │
  ├─ Vercel Serverless API  (api/ at repo root)
  │    ├─ /api/ai/chat              – Gemini streaming SSE
  │    ├─ /api/ai-recommendations   – personalized suggestions
  │    ├─ /api/premium-tts          – AWS Polly TTS proxy
  │    ├─ /api/audio/generate       – alternative TTS with S3 caching
  │    ├─ /api/pronunciation-score  – Gemini-based scoring
  │    ├─ /api/voices               – available voice list
  │    └─ /api/config               – runtime config
  │
  └─ Build-Time Data Pipeline  (scripts/)
       └─ pte-data-pipeline.js
            reads:  data/source/pte/*.md
            writes: data/processed/*.json
```

---

## Entry Point Chain

```
index.html
  └─ <script type="module" src="/src/main.tsx">
       └─ main.tsx
            ├─ imports: @radix-ui/themes/styles.css, App, tailwind.css
            ├─ ReactDOM.createRoot(#root).render(<StrictMode><App /></StrictMode>)
            └─ registers PWA service worker (vite-plugin-pwa)

App.tsx
  └─ <Suspense> + <ToastProvider>
       └─ <AppContent />

AppContent.tsx  (main coordinator)
  ├─ reads Zustand store slices via selector hooks
  ├─ loads vocabulary on mount via vocabularyLoader
  ├─ determines interface type from settings.practiceType + vocabulary.mode
  └─ renders one of:
       ├─ WordCard            (vocabulary mode)
       ├─ VocabTypingInterface (vocab-typing mode)
       ├─ RSInterface          (repeat sentence)
       ├─ ASQInterface         (answer short question)
       └─ WFDInterface         (write from dictation)
```

---

## Routing

There is **no React Router**. All navigation is state-driven through the Zustand store:

- `settings.practiceType` — top-level mode: `'vocabulary'` | `'vocab-typing'` | `'practice'` | `'shadowing'`
- `vocabulary.mode` — within practice, determines sub-type (`'practice-repeat-sentence'`, `'practice-answer-short-question'`, `'practice-write-from-dictation'`)

`AppContent.getPracticeInterfaceType()` maps these two values to a component.

---

## State Management

Single Zustand store created at `src/stores/index.ts`:

```
useAppStore = create(
  subscribeWithSelector(        ← granular subscriptions
    devtools(                   ← Redux DevTools (dev only)
      persist(                  ← localStorage['pte-app-storage']
        (set, get) => ({ ... 7 slices ... })
      )
    )
  )
)
```

**Persisted fields** (via `partialize`): `settings`, `audio` (preferences only), `progress`.

**Rehydration hooks**: converts `completedItems` from Array back to Set; migrates legacy DI shadowing dataset IDs.

Helper selector hooks exported: `useAudioState`, `useSettings`, `useVocabulary`, `useProgress`, `useAuth`, etc.

Store is also exposed on `window.appStore` for legacy vanilla-JS interop.

---

## Services

### ai/ (src/services/ai/)

| File | Purpose |
|---|---|
| `recommendationService.ts` | Calls `/api/ai-recommendations` serverless endpoint |
| `recommendationEngine.ts` | Client-side learning-path logic |
| `interventionEngine.ts` | Monitors session, triggers proactive suggestions |
| `weakAreaDetector.ts` | Detects error patterns for analytics |
| `ratingService.ts` | Collects user feedback on AI suggestions |
| `taskPersonas.ts` | Task-specific prompt templates |

### analytics/ (src/services/analytics/)

| File | Purpose |
|---|---|
| `analyticsService.ts` | PostHog singleton — initialized on window |
| `getAnalytics.ts` | Typed accessor: `getAnalytics()` returns singleton or `null` |

### audio/ (src/services/audio/)

| File | Purpose |
|---|---|
| `TTSEngine.ts` | Web Speech API wrapper; subscribes to Zustand settings for rate/voice; optional Polly fallback |
| `pollyService.ts` | AWS Polly client (calls `/api/premium-tts`) |

### data/ (src/services/data/)

| File | Purpose |
|---|---|
| `vocabularyLoader.ts` | Shared fetch cache (`Map<string, CacheEntry>`) with 5-minute TTL. Used by AppContent and SettingsPanel. |

### device/ (src/services/device/)

| File | Purpose |
|---|---|
| `WakeLockService.ts` | Screen Wake Lock API to prevent screen sleep during practice |

### session/ (src/services/session/)

| File | Purpose |
|---|---|
| `sessionManager.ts` | Tracks practice sessions; persists to Supabase when online, IndexedDB when offline |

### supabase/ (src/services/supabase/)

| File | Purpose |
|---|---|
| `supabaseClient.ts` | Creates Supabase client from `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` env vars (falls back gracefully) |
| `authService.ts` | Sign up / sign in / sign out |
| `syncService.ts` | Progress sync across devices |
| `autoSyncManager.ts` | Background auto-sync on interval |

### migration/ (src/services/migration/)

| File | Purpose |
|---|---|
| `migrationService.ts` | One-time local-storage → Supabase cloud migration |

---

## Serverless API (Vercel Functions)

All files live under `api/` at the repo root and run as Vercel serverless functions.

| Route | File | Description |
|---|---|---|
| `POST /api/ai/chat` | `api/ai/chat.ts` | Gemini streaming chat (SSE) |
| `POST /api/ai-recommendations` | `api/ai-recommendations.ts` | Personalized learning suggestions |
| `POST /api/premium-tts` | `api/premium-tts.ts` | AWS Polly neural TTS proxy |
| `POST /api/audio/generate` | `api/audio/generate.ts` | Alternative TTS with S3 caching |
| `POST /api/pronunciation-score` | `api/pronunciation-score.ts` | Gemini-based pronunciation scoring |
| `GET  /api/voices` | `api/voices.ts` | Available Polly voice list |
| `GET  /api/config` | `api/config.ts` | Runtime configuration |

During local development, the Vite dev server handles `/api/ai/chat` via an inline middleware (`scripts/ai-chat-middleware.ts` registered in `vite.config.ts`). Other API routes require the Vercel CLI or the `dev:proxy` script.

---

## Data Pipeline

```
data/source/pte/
  ├─ vocabs/*.md       (17 vocabulary books)
  └─ practices/*.md    (RS / ASQ / WFD sentences)
        │
        ▼  npm run data:pte  (scripts/pte-data-pipeline.js)
        │
data/processed/*.json  (17+ JSON datasets)
        │
        ▼  fetch() at runtime (vocabularyLoader.ts)
        │
Zustand store → vocabulary.items
```

Extractors (in `archive/vanilla-js-legacy/data/extractors/`):
- `PTETermsExtractor.js` — dual IPA (British + American)
- `SingleIPATermsExtractor.js` — single IPA
- `PTESentenceExtractor.js` — RS/WFD sentences
- `PTEQuestionExtractor.js` — ASQ questions
- `DIAnswerExtractor.js` — DI shadowing answers

---

## Singletons Created at Module Load

These are created as side effects when their modules are first imported:

| Singleton | Location | Notes |
|---|---|---|
| `appConfig` | `src/config/AppConfig.ts` | `new AppConfig()` exported at module scope |
| `useAppStore` | `src/stores/index.ts` | Zustand `create()` at module scope |
| `supabase` client | `src/services/supabase/supabaseClient.ts` | `createClient()` at module scope |
| `ttsEngine` | `src/services/audio/TTSEngine.ts` | Subscribes to Zustand on creation |
| `analyticsService` | `src/services/analytics/analyticsService.ts` | PostHog init, attached to `window` |
| `wakeLockService` | `src/services/device/WakeLockService.ts` | Imported in AppContent |

---

## Component Organization

```
src/components/
  ├─ ai/          – AI features (AISidebar, AITutorChat, InterventionModal,
  │                 PronunciationScoring, WeakAreasDashboard, AIRecommendations)
  ├─ audio/       – AudioControls, VoiceSelector, PremiumVoiceSelector
  ├─ practice/    – WordCard, RSInterface, ASQInterface, WFDInterface,
  │                 VocabTypingInterface, VocabularyList, ProgressTracker,
  │                 ProgressDashboard, PracticeModeSelector, DifficultyFilter
  ├─ settings/    – SettingsPanel
  ├─ migration/   – DataMigrationModal
  ├─ profile/     – LearnerProfileModal
  └─ shared/      – OnboardingModal, Skeleton, ComponentSkeleton, ToastProvider
```

Heavy components (`RSInterface`, `ASQInterface`, `WFDInterface`, `VocabTypingInterface`, `AISidebar`, `AITutorChat`, `InterventionModal`, `PronunciationScoring`, `WeakAreasDashboard`, `ProgressDashboard`) are **lazy-loaded** via `React.lazy()` in AppContent for code splitting.

---

## Build & Deployment

| Command | Action |
|---|---|
| `npm run dev` | Vite dev server (port 3001, HMR) |
| `npm run build` | `tsc` + `vite build` → `dist/` |
| `npm run vercel-build` | `data:pte` + `vite build` + copy processed data to `dist/data/` |

Production build output in `dist/` with manual chunks: `vendor` (React, Zustand), `radix-ui`, `supabase`, `analytics`.

Vite config (`vite.config.ts`) defines path aliases (`@`, `@components`, `@stores`, etc.), PostCSS/Tailwind integration, and PWA manifest via `vite-plugin-pwa`.

---

## CSS Architecture

- **Primary**: Tailwind CSS 4.x (utility classes in TSX)
- **Legacy**: Custom CSS in `src/css/` (variables.css, animations.css, components.css, style.css, responsive.css)
- **Radix UI Themes**: `@radix-ui/themes/styles.css` imported in `main.tsx`
- **Design tokens**: 222 CSS custom properties in `variables.css`

---

## Tech Stack Summary

| Layer | Technology |
|---|---|
| UI Framework | React 19.2.0 |
| Language | TypeScript 5.9.3 (strict) |
| State | Zustand 5.0 |
| Components | Radix UI 3.2 |
| Styling | Tailwind CSS 4.x |
| Build | Vite 7.2 |
| Testing | Vitest |
| Backend | Vercel Serverless Functions |
| Database | Supabase (PostgreSQL + Auth) |
| AI | Google Gemini (via @google/genai) |
| TTS | Web Speech API + AWS Polly |
| Analytics | PostHog |
| PWA | vite-plugin-pwa (Workbox) |
