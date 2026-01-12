# CLAUDE.md — Subby Project Context

> This file provides context for Claude Code and other AI assistants.

## Project Summary

**Subby** is a local-first desktop subscription tracker built with Tauri 2, React, TypeScript, and SQLite. It features a glassmorphic UI inspired by Aurora UI trends.

**Status**: MVP Complete (v0.1.0)

## Tech Stack Quick Reference

- **Runtime**: Tauri 2.x (Rust backend)
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **State**: Zustand
- **Database**: SQLite via tauri-plugin-sql
- **Forms**: React Hook Form + Zod
- **Animations**: Framer Motion
- **Charts**: Recharts

## Key Directories

| Path | Purpose |
|------|---------|
| `src-tauri/` | Rust backend, Tauri config, database migrations |
| `src/components/` | React components |
| `src/components/ui/` | shadcn/ui primitives |
| `src/components/calendar/` | Calendar page components |
| `src/components/dashboard/` | Dashboard charts and stats |
| `src/components/categories/` | Category management |
| `src/components/subscriptions/` | Subscription CRUD |
| `src/components/settings/` | Settings components |
| `src/hooks/` | Custom React hooks |
| `src/stores/` | Zustand state stores |
| `src/types/` | TypeScript type definitions with Zod |
| `src/lib/` | Utilities (database, currency, date, data-management) |
| `docs/` | Project documentation |

## MVP Features (Complete)

- [x] Subscription CRUD with multiple billing cycles
- [x] 9 default categories + custom categories
- [x] Dashboard with stats, donut chart, trend chart
- [x] Calendar with payment tracking (mark paid/skip)
- [x] Payment history in database
- [x] Theme switching (dark/light/system)
- [x] Currency selection (reflects everywhere)
- [x] Data export/import (JSON backup)
- [x] Glass-morphic UI with Framer Motion animations

## Database Tables

- `subscriptions` - User subscriptions
- `categories` - Default + custom categories
- `payments` - Payment history (paid/skipped)
- `settings` - User preferences (theme, currency, notifications)

## Design Principles

1. **Glass-morphic UI**: Use `backdrop-blur-xl`, subtle borders, transparency
2. **Dark-first**: Design for dark mode, ensure light mode works
3. **Smooth animations**: Use Framer Motion for micro-interactions
4. **Type safety**: Zod schemas → TypeScript types

## Common Commands

```bash
pnpm tauri dev        # Run app in dev mode
pnpm tauri build      # Build for production
pnpm lint             # Run ESLint
pnpm format           # Run Prettier
```

## Code Style

- Components: PascalCase, one per file
- Files: kebab-case
- Use `@/` path alias for imports

## Data Storage

SQLite database stored in Tauri app data directory:
- Linux: `~/.local/share/subby/`
- macOS: `~/Library/Application Support/subby/`
- Windows: `%APPDATA%/subby/`
