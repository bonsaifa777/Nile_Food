#!/usr/bin/env bash
set -e

echo "========================================"
echo "  NILE FOOD - macOS Firewall Setup"
echo "========================================"
echo ""

if [ "$(uname)" != "Darwin" ]; then
  echo "Not macOS. Skipping firewall setup."
  exit 0
fi

echo "This script allows Node.js through the macOS firewall"
echo "so other devices on the hotspot/LAN can connect."
echo ""

NODE_PATH="$(which node)"
echo "Node path: $NODE_PATH"
echo ""

echo "You may be prompted for your password (sudo)."
echo ""

sudo /usr/libexec/ApplicationFirewall/socketfilterfw \
  --add "$NODE_PATH" --allow 2>&1 || true

echo ""
echo "Also adding the current Node process via full path..."

# Also add via realpath if available
if command -v realpath &>/dev/null; then
  REAL_NODE=$(realpath "$NODE_PATH")
  if [ "$REAL_NODE" != "$NODE_PATH" ]; then
    sudo /usr/libexec/ApplicationFirewall/socketfilterfw \
      --add "$REAL_NODE" --allow 2>&1 || true
  fi
fi

echo ""
echo "Current firewall state:"
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate 2>&1 || true

echo ""
echo "Done. Try starting the server now."
echo "If it still doesn't work, check:"
echo "  System Settings → Network → Firewall → Options"
echo "  Make sure 'node' or 'Visual Studio Code' (if running from VS Code terminal) is set to 'Allow incoming connections'"
