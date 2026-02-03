#!/usr/bin/env bash
set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

print_step() { echo -e "${BLUE}==>${NC} $1"; }
print_success() { echo -e "${GREEN}✓${NC} $1"; }
print_warning() { echo -e "${YELLOW}!${NC} $1"; }
print_error() { echo -e "${RED}✗${NC} $1"; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Detect distro
detect_distro() {
    if [[ -f /etc/os-release ]]; then
        . /etc/os-release
        echo "$ID"
    else
        echo "unknown"
    fi
}

DISTRO=$(detect_distro)

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

# Check prerequisites
print_step "Checking prerequisites..."

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

# Check for Tauri Linux dependencies
if [[ "$DISTRO" == "ubuntu" || "$DISTRO" == "debian" || "$DISTRO" == "pop" || "$DISTRO" == "linuxmint" ]]; then
    TAURI_DEPS="libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf"
    MISSING_TAURI_DEPS=()
    for dep in $TAURI_DEPS; do
        if ! dpkg -l | grep -q "^ii  $dep"; then
            MISSING_TAURI_DEPS+=("$dep")
        fi
    done
    if [[ ${#MISSING_TAURI_DEPS[@]} -gt 0 ]]; then
        print_warning "Missing Tauri dependencies: ${MISSING_TAURI_DEPS[*]}"
        read -p "Install them now? [Y/n] " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Nn]$ ]]; then
            sudo apt update && sudo apt install -y "${MISSING_TAURI_DEPS[@]}"
        else
            print_error "Cannot continue without Tauri dependencies"
            exit 1
        fi
    fi
fi

print_success "Prerequisites OK"

# Install pnpm dependencies
print_step "Installing dependencies..."
cd "$SCRIPT_DIR"
pnpm install
print_success "Dependencies installed"

# What to install?
echo ""
echo -e "${BOLD}What would you like to install?${NC}"
echo ""
echo "  1) Subby desktop app only"
echo "  2) Subby desktop app + Discord bot"
echo "  3) Discord bot only"
echo ""
read -p "Choose [1-3]: " -n 1 -r INSTALL_CHOICE
echo ""

INSTALL_APP=false
INSTALL_BOT=false

case $INSTALL_CHOICE in
    1) INSTALL_APP=true ;;
    2) INSTALL_APP=true; INSTALL_BOT=true ;;
    3) INSTALL_BOT=true ;;
    *) print_error "Invalid choice"; exit 1 ;;
esac

# Build and install Subby app
if [[ "$INSTALL_APP" == "true" ]]; then
    echo ""
    print_step "Building Subby desktop app..."
    pnpm tauri build 2>&1 | tail -20

    # Find the built package
    BUNDLE_DIR="$SCRIPT_DIR/src-tauri/target/release/bundle"

    if [[ "$DISTRO" == "ubuntu" || "$DISTRO" == "debian" || "$DISTRO" == "pop" || "$DISTRO" == "linuxmint" ]]; then
        DEB_FILE=$(find "$BUNDLE_DIR/deb" -name "*.deb" 2>/dev/null | head -1)
        if [[ -n "$DEB_FILE" ]]; then
            print_step "Installing .deb package..."
            sudo dpkg -i "$DEB_FILE"
            print_success "Subby installed via .deb"
        fi
    elif [[ "$DISTRO" == "fedora" || "$DISTRO" == "rhel" || "$DISTRO" == "centos" ]]; then
        RPM_FILE=$(find "$BUNDLE_DIR/rpm" -name "*.rpm" 2>/dev/null | head -1)
        if [[ -n "$RPM_FILE" ]]; then
            print_step "Installing .rpm package..."
            sudo rpm -i "$RPM_FILE"
            print_success "Subby installed via .rpm"
        fi
    else
        # Fallback to AppImage
        APPIMAGE_FILE=$(find "$BUNDLE_DIR/appimage" -name "*.AppImage" 2>/dev/null | head -1)
        if [[ -n "$APPIMAGE_FILE" ]]; then
            print_step "Installing AppImage..."
            mkdir -p "$HOME/.local/bin"
            cp "$APPIMAGE_FILE" "$HOME/.local/bin/subby"
            chmod +x "$HOME/.local/bin/subby"
            print_success "Subby installed to ~/.local/bin/subby"
            print_warning "Make sure ~/.local/bin is in your PATH"
        fi
    fi

    # Create desktop entry if not created by package
    if [[ ! -f "/usr/share/applications/subby.desktop" && ! -f "$HOME/.local/share/applications/subby.desktop" ]]; then
        print_step "Creating desktop entry..."
        mkdir -p "$HOME/.local/share/applications"
        cat > "$HOME/.local/share/applications/subby.desktop" << EOF
[Desktop Entry]
Name=Subby
Comment=Know where your money flows
Exec=subby
Icon=subby
Terminal=false
Type=Application
Categories=Finance;Office;
EOF
        print_success "Desktop entry created"
    fi

    print_success "Subby desktop app installed!"
fi

# Install Discord bot
if [[ "$INSTALL_BOT" == "true" ]]; then
    echo ""
    print_step "Setting up Discord bot..."

    # Run the bot installer
    cd "$SCRIPT_DIR/packages/discord-bot"
    ./install.sh
fi

# Done!
echo ""
echo -e "${GREEN}${BOLD}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}${BOLD}║              Installation Complete!                       ║${NC}"
echo -e "${GREEN}${BOLD}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

if [[ "$INSTALL_APP" == "true" ]]; then
    echo "  ${GREEN}✓${NC} Subby desktop app"
    echo "    Launch from your app menu or run: subby"
fi

if [[ "$INSTALL_BOT" == "true" ]]; then
    echo "  ${GREEN}✓${NC} Discord bot"
    echo "    Check status: sudo systemctl status subby-bot@$USER"
fi

echo ""
echo "To uninstall: ./uninstall.sh"
echo ""
