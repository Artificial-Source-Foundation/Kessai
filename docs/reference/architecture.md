# System Architecture

## Document Context

- **Project**: Subby
- **Last Updated**: 2026-01-17

---

## Overview

Subby follows a local-first architecture with a clear separation between the Tauri/Rust backend and React frontend.

```
┌─────────────────────────────────────────────────────────┐
│                    Tauri Window                          │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐   │
│  │              React Frontend (WebView)            │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────────────┐  │   │
│  │  │ Pages   │  │ Stores  │  │ Components      │  │   │
│  │  │         │  │(Zustand)│  │ (shadcn/ui)     │  │   │
│  │  └────┬────┘  └────┬────┘  └─────────────────┘  │   │
│  │       │            │                             │   │
│  │       └────────────┼─────────────────────────────┤   │
│  │                    │                             │   │
│  │              ┌─────▼─────┐                       │   │
│  │              │  lib/     │                       │   │
│  │              │ database  │                       │   │
│  │              └─────┬─────┘                       │   │
│  └────────────────────│─────────────────────────────┘   │
│                       │ IPC (invoke)                     │
├───────────────────────┼─────────────────────────────────┤
│  ┌────────────────────▼─────────────────────────────┐   │
│  │              Tauri Rust Backend                   │   │
│  │  ┌─────────────────┐  ┌────────────────────────┐ │   │
│  │  │ tauri-plugin-sql│  │ tauri-plugin-notification│   │
│  │  └────────┬────────┘  └────────────────────────┘ │   │
│  │           │                                       │   │
│  │  ┌────────▼────────┐                             │   │
│  │  │  SQLite DB      │                             │   │
│  │  │  (subby.db)     │                             │   │
│  │  └─────────────────┘                             │   │
│  └───────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## Technology Stack

| Layer           | Technology                 | Purpose                          |
| --------------- | -------------------------- | -------------------------------- |
| Runtime         | Tauri 2.x                  | Native shell, IPC, system access |
| Frontend        | React 19 + TypeScript      | UI components                    |
| Build           | Vite 7                     | Fast dev server and bundling     |
| Styling         | Tailwind CSS 4 + shadcn/ui | Design system                    |
| State           | Zustand + useShallow       | Client state management          |
| Database        | SQLite                     | Local persistence                |
| Database Access | tauri-plugin-sql           | SQL from frontend                |
| Dates           | dayjs                      | Lightweight date manipulation    |
| Forms           | React Hook Form + Zod      | Form handling and validation     |

---

## Data Flow

### Read Flow

1. React component mounts
2. Zustand store `fetch()` called
3. `lib/database.ts` executes SQL via `@tauri-apps/plugin-sql`
4. SQLite returns data
5. Store updates, React re-renders

### Write Flow

1. User submits form
2. Zustand store action called (add/update/remove)
3. SQL executed via plugin
4. Store re-fetches to sync state
5. UI updates with new data

---

## Directory Structure

```
subby/
├── src-tauri/           # Rust backend
│   ├── src/lib.rs       # Plugin setup, migrations
│   ├── Cargo.toml       # Rust dependencies
│   └── tauri.conf.json  # Tauri configuration
│
├── src/                 # React frontend
│   ├── components/      # UI components
│   │   ├── ui/          # shadcn/ui primitives
│   │   ├── layout/      # App shell, sidebar
│   │   └── ...          # Feature components
│   ├── pages/           # Route pages
│   ├── hooks/           # Custom hooks
│   ├── stores/          # Zustand stores
│   ├── lib/             # Utilities
│   ├── types/           # TypeScript types
│   └── styles/          # Global CSS
│
└── docs/                # Documentation
```

---

## Key Design Decisions

### Why tauri-plugin-sql over Drizzle ORM?

- Drizzle requires Node.js runtime (better-sqlite3)
- Tauri frontend runs in browser context
- Plugin provides direct SQLite access via IPC
- Type safety achieved through Zod schemas

### Why Zustand over React Query?

- Local database = no network caching benefits
- Simpler mental model for CRUD
- Lightweight (3KB vs 20KB+)
- Easy optimistic updates

### Why SQLite over IndexedDB?

- Better query capabilities
- Easier backup/export
- More familiar SQL syntax
- Tauri has excellent SQLite support
