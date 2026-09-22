#!/usr/bin/env bash
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "========================================"
echo "  NILE FOOD - LOCK THIS MAC'S LAN IP"
echo "========================================"
echo ""
echo "The reason the system 'works one day and not the next' is that your"
echo "Mac gets a DIFFERENT IP address from the router/phone each time it"
echo "reconnects (DHCP). This script gives the Mac a FIXED IP so the URL"
echo "http://<ip>:5002 always works."
echo ""

if [ "$(uname)" != "Darwin" ]; then
  echo -e "${RED}This script is only for macOS.${NC}"
  echo "On other OSes, reserve a static IP for this machine in your router's DHCP settings instead."
  echo "Alternative for all OSes: use the stable 'http://<hostname>.local:5002' URL shown at startup."
  exit 1
fi

# Find the active interface (the one with a default route)
ACTIVE_IF="$(route -n get default 2>/dev/null | awk '/interface:/{print $2}')"
if [ -z "$ACTIVE_IF" ]; then
  echo -e "${RED}Could not find the active network interface. Are you connected to a network?${NC}"
  exit 1
fi

# Map device -> macOS network service name
SERVICE="$(networksetup -listnetworkserviceorder 2>/dev/null | awk -v dev="$ACTIVE_IF" '
  /^\([0-9]+\)/ {svc=$0; sub(/^\([0-9]+\) /, "", svc); gsub(/,$/, "", svc); name=svc}
  /Device: / && $0 ~ dev {print name; exit}
')"
if [ -z "$SERVICE" ]; then
  echo -e "${RED}Could not find a network service for interface $ACTIVE_IF. Run 'networksetup -listallhardwareports' to see yours.${NC}"
  exit 1
fi

CURRENT_IP="$(ipconfig getifaddr "$ACTIVE_IF" 2>/dev/null || true)"
ROUTER="$(ipconfig getoption "$ACTIVE_IF" router 2>/dev/null || true)"
MASK="$(ipconfig getoption "$ACTIVE_IF" subnet_mask 2>/dev/null)"
MASK="${MASK:-255.255.255.0}"
MAC="$(networksetup -getmacaddress "$SERVICE" 2>/dev/null | awk '{print $3}')"

echo -e "Interface:        ${GREEN}$ACTIVE_IF${NC}"
echo -e "Network service:  ${GREEN}$SERVICE${NC}"
echo -e "Current IP:       ${GREEN}${CURRENT_IP:-unknown}${NC}"
echo -e "Router (gateway): ${GREEN}${ROUTER:-unknown}${NC}"
echo -e "MAC address:      ${GREEN}${MAC:-unknown}${NC}"
echo ""

if [ -n "$CURRENT_IP" ] && [ -n "$ROUTER" ] && [ -n "$MASK" ]; then
  echo "Recommended fixed IP (your current one, so nothing breaks): $CURRENT_IP"
else
  echo -e "${RED}Could not read current DHCP settings — cannot safely choose a static IP itself.${NC}"
  CURRENT_IP=""
fi

if [ -z "$CURRENT_IP" ] || [ -z "$ROUTER" ] || [ -z "$MASK" ]; then
  echo -e "${YELLOW}Please provide the values manually:${NC}"
  [ -n "$CURRENT_IP" ] || read -r -p "Static IP (e.g. 192.168.4.100): " CURRENT_IP
  [ -n "$MASK" ] || read -r -p "Subnet mask (e.g. 255.255.255.0): " MASK
  [ -n "$ROUTER" ] || read -r -p "Router IP (e.g. 192.168.4.1): " ROUTER
fi

echo ""
echo -e "${YELLOW}This will set:${NC}"
echo "  IP:     $CURRENT_IP"
echo "  Mask:   $MASK"
echo "  Router: $ROUTER"
echo ""
read -r -p "Apply this static IP now? [y/N] " ANSWER
if [ "$ANSWER" != "y" ] && [ "$ANSWER" != "Y" ]; then
  echo "Nothing changed. You can instead reserve a static IP in your router:"
  echo "  DHCP reservation for MAC $MAC -> $CURRENT_IP"
  exit 0
fi

sudo networksetup -setmanual "$SERVICE" "$CURRENT_IP" "$MASK" "$ROUTER"
echo ""
echo -e "${GREEN}✓ Static IP applied.${NC}"
echo -e "  URL: http://${CURRENT_IP}:5002  and  admin at http://${CURRENT_IP}:5002/admin"
echo ""
echo "Notes:"
echo "  - This IP will now stay the same, even after reboots."
echo "  - If you change WiFi networks, run this script again."
echo "  - To go back to automatic DHCP:"
echo "      sudo networksetup -setdhcp \"$SERVICE\""