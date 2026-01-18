# Development Setup Guide

## Prerequisites

- **Node.js**: 18+ (LTS recommended)
- **pnpm**: 8+ (package manager)
- **Rust**: Latest stable via rustup
- **Platform dependencies**: See Tauri prerequisites

### Linux (Debian/Ubuntu)

```bash
sudo apt update
sudo apt install libwebkit2gtk-4.1-dev build-essential curl wget file \
  libssl-dev libayatana-appindicator3-dev librsvg2-dev
```

### macOS

```bash
xcode-select --install
```

### Windows

- Install Visual Studio Build Tools
- Install WebView2

---

## Installation

1. **Clone the repository**

```bash
git clone https://github.com/newstella/subby.git
cd subby
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Run in development mode**

```bash
pnpm tauri dev
```

---

## Common Commands

| Command            | Description                         |
| ------------------ | ----------------------------------- |
| `pnpm dev`         | Start Vite dev server only          |
| `pnpm tauri dev`   | Start full Tauri app in dev mode    |
| `pnpm build`       | Build frontend for production       |
| `pnpm tauri build` | Build complete app for distribution |
| `pnpm lint`        | Run ESLint                          |
| `pnpm format`      | Run Prettier                        |

---

## Project Structure

```
subby/
├── src/                 # React frontend
│   ├── components/      # UI components
│   ├── pages/           # Route pages
│   ├── hooks/           # Custom hooks
│   ├── stores/          # Zustand stores
│   ├── lib/             # Utilities
│   ├── types/           # TypeScript types
│   └── styles/          # Global CSS
├── src-tauri/           # Rust backend
│   ├── src/lib.rs       # Main Tauri setup
│   ├── Cargo.toml       # Rust dependencies
│   └── tauri.conf.json  # Tauri config
└── docs/                # Documentation
```

---

## Troubleshooting

### Rust not found

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env
```

### WebView2 errors (Windows)

Download and install WebView2 Runtime from Microsoft.

### SQLite errors

The database is created automatically on first run at the app data directory.
