# Testing Guide

Kessai uses unit/component tests and E2E tests.

## Test Stack

- Unit and component: Vitest + Testing Library
- E2E: Playwright
- Rust: `cargo test`

## Commands

```bash
pnpm test              # watch mode
pnpm test:run          # single run
pnpm test:coverage     # with coverage report
cargo test --workspace # Rust tests
pnpm test:e2e          # end-to-end suite
```

## Pre-PR Minimum

Run these before opening a PR:

```bash
pnpm check
pnpm test:run
cargo test --workspace
```

## Test File Organization

Tests live in `__tests__/` subdirectories next to the code they test:

```
src/
├── hooks/
│   ├── __tests__/
│   │   ├── use-calendar-stats.test.ts
│   │   └── use-dashboard-stats.test.ts
│   ├── use-calendar-stats.ts
│   └── use-dashboard-stats.ts
├── lib/
│   ├── __tests__/
│   │   ├── currency.test.ts
│   │   ├── data-management.test.ts
│   │   └── date-utils.test.ts
│   └── ...
├── stores/
│   ├── __tests__/
│   │   ├── category-store.test.ts
│   │   ├── payment-card-store.test.ts
│   │   ├── payment-store.test.ts
│   │   ├── settings-store.test.ts
│   │   ├── subscription-store.test.ts
│   │   └── ui-store.test.ts
│   └── ...
└── types/
    ├── __tests__/
    │   ├── category.test.ts
    │   ├── payment-card.test.ts
    │   └── subscription.test.ts
    └── ...
```

## Mocking Tauri IPC in Unit Tests

Zustand stores call `invoke()` from `@tauri-apps/api/core`. Mock this at the module level using `vi.mock`:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useMyStore } from '../my-store'

const mockInvoke = vi.fn()

vi.mock('@tauri-apps/api/core', () => ({
  invoke: (...args: unknown[]) => mockInvoke(...args),
}))

describe('useMyStore', () => {
  beforeEach(() => {
    // Reset Zustand state
    useMyStore.setState({ items: [], isLoading: false, error: null })
    vi.clearAllMocks()
    mockInvoke.mockResolvedValue([])
  })

  it('fetches items', async () => {
    mockInvoke.mockResolvedValue([{ id: '1', name: 'Test' }])
    await useMyStore.getState().fetch()
    expect(mockInvoke).toHaveBeenCalledWith('list_items')
    expect(useMyStore.getState().items).toHaveLength(1)
  })
})
```

Key patterns:

- **Reset state in `beforeEach`**: Use `useMyStore.setState(...)` to reset Zustand stores
- **Mock return values**: Use `mockInvoke.mockResolvedValue(...)` per test
- **Test optimistic updates**: Verify state changes immediately, then after async resolution
- **Test rollbacks**: Mock a rejection and verify state reverts

## E2E Fixtures (Mock IPC)

E2E tests run against the Vite dev server without the Rust backend. The `e2e/fixtures.ts` file provides a custom Playwright `test` fixture that injects a mock IPC handler via `page.addInitScript()`.

```typescript
import { test, expect } from '../e2e/fixtures'

test('can navigate to settings', async ({ page }) => {
  await page.goto('http://localhost:1420')
  // The mock IPC is already injected — all invoke() calls return mock data
  await page.click('[data-testid="settings-link"]')
  await expect(page.locator('h1')).toContainText('Settings')
})
```

The mock handler in `fixtures.ts` simulates all Tauri IPC commands (`get_settings`, `list_subscriptions`, etc.) with in-memory state, so tests can create, modify, and delete data within each test run.

## CI Recommendation

- Required on PR: `pnpm check`, `pnpm test:run`, `cargo test --workspace`
- Optional: `pnpm test:e2e` on schedule/manual or selected PR labels
