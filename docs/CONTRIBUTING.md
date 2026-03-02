# Contributing

## Getting Started

1. Fork the repository
2. Clone your fork
3. Install dependencies: `npm install`
4. Create a branch from `main`

## Branch Naming

- `feature/<description>` — new features
- `fix/<description>` — bug fixes

## Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new vocabulary book
fix: correct TTS playback speed
docs: update architecture guide
refactor: simplify store slice
```

## Code Standards

### TypeScript

- **Strict mode** is enforced — do not weaken `tsconfig.json` settings
- Avoid `any` — use proper types or `unknown` with type guards
- Type guards are available in `src/utils/validation/guards.ts`

### Logging

Use the structured logger instead of raw `console.*` calls:

```typescript
import { logger } from '../utils/logger';

logger.info('Data loaded', { count: items.length });
logger.error('Failed to fetch', { error });
```

### Analytics

Use the analytics getter instead of accessing the global directly:

```typescript
import { getAnalytics } from '../services/analytics/getAnalytics';

getAnalytics()?.track('event_name', { property: 'value' });
```

Do **not** use `(window as any).analyticsService`.

## File Conventions

| Type | Location |
|------|----------|
| React components | `src/components/<feature>/` |
| Custom hooks | `src/hooks/` |
| State management | `src/stores/` |
| Business logic | `src/services/` |
| TypeScript types | `src/types/` |
| Utilities | `src/utils/` |

## Before Submitting a PR

```bash
npm run lint
npm test
```

Both must pass. The pre-commit hook enforces this automatically.
