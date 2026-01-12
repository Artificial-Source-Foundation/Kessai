# Subby

> Know where your money flows

A beautiful, local-first desktop subscription tracker built with Tauri 2, React, and SQLite. Features a glassmorphic UI with smooth animations.

## Features

- **Dashboard** - Monthly/yearly spending stats, category breakdown chart, monthly trend chart
- **Subscription Management** - Add, edit, delete, pause subscriptions
- **Payment Calendar** - Visual calendar with payment indicators, mark as paid/skipped
- **Category Organization** - 9 default categories + custom categories
- **Data Management** - Export/import JSON backups
- **Themes** - Dark/light/system theme support
- **Multi-currency** - Support for multiple currencies
- **100% Offline** - All data stored locally in SQLite

## Screenshots

*Coming soon*

## Tech Stack

- **Runtime**: Tauri 2.x (Rust backend)
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **State**: Zustand
- **Database**: SQLite via tauri-plugin-sql
- **Forms**: React Hook Form + Zod
- **Animations**: Framer Motion
- **Charts**: Recharts

## Development

### Prerequisites

- Node.js 18+
- pnpm 8+
- Rust (via rustup)
- Platform-specific dependencies:

**Linux (Debian/Ubuntu)**:
```bash
sudo apt install libgtk-3-dev libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf
```

**macOS**: Xcode Command Line Tools
**Windows**: WebView2, Visual Studio Build Tools

### Setup

```bash
# Clone the repository
git clone https://github.com/newstella/subby.git
cd subby

# Install dependencies
pnpm install

# Run in development
pnpm tauri dev
```

### Build

```bash
pnpm tauri build
```

## Data Storage

Your data is stored locally in Tauri's app data directory:
- **Linux**: `~/.local/share/subby/`
- **macOS**: `~/Library/Application Support/subby/`
- **Windows**: `%APPDATA%/subby/`

## Documentation

See [docs/README.md](./docs/README.md) for full documentation.

## License

MIT
