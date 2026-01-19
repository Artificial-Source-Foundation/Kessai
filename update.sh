#!/bin/bash
# Build and install Subby
set -e

echo "Building Subby..."
pnpm tauri build

echo "Installing..."
sudo dpkg -i src-tauri/target/release/bundle/deb/Subby_0.1.0_amd64.deb

echo "Done! Subby is updated."
