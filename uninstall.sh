#!/usr/bin/env bash
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

print_step() { echo -e "${BLUE}==>${NC} $1"; }
print_success() { echo -e "${GREEN}✓${NC} $1"; }
print_warning() { echo -e "${YELLOW}!${NC} $1"; }

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
echo -e "${RED}${BOLD}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${RED}${BOLD}║                 Subby Uninstaller                         ║${NC}"
echo -e "${RED}${BOLD}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${BOLD}What would you like to uninstall?${NC}"
echo ""
echo "  1) Subby desktop app only"
echo "  2) Discord bot only"
echo "  3) Everything (app + bot)"
echo "  4) Cancel"
echo ""
read -p "Choose [1-4]: " -n 1 -r UNINSTALL_CHOICE
echo ""

UNINSTALL_APP=false
UNINSTALL_BOT=false

case $UNINSTALL_CHOICE in
    1) UNINSTALL_APP=true ;;
    2) UNINSTALL_BOT=true ;;
    3) UNINSTALL_APP=true; UNINSTALL_BOT=true ;;
    4) echo "Cancelled."; exit 0 ;;
    *) echo "Invalid choice"; exit 1 ;;
esac

# Uninstall desktop app
if [[ "$UNINSTALL_APP" == "true" ]]; then
    print_step "Uninstalling Subby desktop app..."

    # Try package manager first
    if [[ "$DISTRO" == "ubuntu" || "$DISTRO" == "debian" || "$DISTRO" == "pop" || "$DISTRO" == "linuxmint" ]]; then
        if dpkg -l | grep -q "subby"; then
            sudo dpkg -r subby 2>/dev/null || true
            print_success "Removed via dpkg"
        fi
    elif [[ "$DISTRO" == "fedora" || "$DISTRO" == "rhel" || "$DISTRO" == "centos" ]]; then
        if rpm -qa | grep -q "subby"; then
            sudo rpm -e subby 2>/dev/null || true
            print_success "Removed via rpm"
        fi
    fi

    # Remove AppImage if exists
    if [[ -f "$HOME/.local/bin/subby" ]]; then
        rm -f "$HOME/.local/bin/subby"
        print_success "Removed AppImage"
    fi

    # Remove desktop entry
    rm -f "$HOME/.local/share/applications/subby.desktop" 2>/dev/null || true

    # Ask about data
    DATA_DIR="$HOME/.local/share/subby"
    if [[ -d "$DATA_DIR" ]]; then
        echo ""
        print_warning "Found Subby data at $DATA_DIR"
        read -p "Delete your subscription data? [y/N] " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            rm -rf "$DATA_DIR"
            print_success "Data deleted"
        else
            print_warning "Data kept at $DATA_DIR"
        fi
    fi

    print_success "Subby desktop app uninstalled"
fi

# Uninstall bot
if [[ "$UNINSTALL_BOT" == "true" ]]; then
    BOT_UNINSTALLER="$SCRIPT_DIR/packages/discord-bot/uninstall.sh"
    if [[ -f "$BOT_UNINSTALLER" ]]; then
        "$BOT_UNINSTALLER"
    else
        print_warning "Bot uninstaller not found, removing manually..."
        sudo systemctl stop "subby-bot@$USER" 2>/dev/null || true
        sudo systemctl disable "subby-bot@$USER" 2>/dev/null || true
        sudo rm -f /etc/systemd/system/subby-bot@.service
        sudo rm -f /usr/local/bin/subby-bot
        sudo systemctl daemon-reload
        print_success "Discord bot uninstalled"
    fi
fi

echo ""
print_success "Uninstallation complete!"
echo ""
