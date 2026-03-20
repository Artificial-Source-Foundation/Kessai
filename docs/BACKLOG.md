# Subby — Feature Backlog

> Prioritized based on competitive research (March 2026)

## Completed (v0.2.0)

- [x] **Search & Filter** — Search bar + category filters on the subscriptions list
- [x] **Notification Reminders** — System notifications for upcoming renewals via Tauri notifications API (configurable advance days and time)
- [x] **Subscription Sorting** — Sort by price, name, next billing date, category
- [x] **Spending Trends Chart** — Monthly/yearly area chart on dashboard showing spending over time
- [x] **Multi-Currency Support** — Track subscriptions in different currencies with cached exchange rate conversion
- [x] **Keyboard Shortcuts** — `N` new subscription, `/` search, `?` shortcuts dialog, `Esc` close, `1-4` navigate pages
- [x] **Free Trial Tracking** — Dedicated trial status with countdown timer, expiry alerts, and dashboard widget
- [x] **Logo Auto-Fetch** — Auto-fetch service logos/favicons via Google favicon API when adding subscriptions
- [x] **Price Increase Detection** — Track historical price changes per subscription with timeline and alert cards
- [x] **CSV/JSON Import from Competitors** — Import from Wallos, Bobby, generic CSV, and Subby JSON backups
- [x] **Household/Family Sharing** — Shared subscription splitting with configurable split count

## Quick Wins

- [ ] **Smart Notification Grouping** — Consolidate alerts ("3 subscriptions renew this week") to reduce notification fatigue

## Medium Effort

- [ ] **Subscription Health Score** — Computed metric based on cost vs category average, usage frequency, price trend
- [ ] **Desktop Widgets** — System tray widget showing next payment and monthly total

## Larger Features

- [ ] **Onboarding Flow** — First-launch walkthrough for new users
- [ ] **Multi-Language Support** — i18n framework (Wallos supports 21+ languages)
- [ ] **Drag-to-Reorder** — Reorder subscriptions and categories manually
