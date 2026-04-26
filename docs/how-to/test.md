# How to test Kessai

Use this page to run quality checks before opening a PR or cutting a release.

## Run the core frontend quality gate

```bash
pnpm check
```

`pnpm check` runs:

- `pnpm lint`
- `pnpm typecheck`
- `pnpm format:check`

## Run frontend tests

Single run:

```bash
pnpm test:run
```

Watch mode:

```bash
pnpm test
```

Coverage:

```bash
pnpm test:coverage
```

## Run Rust tests

```bash
cargo test --workspace
```

## Run E2E tests

```bash
pnpm test:e2e
```

## Run the CI-style web smoke test locally

Install the browser once if needed:

```bash
npx playwright install --with-deps chromium
```

Then run the dedicated smoke spec:

```bash
pnpm test:e2e:web-smoke
```

What this does:

- builds the frontend bundle
- starts `kessai-web` on port `3001`
- uses an isolated temporary SQLite database instead of your default app database
- runs `e2e/web-smoke.spec.ts` through `playwright.web-smoke.config.ts`

If you only want to boot the smoke server without Playwright, run:

```bash
pnpm serve:smoke
```

For interactive troubleshooting UI:

```bash
pnpm test:e2e:ui
```

## Recommended pre-PR sequence

```bash
pnpm check
pnpm test:run
cargo test --workspace
```

## See also

- [How to run locally](./run-locally.md)
- [How to build and release](./build-and-release.md)
- [How to troubleshoot](./troubleshoot.md)
