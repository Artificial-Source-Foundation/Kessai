# Changelog

All notable changes to Subby will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-01-19

### Added

- Initial release
- Dashboard with monthly/yearly spending stats
- Category breakdown donut chart
- Spending trend chart with comparison
- Subscription management (add, edit, delete, pause)
- Multiple view modes (grid, list, bento treemap)
- Payment calendar with payment indicators
- Mark payments as paid or skipped
- Payment history tracking in database
- 9 default categories with custom category support
- Data export/import (JSON backup)
- Theme switching (dark/light/system)
- Multi-currency support (USD, EUR, GBP, and more)
- SQLite database for local storage
- Cross-platform support (Windows, macOS, Linux)

### Technical

- Built with Tauri 2, React 19, TypeScript, Vite 7
- Tailwind CSS 4 with shadcn/ui components
- Zustand for state management
- React Hook Form + Zod for form validation
- dayjs for date handling
- 136 unit tests with Vitest
