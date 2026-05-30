#!/usr/bin/env bash
set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo -e "${YELLOW}Building client app...${NC}"
cd "$DIR/client"
VITE_LAN_MODE=true npx vite build
echo -e "${GREEN}  ✓ Client app built${NC}"

echo -e "${YELLOW}Building admin app...${NC}"
cd "$DIR/admin"
ADMIN_BASE_URL=/admin/ VITE_LAN_MODE=true npx vite build
echo -e "${GREEN}  ✓ Admin app built${NC}"

echo -e "${GREEN}Done. Run 'scripts/lan-start.sh' to start the server.${NC}"
