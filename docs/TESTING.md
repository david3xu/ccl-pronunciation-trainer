# Testing

## Framework

- **Vitest 4.x** with **happy-dom** environment
- 123 tests across 9 test files

## Setup

Test setup file: `src/test/setup.ts`

Mocked browser APIs:
- `speechSynthesis`
- `SpeechSynthesisUtterance`
- `matchMedia`
- `IntersectionObserver`
- `ResizeObserver`

## Configuration

Vitest config: `vitest.config.ts`

Coverage thresholds (60% minimum):
- Branches: 60%
- Functions: 60%
- Lines: 60%
- Statements: 60%

## Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# With coverage report
npm run test:coverage
```

## Test Locations

Tests are colocated with source code:
- `*.test.ts` files next to the modules they test
- `__tests__/` directories under `src/`

## Pre-commit Hooks

`.husky/pre-commit` runs the following checks before each commit:

1. Docs validation
2. Structure validation
3. Lint (`npm run lint`)
4. Tests (`npm test`)
