# Epics Overview

## What is an Epic?

An epic represents a major feature area that spans multiple sprints. Each epic contains user stories, acceptance criteria, and technical tasks.

---

## Epic Status Legend

| Status | Meaning |
|--------|---------|
| Planned | Not started |
| In Progress | Active development |
| Complete | All stories done |
| Blocked | Waiting on dependency |

---

## Epics Roadmap

| # | Epic | Status | Sprints | Description |
|---|------|--------|---------|-------------|
| 01 | [Foundation](./epic-01-foundation.md) | ✅ Complete | S01 | Project setup, tooling, base architecture |
| 02 | [Subscription CRUD](./epic-02-subscription-crud.md) | ✅ Complete | S01-S02 | Core subscription management + categories |
| 03 | [Dashboard](./epic-03-dashboard.md) | ✅ Complete | S03 | Stats, charts, overview |
| 04 | [Calendar](./epic-04-calendar.md) | ✅ Complete | S04 | Payment calendar view |
| 05 | [Notifications](./epic-05-notifications.md) | ✅ Complete | S04-S05 | Simplified to local reminders |
| 06 | [Data Management](./epic-06-data-management.md) | ✅ Complete | S05 | Import/export, backup |
| 07 | [Polish](./epic-07-polish.md) | ✅ Complete | S05 | Included in MVP polish |

---

## Dependency Graph

```
Epic-01 (Foundation)
    │
    ├──► Epic-02 (Subscription CRUD)
    │        │
    │        ├──► Epic-03 (Dashboard)
    │        │        │
    │        │        └──► Epic-04 (Calendar)
    │        │
    │        └──► Epic-05 (Notifications)
    │
    └──► Epic-06 (Data Management)
              │
              └──► Epic-07 (Polish)
```
