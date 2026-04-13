# Building from Source

## Prerequisites

- Node.js 18+ (22 recommended)
- pnpm 9+
- Rust (stable)
- Tauri system dependencies (Linux example):

```bash
sudo apt install -y libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf
```

## Setup

```bash
git clone https://github.com/Artificial-Source-Foundation/Kessai.git
cd kessai
pnpm install
pnpm tauri dev
```

## Quality Checks

Run before opening a PR:

```bash
pnpm check
pnpm test:run
```

Optional E2E checks:

```bash
pnpm test:e2e
```

## Production Build

```bash
pnpm tauri build
```
