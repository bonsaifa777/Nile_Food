#!/usr/bin/env bash
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$DIR/server"

if [ ! -f .env.lan ]; then
  echo -e "${RED}Error: .env.lan not found. Run 'scripts/lan-setup.sh' first.${NC}"
  exit 1
fi

if [ ! -d "$DIR/client/dist" ] || [ ! -d "$DIR/admin/dist" ]; then
  echo -e "${RED}Error: Build files not found. Run 'scripts/lan-setup.sh' first.${NC}"
  exit 1
fi

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}  NILE FOOD - STARTING LAN MODE${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""

exec node index.js
