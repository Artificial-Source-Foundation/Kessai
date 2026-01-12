# Epic 01: Project Foundation

## Context
- **Epic ID**: EPIC-01
- **Status**: Complete
- **Priority**: Critical (Blocking)
- **Estimated Effort**: 1 Sprint
- **Target Sprint**: Sprint 01

---

## Goal

Establish the complete project foundation including Tauri setup, React configuration, database schema, component library, and development tooling.

---

## User Stories

### STORY-01.1: Project Scaffolding
**As a** developer  
**I want** a properly configured Tauri + React project  
**So that** I can begin feature development with all tooling ready

**Acceptance Criteria**:
- [x] Tauri 2.x project initialized
- [x] React 18 with TypeScript configured
- [x] Vite configured with HMR
- [x] Tailwind CSS installed and configured
- [x] shadcn/ui initialized with base components
- [x] ESLint + Prettier configured
- [x] Git repository with .gitignore

---

### STORY-01.2: Database Setup
**As a** developer  
**I want** SQLite database with migrations  
**So that** I can persist subscription data locally

**Acceptance Criteria**:
- [x] SQLite database configured via tauri-plugin-sql
- [x] Initial schema migrations created
- [x] Subscription, Category, Settings tables defined
- [x] Seed data for default categories

---

### STORY-01.3: App Shell & Routing
**As a** user  
**I want** a consistent navigation structure  
**So that** I can move between app sections

**Acceptance Criteria**:
- [x] Sidebar navigation component
- [x] Routes: Dashboard, Subscriptions, Calendar, Settings
- [x] Active route highlighting
- [x] Responsive layout (collapsible sidebar)
- [x] Glass-morphic styling applied

---

### STORY-01.4: Theme System
**As a** user  
**I want** dark/light theme support  
**So that** the app matches my system preference

**Acceptance Criteria**:
- [x] Dark theme as default
- [x] Light theme variant
- [x] System preference detection
- [x] Theme toggle in settings
- [x] Theme persisted to settings

---

### STORY-01.5: Design System Implementation
**As a** developer  
**I want** design tokens and base components styled  
**So that** the UI is consistent and on-brand

**Acceptance Criteria**:
- [x] Color tokens in Tailwind config
- [x] Typography scale defined
- [x] Glass card component created
- [x] Button variants styled
- [x] Form inputs styled
- [x] Consistent spacing applied

---

## Definition of Done

- [x] All stories meet acceptance criteria
- [x] No TypeScript errors
- [x] Documentation updated
- [x] Demo-ready (can show empty state UI)

---

## Notes for AI Assistants

When working on this epic:
1. Use Tauri 2.x (not 1.x) — APIs differ significantly
2. SQLite uses tauri-plugin-sql, not Drizzle ORM directly
3. shadcn/ui components are in `src/components/ui/`
4. Follow existing Tailwind config, don't override base styles
