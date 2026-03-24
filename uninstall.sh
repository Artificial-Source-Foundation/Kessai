#!/usr/bin/env bash
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
DIM='\033[2m'
NC='\033[0m'

print_step() { echo -e "${BLUE}==>${NC} $1"; }
print_success() { echo -e "${GREEN}✓${NC} $1"; }
print_warning() { echo -e "${YELLOW}!${NC} $1"; }
print_info() { echo -e "  ${DIM}$1${NC}"; }
print_error() { echo -e "${RED}✗${NC} $1"; }
print_none() { echo -e "  ${DIM}-${NC} $1"; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Default options
UNINSTALL_APP=false
INTERACTIVE=true

# ============================================================================
# Help
# ============================================================================
show_help() {
    cat << EOF
${BOLD}Subby Uninstaller${NC}

${BOLD}USAGE:${NC}
    ./uninstall.sh [OPTIONS]

${BOLD}OPTIONS:${NC}
    -h, --help          Show this help message
    --app               Uninstall desktop app (non-interactive)
    --purge             Also delete app data (combine with --app)

${BOLD}EXAMPLES:${NC}
    ./uninstall.sh                  # Interactive mode
    ./uninstall.sh --app            # Remove the desktop app
    ./uninstall.sh --app --purge    # Remove app and all data

EOF
}

# ============================================================================
# Parse arguments
# ============================================================================
PURGE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        --app)
            UNINSTALL_APP=true
            INTERACTIVE=false
            shift
            ;;
        --purge)
            PURGE=true
            shift
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Run './uninstall.sh --help' for usage."
            exit 1
            ;;
    esac
done

# ============================================================================
# Detect what's installed
# ============================================================================
APP_INSTALLED=false
DATA_EXISTS=false

# App: check local install and legacy system installs
[[ -f "$HOME/.local/bin/subby" ]] && APP_INSTALLED=true
dpkg -s subby &>/dev/null 2>&1 && APP_INSTALLED=true
rpm -q subby &>/dev/null 2>&1 && APP_INSTALLED=true

# Data
[[ -d "$HOME/.local/share/subby" ]] && DATA_EXISTS=true

# ============================================================================
# Banner
# ============================================================================
echo ""
echo -e "${RED}${BOLD}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${RED}${BOLD}║                 Subby Uninstaller                         ║${NC}"
echo -e "${RED}${BOLD}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Show what's detected
echo -e "${BOLD}Detected:${NC}"
if [[ "$APP_INSTALLED" == "true" ]]; then
    echo -e "  ${GREEN}●${NC} Desktop app installed"
else
    echo -e "  ${DIM}○ Desktop app not found${NC}"
fi
if [[ "$DATA_EXISTS" == "true" ]]; then
    echo -e "  ${GREEN}●${NC} App data exists (~/.local/share/subby)"
else
    echo -e "  ${DIM}○ No app data${NC}"
fi
echo ""

# Nothing installed at all
if [[ "$APP_INSTALLED" == "false" && "$DATA_EXISTS" == "false" ]]; then
    print_info "Nothing to uninstall."
    echo ""
    exit 0
fi

# ============================================================================
# Interactive menu
# ============================================================================
if [[ "$INTERACTIVE" == "true" ]]; then
    if [[ "$APP_INSTALLED" == "true" ]]; then
        echo -e "${BOLD}Uninstall Subby desktop app?${NC}"
        echo ""
        read -p "Proceed? [y/N] " -n 1 -r CHOICE
        echo ""
        case $CHOICE in
            [Yy]) UNINSTALL_APP=true ;;
            *) echo "Cancelled."; exit 0 ;;
        esac
    elif [[ "$DATA_EXISTS" == "true" ]]; then
        # Only leftover data, no app
        echo "  Only leftover app data was found."
        echo ""
        read -p "Delete app data at ~/.local/share/subby? [y/N] " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            rm -rf "$HOME/.local/share/subby"
            print_success "Data deleted"
        else
            print_warning "Data kept"
        fi
        echo ""
        exit 0
    fi
fi

# Track what we actually removed for the summary
REMOVED_APP=false
REMOVED_DATA=false

# ============================================================================
# Uninstall desktop app
# ============================================================================
if [[ "$UNINSTALL_APP" == "true" ]]; then
    echo ""
    print_step "Uninstalling Subby desktop app..."

    FOUND_SOMETHING=false

    # Remove local install
    if [[ -f "$HOME/.local/bin/subby" ]]; then
        rm -f "$HOME/.local/bin/subby"
        print_success "Removed binary (~/.local/bin/subby)"
        FOUND_SOMETHING=true
    fi

    if [[ -f "$HOME/.local/share/applications/subby.desktop" ]]; then
        rm -f "$HOME/.local/share/applications/subby.desktop"
        print_success "Removed desktop entry"
        FOUND_SOMETHING=true
    fi

    if [[ -f "$HOME/.local/share/icons/hicolor/128x128/apps/subby.png" ]]; then
        rm -f "$HOME/.local/share/icons/hicolor/128x128/apps/subby.png"
        if command -v gtk-update-icon-cache &>/dev/null; then
            gtk-update-icon-cache -f -t "$HOME/.local/share/icons/hicolor" 2>/dev/null || true
        fi
        print_success "Removed icon"
        FOUND_SOMETHING=true
    fi

    # Clean up legacy system-wide installs
    DISTRO="unknown"
    [[ -f /etc/os-release ]] && . /etc/os-release && DISTRO="$ID"

    if [[ "$DISTRO" == "ubuntu" || "$DISTRO" == "debian" || "$DISTRO" == "pop" || "$DISTRO" == "linuxmint" ]]; then
        if dpkg -s subby &>/dev/null; then
            print_warning "Found legacy system-wide install — removing (needs sudo)"
            sudo dpkg -r subby 2>/dev/null || true
            print_success "Removed via dpkg"
            FOUND_SOMETHING=true
        fi
    elif [[ "$DISTRO" == "fedora" || "$DISTRO" == "rhel" || "$DISTRO" == "centos" ]]; then
        if rpm -q subby &>/dev/null; then
            print_warning "Found legacy system-wide install — removing (needs sudo)"
            sudo rpm -e subby 2>/dev/null || true
            print_success "Removed via rpm"
            FOUND_SOMETHING=true
        fi
    fi

    if [[ -f "/usr/share/applications/subby.desktop" ]]; then
        sudo rm -f "/usr/share/applications/subby.desktop" 2>/dev/null || true
        FOUND_SOMETHING=true
    fi

    if [[ "$FOUND_SOMETHING" == "false" ]]; then
        print_none "Desktop app was not installed — nothing to remove"
    else
        REMOVED_APP=true
    fi

    # Handle app data
    if [[ -d "$HOME/.local/share/subby" ]]; then
        echo ""
        if [[ "$PURGE" == "true" ]]; then
            rm -rf "$HOME/.local/share/subby"
            print_success "App data deleted"
            REMOVED_DATA=true
        elif [[ "$INTERACTIVE" == "true" ]]; then
            print_warning "App data found at ~/.local/share/subby"
            print_info "This contains your subscriptions database."
            read -p "Delete your subscription data? [y/N] " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                rm -rf "$HOME/.local/share/subby"
                print_success "App data deleted"
                REMOVED_DATA=true
            else
                print_info "Data kept at ~/.local/share/subby"
            fi
        else
            print_info "App data kept at ~/.local/share/subby (use --purge to delete)"
        fi
    fi
fi

# ============================================================================
# Summary
# ============================================================================
echo ""
echo -e "${GREEN}${BOLD}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}${BOLD}║              Uninstallation Complete                      ║${NC}"
echo -e "${GREEN}${BOLD}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

if [[ "$REMOVED_APP" == "true" ]]; then
    echo -e "  ${GREEN}✓${NC} Desktop app removed"
fi
if [[ "$REMOVED_DATA" == "true" ]]; then
    echo -e "  ${GREEN}✓${NC} App data deleted"
fi
if [[ "$REMOVED_APP" == "false" && "$REMOVED_DATA" == "false" ]]; then
    echo -e "  ${DIM}Nothing was removed${NC}"
fi

if [[ -d "$HOME/.local/share/subby" ]]; then
    echo ""
    print_info "Note: App data still exists at ~/.local/share/subby"
fi

echo ""
