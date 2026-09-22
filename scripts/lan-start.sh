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
  echo -e "${YELLOW}Build files missing — building frontend apps first...${NC}"
  bash "$DIR/scripts/lan-build.sh"
fi

# --- Detect a stable, always-working URL (works even when the IP changes) ---
HOSTNAME="$(node -e "let h=process.env.LAN_HOSTNAME||require('os').hostname();h=h.trim().toLowerCase();if(!h.endsWith('.local'))h=h+'.local';console.log(h)")"
PORT="$(grep -E '^PORT=' .env.lan | cut -d= -f2-)"
PORT="${PORT:-5002}"

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}  NILE FOOD - STARTING LAN MODE${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""

# --- Make sure MongoDB is running before starting ---
if command -v nc &>/dev/null; then
  if ! nc -z localhost 27017 >/dev/null 2>&1; then
    echo -e "${YELLOW}[check] MongoDB is not responding on port 27017.${NC}"
    if command -v brew &>/dev/null && brew services list 2>/dev/null | grep -qi 'mongo'; then
      echo -e "${YELLOW}[fix]   Starting MongoDB via Homebrew...${NC}"
      brew services start mongodb-community@8.0 >/dev/null 2>&1 || brew services start mongodb-community >/dev/null 2>&1 || true
    fi
    echo -e "${YELLOW}[wait]  Waiting up to 20s for MongoDB...${NC}"
    for i in $(seq 1 20); do
      if nc -z localhost 27017 >/dev/null 2>&1; then
        break
      fi
      sleep 1
    done
  fi
  if ! nc -z localhost 27017 >/dev/null 2>&1; then
    echo -e "${RED}[error] MongoDB did not start. Run this first:${NC}"
    echo -e "  ${GREEN}brew services start mongodb-community@8.0${NC}"
    echo -e "  ${GREEN}mongod --config /usr/local/etc/mongod.conf${NC}"
    read -r -p "MongoDB is not running. Start the server anyway? [y/N] " ANSWER
    if [ "$ANSWER" != "y" ] && [ "$ANSWER" != "Y" ]; then
      exit 1
    fi
  fi
fi

echo -e "  Open this on any device on the network:"
echo -e ""
echo -e "    ${GREEN}http://${HOSTNAME}:${PORT}${NC}   (stable — keeps working even when the IP changes)"
echo -e ""
echo -e "  Admin panel:"
echo -e "    ${GREEN}http://${HOSTNAME}:${PORT}/admin${NC}"
echo -e ""
echo "  (If the .local address is blocked by the network, use the 'Network:'"
echo "  IP printed below — but note that IP can change day to day. For a truly"
echo "  permanent address, run 'scripts/lan-static-ip.sh' to lock this Mac's IP.)"
echo ""

echo -e "${GREEN}Starting server...${NC}"
echo ""

exec node index.js