# Product Requirements Document: Subby

## Document Context

- **Project**: Subby — Personal Subscription Tracker
- **Version**: 0.1.0 (MVP)
- **Last Updated**: 2026-01-12
- **Status**: Active Development

---

## Vision

A beautiful, local-first desktop application that gives users complete clarity over their recurring subscriptions and spending.

## Problem Statement

People lose track of subscriptions they've signed up for, leading to:

- Unexpected charges
- Forgotten free trials converting to paid
- No visibility into total recurring costs
- Difficulty budgeting for irregular billing cycles

## Solution

Subby provides:

1. A single dashboard showing all subscriptions
2. Visual spending breakdowns by category and time
3. Proactive reminders before charges hit
4. Complete data ownership (local-first, no cloud dependency)

## Target User

- Individuals managing personal subscriptions
- Privacy-conscious users preferring local data
- Users who want beautiful, focused tools

## Success Metrics (Personal Portfolio Context)

- Clean, impressive UI for portfolio showcase
- Functional CRUD with persistent storage
- Demonstrates Tauri + React + TypeScript expertise
- Open-source with clear documentation

---

## Functional Requirements

### MVP Features (v0.1.0)

| ID  | Feature                          | Priority | Epic    |
| --- | -------------------------------- | -------- | ------- |
| F1  | Add/Edit/Delete subscriptions    | Must     | Epic-02 |
| F2  | Dashboard with spending overview | Must     | Epic-03 |
| F3  | Category management              | Must     | Epic-02 |
| F4  | Calendar payment view            | Should   | Epic-04 |
| F5  | Local notifications              | Should   | Epic-05 |
| F6  | Export/Import data               | Should   | Epic-06 |
| F7  | Settings (theme, currency)       | Must     | Epic-02 |

### Post-MVP Features (v0.2.0+)

- Multi-currency support with conversion
- Subscription logo auto-fetch
- Payment history tracking
- Budget limits & alerts
- Widgets (system tray quick view)

---

## Non-Functional Requirements

| Requirement        | Target                  |
| ------------------ | ----------------------- |
| App size           | < 15MB                  |
| Startup time       | < 2 seconds             |
| Offline capability | 100% functional offline |
| Platform support   | Windows, macOS, Linux   |
| Accessibility      | WCAG 2.1 AA compliant   |

---

## Data Model (Conceptual)

### Subscription

- id: UUID
- name: string
- amount: decimal
- currency: string (default: user preference)
- billing_cycle: enum (weekly, monthly, quarterly, yearly, custom)
- billing_day: number (day of month/week)
- category_id: UUID (FK)
- color: string (hex)
- logo_url: string (optional)
- notes: string (optional)
- is_active: boolean
- created_at: timestamp
- updated_at: timestamp
- next_payment_date: computed

### Category

- id: UUID
- name: string
- color: string (hex)
- icon: string (lucide icon name)
- is_default: boolean

### Settings

- id: singleton
- theme: enum (dark, light, system)
- currency: string (USD, MXN, EUR, etc.)
- notification_enabled: boolean
- notification_days_before: number[]
