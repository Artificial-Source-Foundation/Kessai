# AGENTS.md — Subby AI Agent Guidelines

> Guidelines for AI agents working on the Subby codebase.

## Project Overview

Subby is a Tauri 2 desktop subscription tracker (React + TypeScript + Rust + SQLite). See `CLAUDE.md` for full project context, tech stack, design system, and code conventions.

## Before Making Changes

1. Read `CLAUDE.md` for project conventions and don'ts
2. Run `pnpm check` to verify lint, typecheck, and formatting pass
3. Run `pnpm test:run` to ensure tests pass
4. For Rust changes, also run `cargo test --workspace`

## Branching & Workflow

- **`main`** is the stable branch. All work merges here via PRs.
- Create feature branches from `main` for any non-trivial work.
- CI (`.github/workflows/ci.yml`) runs automatically on PRs and `main` pushes.
- Never push directly to `main` without CI passing.

## Release Process

Releases are automated. Do not manually create GitHub Releases or tags.

1. Ensure `main` is clean and CI passes
2. Run `pnpm release` — this bumps versions, generates changelog, creates a `v*` tag, and pushes
3. GitHub Actions builds multi-platform installers and auto-publishes a GitHub Release
4. Installed apps auto-update via the Tauri updater plugin

Key constraints:
- `release-it` requires a clean working directory and being on `main`
- Version is synced across `package.json`, `src-tauri/tauri.conf.json`, and `src-tauri/Cargo.toml` automatically
- Commits should follow [Conventional Commits](https://www.conventionalcommits.org/) for changelog generation

## CI/CD Pipeline

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `ci.yml` | PRs, `main` pushes | Lint, typecheck, format, tests, audit |
| `release.yml` | `v*` tags | Build + sign + publish installers for all platforms |

## Code Quality Gates

Before any PR or release, these must pass:
- `pnpm lint` — ESLint
- `pnpm typecheck` — TypeScript strict mode
- `pnpm format --check` — Prettier
- `pnpm test:run` — Vitest unit/component tests
- `cargo test --workspace` — Rust tests

All of the above (except Rust) are bundled in `pnpm check`.

## Key Conventions

- Use Conventional Commits (`feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`)
- Components: PascalCase, one per file, kebab-case filenames
- Imports use `@/` path alias
- Use dayjs (not date-fns), Zustand (not Redux), Dialog (not Sheet)
- See the "Don'ts" section in `CLAUDE.md` for things to avoid
