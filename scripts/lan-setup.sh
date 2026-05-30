#!/usr/bin/env bash
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}  NILE FOOD - OFFLINE LAN MODE SETUP${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""

DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$DIR"

# Check prerequisites
check_command() {
  if ! command -v "$1" &> /dev/null; then
    echo -e "${RED}Error: '$1' is not installed. Please install it first.${NC}"
    exit 1
  fi
}

echo -e "${YELLOW}[1/6] Checking prerequisites...${NC}"
check_command node
check_command npm

NODE_VER=$(node -v)
NPM_VER=$(npm -v)
echo -e "${GREEN}  ✓ Node.js ${NODE_VER}${NC}"
echo -e "${GREEN}  ✓ npm ${NPM_VER}${NC}"

# Install dependencies
echo ""
echo -e "${YELLOW}[2/6] Installing server dependencies...${NC}"
cd "$DIR/server"
npm install --omit=dev
echo -e "${GREEN}  ✓ Server dependencies installed${NC}"

echo ""
echo -e "${YELLOW}[3/6] Installing client dependencies...${NC}"
cd "$DIR/client"
npm install
echo -e "${GREEN}  ✓ Client dependencies installed${NC}"

echo ""
echo -e "${YELLOW}[4/6] Installing admin dependencies...${NC}"
cd "$DIR/admin"
npm install
echo -e "${GREEN}  ✓ Admin dependencies installed${NC}"

# Build client
echo ""
echo -e "${YELLOW}[5/6] Building frontend apps...${NC}"
cd "$DIR/client"
VITE_LAN_MODE=true npx vite build
echo -e "${GREEN}  ✓ Client app built${NC}"

cd "$DIR/admin"
ADMIN_BASE_URL=/admin/ VITE_LAN_MODE=true npx vite build
echo -e "${GREEN}  ✓ Admin app built${NC}"

# Seed database
echo ""
echo -e "${YELLOW}[6/6] Seeding database...${NC}"
cd "$DIR/server"
npm run seed
echo -e "${GREEN}  ✓ Database seeded${NC}"

echo ""
echo -e "${CYAN}========================================${NC}"
echo -e "${GREEN}  Setup complete! Starting server...${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""

# Start server
exec node index.js
