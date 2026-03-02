# Testing Strategy

> Verified against the codebase on 2026-03-02.

## Framework

- **Test runner:** Vitest 4.x
- **DOM environment:** happy-dom
- **Component testing:** React Testing Library
- **Setup file:** `src/test/setup.ts`
- **Config:** `vitest.config.ts`

## Running Tests

```bash
npm test                # Run all tests (123 tests, 9 files)
npm run test:watch      # Watch mode
npm run test:ui         # Vitest UI
npm run test:coverage   # With V8 coverage report
```

## Test Locations

Tests live alongside source files using `.test.ts` / `.test.tsx` or `__tests__/` directories:

```
src/App.test.tsx
src/config/AppConfig.test.ts
src/components/practice/WordCard.test.tsx
src/components/shared/__tests__/ErrorBoundary.test.tsx
src/stores/__tests__/store.test.ts
src/hooks/__tests__/hooks.test.ts
src/utils/__tests__/textUtils.test.ts
src/utils/validation/__tests__/guards.test.ts
src/utils/validation/__tests__/schemas.test.ts
```

## Coverage

Coverage thresholds are set in `vitest.config.ts` (not `package.json`):

```
lines: 60%, functions: 60%, branches: 60%, statements: 60%
```

Critical paths to cover:
- `src/stores/` — state management logic
- `src/utils/` — type guards, text processing, validation schemas
- `src/config/` — configuration defaults
- `src/components/` — UI rendering and interaction

## Test Setup Mocks

`src/test/setup.ts` provides these browser API mocks required by the app:

- `window.speechSynthesis` — TTSEngine uses this at import time
- `SpeechSynthesisUtterance` — constructor mock
- `window.matchMedia` — responsive layout detection
- `IntersectionObserver` — lazy loading / visibility
- `ResizeObserver` — layout measurement

## Pre-Commit Hook

`.husky/pre-commit` runs four checks in order:
1. Documentation validation (`scripts/validate-docs.js`)
2. Structure validation (`scripts/validate-structure.js`)
3. ESLint (if config file exists)
4. Tests (`npm test`)

All four must pass for a commit to succeed.

## Manual Verification

Before merging, verify:
1. **Audio playback** — TTS speaks vocabulary words correctly
2. **Vocabulary switching** — Settings → change book → data loads
3. **Empty datasets** — "PTE Essay Topics" (0 items) shows empty-state UI, not a spinner
4. **Practice modes** — RS/ASQ/WFD interfaces render and accept input
5. **Responsive layout** — check on mobile and desktop viewports
