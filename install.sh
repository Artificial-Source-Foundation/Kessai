#!/usr/bin/env bash
set -euo pipefail

# ============================================================================
# Subby Installer
# ============================================================================
# Installs Subby locally to your home directory. No sudo needed for the app
# itself — only for installing system build dependencies (one-time).
#
# Files installed:
#   ~/.local/bin/subby                              (binary)
#   ~/.local/share/applications/subby.desktop       (desktop entry)
#   ~/.local/share/icons/hicolor/128x128/apps/subby.png  (icon)
#
# To uninstall: ./uninstall.sh
# ============================================================================

VERSION="1.1.0"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
DIM='\033[2m'
NC='\033[0m'

print_step() { echo -e "${BLUE}==>${NC} $1"; }
print_success() { echo -e "${GREEN}✓${NC} $1"; }
print_warning() { echo -e "${YELLOW}!${NC} $1"; }
print_error() { echo -e "${RED}✗${NC} $1"; }
print_dry() { echo -e "${DIM}[dry-run]${NC} $1"; }
print_info() { echo -e "  ${DIM}$1${NC}"; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Default options
DRY_RUN=false

# ============================================================================
# Help
# ============================================================================
show_help() {
    cat << EOF
${BOLD}Subby Installer${NC} v${VERSION}

${BOLD}USAGE:${NC}
    ./install.sh [OPTIONS]

${BOLD}OPTIONS:${NC}
    -h, --help          Show this help message
    -n, --dry-run       Show what would be done without making changes

${BOLD}EXAMPLES:${NC}
    ./install.sh                  # Install the desktop app
    ./install.sh --dry-run        # Preview what would happen

${BOLD}WHAT THIS SCRIPT DOES:${NC}
    1. Checks for build tools (pnpm, cargo/rust)
    2. Installs missing Tauri build dependencies (one-time, needs sudo)
    3. Runs 'pnpm install' for Node.js dependencies
    4. Runs 'pnpm tauri build' to compile the app
    5. Copies the binary to ~/.local/bin/subby (no sudo)
    6. Creates desktop menu entry + icon in ~/.local/share (no sudo)

${BOLD}WHEN IS SUDO NEEDED?${NC}
    Only if system build libraries are missing (libwebkit2gtk, etc).
    This is a one-time package install (apt/dnf). The app itself
    installs entirely in your home directory — no sudo required.

${BOLD}SUPPORTED DISTROS:${NC}
    Ubuntu, Debian, Pop!_OS, Linux Mint (apt)
    Fedora, RHEL, CentOS, Nobara (dnf)

${BOLD}FILES CREATED:${NC}
    Desktop app (all in \$HOME, no sudo):
      ~/.local/bin/subby
      ~/.local/share/applications/subby.desktop
      ~/.local/share/icons/hicolor/128x128/apps/subby.png

${BOLD}TO UNINSTALL:${NC}
    ./uninstall.sh

EOF
}

# ============================================================================
# Parse arguments
# ============================================================================
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -n|--dry-run)
            DRY_RUN=true
            shift
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Run './install.sh --help' for usage."
            exit 1
            ;;
    esac
done

# ============================================================================
# Detect distro
# ============================================================================
detect_distro() {
    if [[ -f /etc/os-release ]]; then
        . /etc/os-release
        echo "$ID"
    else
        echo "unknown"
    fi
}

DISTRO=$(detect_distro)

# ============================================================================
# Confirm prompt
# ============================================================================
confirm() {
    local prompt="$1"
    local reply
    echo -ne "${YELLOW}?${NC} ${prompt} ${DIM}[Y/n]${NC} "
    read -r reply
    [[ -z "$reply" || "$reply" =~ ^[Yy]$ ]]
}

# ============================================================================
# Banner
# ============================================================================
echo ""
echo -e "${CYAN}${BOLD}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}${BOLD}║                                                           ║${NC}"
echo -e "${CYAN}${BOLD}║   ${GREEN}███████╗██╗   ██╗██████╗ ██████╗ ██╗   ██╗${CYAN}            ║${NC}"
echo -e "${CYAN}${BOLD}║   ${GREEN}██╔════╝██║   ██║██╔══██╗██╔══██╗╚██╗ ██╔╝${CYAN}            ║${NC}"
echo -e "${CYAN}${BOLD}║   ${GREEN}███████╗██║   ██║██████╔╝██████╔╝ ╚████╔╝${CYAN}             ║${NC}"
echo -e "${CYAN}${BOLD}║   ${GREEN}╚════██║██║   ██║██╔══██╗██╔══██╗  ╚██╔╝${CYAN}              ║${NC}"
echo -e "${CYAN}${BOLD}║   ${GREEN}███████║╚██████╔╝██████╔╝██████╔╝   ██║${CYAN}               ║${NC}"
echo -e "${CYAN}${BOLD}║   ${GREEN}╚══════╝ ╚═════╝ ╚═════╝ ╚═════╝    ╚═╝${CYAN}               ║${NC}"
echo -e "${CYAN}${BOLD}║                                                           ║${NC}"
echo -e "${CYAN}${BOLD}║           Know where your money flows                     ║${NC}"
echo -e "${CYAN}${BOLD}║                                                           ║${NC}"
echo -e "${CYAN}${BOLD}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

if [[ "$DRY_RUN" == "true" ]]; then
    echo -e "${YELLOW}${BOLD}DRY RUN MODE${NC} - No changes will be made"
    echo ""
fi

# ============================================================================
# Check prerequisites
# ============================================================================
print_step "Checking prerequisites..."

# Source cargo env if rustup is installed but cargo isn't in PATH yet
if ! command -v cargo &> /dev/null && [[ -f "$HOME/.cargo/env" ]]; then
    source "$HOME/.cargo/env"
fi

MISSING_DEPS=()

if ! command -v pnpm &> /dev/null; then
    MISSING_DEPS+=("pnpm")
fi

if ! command -v cargo &> /dev/null; then
    MISSING_DEPS+=("rust/cargo")
fi

if [[ ${#MISSING_DEPS[@]} -gt 0 ]]; then
    print_error "Missing dependencies: ${MISSING_DEPS[*]}"
    echo ""
    echo "Install them with:"
    echo "  pnpm: npm install -g pnpm"
    echo "  rust: curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
    exit 1
fi

# Check for Tauri Linux build dependencies
NEEDS_SUDO=false
if [[ "$DISTRO" == "ubuntu" || "$DISTRO" == "debian" || "$DISTRO" == "pop" || "$DISTRO" == "linuxmint" ]]; then
    # Determine the right appindicator package.
    # Modern Ubuntu ships libayatana-appindicator3 which conflicts with the old
    # libappindicator3. Pick whichever is already on the system, or prefer ayatana.
    if dpkg -s libayatana-appindicator3-dev &>/dev/null; then
        APPINDICATOR_PKG=""  # already installed
    elif dpkg -s libappindicator3-dev &>/dev/null; then
        APPINDICATOR_PKG=""  # already installed
    elif dpkg -s libayatana-appindicator3-1 &>/dev/null; then
        # Runtime is installed, install matching dev package
        APPINDICATOR_PKG="libayatana-appindicator3-dev"
    else
        APPINDICATOR_PKG="libayatana-appindicator3-dev"
    fi
    TAURI_DEPS="libwebkit2gtk-4.1-dev librsvg2-dev patchelf"
    [[ -n "$APPINDICATOR_PKG" ]] && TAURI_DEPS="$TAURI_DEPS $APPINDICATOR_PKG"
    MISSING_TAURI_DEPS=()
    for dep in $TAURI_DEPS; do
        if ! dpkg -s "$dep" &>/dev/null; then
            MISSING_TAURI_DEPS+=("$dep")
        fi
    done
    if [[ ${#MISSING_TAURI_DEPS[@]} -gt 0 ]]; then
        NEEDS_SUDO=true
        echo ""
        print_warning "Missing Tauri build libraries: ${MISSING_TAURI_DEPS[*]}"
        print_info "These are system libraries needed to compile Tauri apps."
        print_info "This is the ONLY step that needs sudo (one-time install)."
        print_info "The app itself installs entirely in your home directory."
        echo ""
        if [[ "$DRY_RUN" == "true" ]]; then
            print_dry "Would run: sudo apt update && sudo apt install -y ${MISSING_TAURI_DEPS[*]}"
        else
            if confirm "Install them now? (requires sudo)"; then
                sudo apt update && sudo apt install -y "${MISSING_TAURI_DEPS[@]}"
                print_success "Build libraries installed"
            else
                echo ""
                print_info "You can install them manually and re-run this script:"
                print_info "  sudo apt update && sudo apt install -y ${MISSING_TAURI_DEPS[*]}"
                exit 1
            fi
        fi
        echo ""
    fi
elif [[ "$DISTRO" == "fedora" || "$DISTRO" == "rhel" || "$DISTRO" == "centos" || "$DISTRO" == "nobara" ]]; then
    TAURI_DEPS="webkit2gtk4.1-devel librsvg2-devel patchelf libappindicator-gtk3-devel"
    # Fedora 39+ also needs these for Tauri 2
    TAURI_DEPS="$TAURI_DEPS gtk3-devel openssl-devel"
    MISSING_TAURI_DEPS=()
    for dep in $TAURI_DEPS; do
        if ! rpm -q "$dep" &>/dev/null; then
            MISSING_TAURI_DEPS+=("$dep")
        fi
    done
    if [[ ${#MISSING_TAURI_DEPS[@]} -gt 0 ]]; then
        NEEDS_SUDO=true
        echo ""
        print_warning "Missing Tauri build libraries: ${MISSING_TAURI_DEPS[*]}"
        print_info "These are system libraries needed to compile Tauri apps."
        print_info "This is the ONLY step that needs sudo (one-time install)."
        print_info "The app itself installs entirely in your home directory."
        echo ""
        if [[ "$DRY_RUN" == "true" ]]; then
            print_dry "Would run: sudo dnf install -y ${MISSING_TAURI_DEPS[*]}"
        else
            if confirm "Install them now? (requires sudo)"; then
                sudo dnf install -y "${MISSING_TAURI_DEPS[@]}"
                print_success "Build libraries installed"
            else
                echo ""
                print_info "You can install them manually and re-run this script:"
                print_info "  sudo dnf install -y ${MISSING_TAURI_DEPS[*]}"
                exit 1
            fi
        fi
        echo ""
    fi
fi

print_success "Prerequisites OK"

# ============================================================================
# Install pnpm dependencies
# ============================================================================
print_step "Installing Node.js dependencies..."
if [[ "$DRY_RUN" == "true" ]]; then
    print_dry "Would run: pnpm install"
else
    cd "$SCRIPT_DIR"
    pnpm install
fi
print_success "Dependencies ready"

# ============================================================================
# Build and install Subby app
# ============================================================================
echo ""
print_step "Building Subby desktop app (this may take a few minutes)..."

if [[ "$DRY_RUN" == "true" ]]; then
    print_dry "Would run: pnpm tauri build"
else
    cd "$SCRIPT_DIR"
    SPIN_CHARS='⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'
    SPIN_IDX=0
    CURRENT_STATUS="starting..."
    BUILD_LOG=$(mktemp)

    # Spinner runs in background, reads status from a temp file
    STATUS_FILE=$(mktemp)
    echo "$CURRENT_STATUS" > "$STATUS_FILE"

    (
        while [[ -f "$STATUS_FILE" ]]; do
            char="${SPIN_CHARS:SPIN_IDX:1}"
            SPIN_IDX=$(( (SPIN_IDX + 1) % ${#SPIN_CHARS} ))
            status=$(cat "$STATUS_FILE" 2>/dev/null || echo "building...")
            printf "\r  ${CYAN}%s${NC} %s" "$char" "$status" >&2
            sleep 0.1
        done
    ) &
    SPINNER_PID=$!

    # Run build piping output to log, update status on interesting lines
    pnpm tauri build 2>&1 | while IFS= read -r line; do
        echo "$line" >> "$BUILD_LOG"
        if [[ "$line" =~ Compiling[[:space:]]+([^ ]+) ]]; then
            echo "Compiling ${BASH_REMATCH[1]}..." > "$STATUS_FILE"
        elif [[ "$line" =~ Bundling[[:space:]]+(.+) ]]; then
            echo "Bundling ${BASH_REMATCH[1]}" > "$STATUS_FILE"
        elif [[ "$line" =~ Finished ]]; then
            echo "Build finished, bundling..." > "$STATUS_FILE"
        fi
    done || true

    # Stop spinner
    rm -f "$STATUS_FILE"
    wait "$SPINNER_PID" 2>/dev/null || true
    printf "\r\033[K" >&2

    # Show last few lines if build had issues
    if [[ ! -f "$SCRIPT_DIR/target/release/subby" ]]; then
        echo ""
        print_error "Build output (last 20 lines):"
        tail -20 "$BUILD_LOG"
    fi
    rm -f "$BUILD_LOG"
fi

# Install locally — no sudo needed
RELEASE_DIR="$SCRIPT_DIR/target/release"

if [[ "$DRY_RUN" != "true" && ! -f "$RELEASE_DIR/subby" ]]; then
    print_error "Build failed — no binary found at $RELEASE_DIR/subby"
    exit 1
fi
print_success "Build complete"
ICON_SRC="$SCRIPT_DIR/src-tauri/icons/128x128.png"

echo ""
print_step "Installing to ~/.local (no sudo needed)..."
print_info "Binary:  ~/.local/bin/subby"
print_info "Desktop: ~/.local/share/applications/subby.desktop"
print_info "Icon:    ~/.local/share/icons/hicolor/128x128/apps/subby.png"
echo ""

if [[ "$DRY_RUN" == "true" ]]; then
    print_dry "Would copy binary to ~/.local/bin/subby"
    print_dry "Would create desktop entry"
    print_dry "Would install icon"
else
    # Binary
    mkdir -p "$HOME/.local/bin"
    cp "$RELEASE_DIR/subby" "$HOME/.local/bin/subby"
    chmod +x "$HOME/.local/bin/subby"
    print_success "Binary installed"

    # Icon
    ICON_DIR="$HOME/.local/share/icons/hicolor/128x128/apps"
    mkdir -p "$ICON_DIR"
    cp "$ICON_SRC" "$ICON_DIR/subby.png"
    print_success "Icon installed"

    # Desktop entry
    mkdir -p "$HOME/.local/share/applications"
    cat > "$HOME/.local/share/applications/subby.desktop" << EOF
[Desktop Entry]
Name=Subby
Comment=Know where your money flows
Exec=$HOME/.local/bin/subby
Icon=subby
Terminal=false
Type=Application
Categories=Finance;Office;
EOF
    print_success "Desktop entry created"

    # Update icon cache if available
    if command -v gtk-update-icon-cache &>/dev/null; then
        gtk-update-icon-cache -f -t "$HOME/.local/share/icons/hicolor" 2>/dev/null || true
    fi

    # Check PATH
    if [[ ":$PATH:" != *":$HOME/.local/bin:"* ]]; then
        echo ""
        print_warning "~/.local/bin is not in your PATH"
        print_info "Add this to your shell config (~/.bashrc or ~/.zshrc):"
        print_info "  export PATH=\"\$HOME/.local/bin:\$PATH\""
    fi
fi

echo ""
print_success "Subby desktop app installed!"

# ============================================================================
# Done!
# ============================================================================
echo ""
echo -e "${GREEN}${BOLD}╔═══════════════════════════════════════════════════════════╗${NC}"
if [[ "$DRY_RUN" == "true" ]]; then
    echo -e "${GREEN}${BOLD}║              Dry Run Complete!                            ║${NC}"
else
    echo -e "${GREEN}${BOLD}║              Installation Complete!                       ║${NC}"
fi
echo -e "${GREEN}${BOLD}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "  ${GREEN}✓${NC} Subby desktop app"
if [[ "$DRY_RUN" == "false" ]]; then
    echo "    Launch from your app menu or run: subby"
fi

echo ""
if [[ "$DRY_RUN" == "true" ]]; then
    echo "Run without --dry-run to actually install."
else
    echo "To uninstall: ./uninstall.sh"
fi
echo ""
