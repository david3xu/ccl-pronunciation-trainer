# PTE Pronunciation Trainer

A modern web-based pronunciation training application for PTE exam preparation with AI-powered features.

## Features

### Vocabulary Learning
- 36 vocabulary books with 21,000+ terms including IPA transcriptions
- Dual IPA support (British and American English)
- Difficulty filtering and progress tracking

### Practice Modes
- **Repeat Sentence (RS)** — 620 sentences for oral fluency practice
- **Answer Short Question (ASQ)** — 692 questions with model answers
- **Write From Dictation (WFD)** — 1,195 dictation exercises

### DI Shadowing
- 85 Describe Image answers for continuous speech practice
- Real-time word highlighting during playback

### AI Features (Google Gemini — free tier)
- Conversational AI tutor chat
- Pronunciation scoring with detailed feedback
- Personalized learning recommendations and weak-area detection
- Proactive study interventions

### Audio
- Browser Web Speech API (free, built-in)
- AWS Polly premium neural TTS with 18 voice options

### Cloud Sync
- Supabase authentication (email, OAuth)
- Cross-device progress synchronization
- PostHog analytics (optional)

### PWA
- Offline support via service worker
- Installable on mobile and desktop

## Quick Start

### Prerequisites

- Node.js >= 16
- npm >= 8 (or Yarn 1.x)

### Install and Run

```bash
# Install dependencies
npm install

# Process vocabulary data and start dev server
npm start
```

The app runs at **http://localhost:5173** by default (Vite dev server).

## Available Scripts

| Script | Description |
|---|---|
| `npm start` | Process data + start dev server |
| `npm run dev` | Start Vite dev server only |
| `npm run data:pte` | Process Markdown source into JSON datasets |
| `npm run build` | TypeScript compile + production build |
| `npm test` | Run tests (Vitest) |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run lint` | TypeScript type checking (`tsc --noEmit`) |
| `npm run typecheck` | Alias for lint |
| `npm run validate` | Validate processed datasets |
| `npm run clean` | Remove `dist/` and `data/processed/` |
| `npm run deploy` | Full deploy pipeline (data + build + validate) |

## Project Structure

```
src/
├── components/    UI components grouped by feature (ai, audio, practice, settings, shared)
├── config/        Type-safe application configuration
├── css/           Tailwind entry point and custom stylesheets
├── data/          Dataset loading and schema definitions
├── hooks/         Custom React hooks
├── services/      Business logic and API clients (AI, audio, Supabase, analytics)
├── stores/        Zustand state management (7 slices)
├── test/          Test setup and utilities
├── types/         TypeScript type definitions
├── utils/         Shared utilities (text processing, validation, logging)
├── App.tsx        Root React component
└── main.tsx       Application entry point

data/
├── source/pte/    Markdown source files (vocabulary books, practice sentences)
└── processed/     Generated JSON datasets (built by data pipeline)

scripts/           Data pipeline and validation scripts
api/               Serverless API routes (Polly proxy, Gemini proxy)
archive/           Legacy vanilla JS code (data extractors still used by pipeline)
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Description | Required |
|---|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL | No (cloud sync disabled without it) |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | No (cloud sync disabled without it) |
| `VITE_GEMINI_API_KEY` | Google Gemini API key (client-side) | No (AI features disabled without it) |
| `GEMINI_API_KEY` | Google Gemini API key (server-side proxy) | No |
| `AWS_ACCESS_KEY_ID` | AWS IAM access key for Polly | No (premium TTS disabled without it) |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM secret key for Polly | No (premium TTS disabled without it) |
| `AWS_REGION` | AWS region (default: `us-east-1`) | No |
| `VITE_PREMIUM_TTS_ENABLED` | Enable premium TTS UI (`true`/`false`) | No |
| `VITE_POSTHOG_API_KEY` | PostHog analytics key | No |
| `VITE_POSTHOG_HOST` | PostHog host URL | No |
| `VITE_DEBUG` | Enable debug logging | No |

All variables are optional — the app runs fully offline with browser TTS and local storage when no services are configured.

## Tech Stack

| Category | Technology | Version |
|---|---|---|
| UI Framework | React | 19.2 |
| Language | TypeScript | 5.9 |
| State Management | Zustand | 5.0 |
| Component Library | Radix UI | 3.2 |
| Styling | Tailwind CSS | 4.1 |
| Build Tool | Vite | 7.2 |
| Testing | Vitest + Testing Library | 4.0 |
| Auth & Database | Supabase | 2.x |
| AI | Google Gemini (@google/genai) | 1.x |
| Premium TTS | AWS Polly | 3.x |
| Analytics | PostHog | 1.x |

## Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# With coverage
npm run test:coverage

# Interactive UI
npm run test:ui
```

Tests use **Vitest** with `happy-dom` and `@testing-library/react`.

## Deployment

### Vercel (recommended)

```bash
npm run vercel-build
```

This runs the data pipeline, builds with Vite, and copies processed datasets to `dist/`. Vercel auto-detects Vite and serves the `dist/` folder.

### Manual

```bash
npm run deploy
```

Upload the `dist/` folder to any static hosting provider.

## License

MIT
