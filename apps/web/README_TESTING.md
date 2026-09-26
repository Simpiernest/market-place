# Frontend Testing Guide

## Setup

Install dependencies (already done):
```bash
npm install
```

## Running Tests

### Unit & Integration Tests (Vitest)
```bash
npm run test              # Run tests in watch mode
npm run test:ui           # Run with UI
npm run test:coverage     # Run with coverage report
```

### E2E Tests (Playwright)
```bash
npm run test:e2e          # Run all E2E tests
npm run test:e2e:ui       # Run with Playwright UI
```

## Test Structure

```
tests/
├── setup.ts                 # Test setup
├── unit/                    # Unit tests
│   ├── api-client.test.ts
│   └── utils.test.ts
├── integration/             # Integration tests
│   └── auth-flow.test.ts
└── e2e/                     # E2E tests (Playwright)
    ├── marketplace.spec.ts
    ├── auth.spec.ts
    └── deal-flow.spec.ts
```

## Writing Tests

### Unit Test Example (Vitest)
```typescript
import { describe, it, expect } from 'vitest'

describe('formatCurrency', () => {
  it('formats USD correctly', () => {
    expect(formatCurrency(100000)).toBe('$100,000.00')
  })
})
```

### E2E Test Example (Playwright)
```typescript
import { test, expect } from '@playwright/test'

test('should load homepage', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Business Bridge/)
})
```

## Coverage

Coverage reports are generated in:
- `coverage/` - Vitest coverage
- `playwright-report/` - Playwright test results
