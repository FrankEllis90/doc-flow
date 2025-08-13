#!/bin/bash

# Ragara Desktop App Launcher Script for Linux/WSL
# This script ensures proper startup of both Vite dev server and Electron

echo "🚀 Starting Ragara Desktop Application..."

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        return 0
    else
        return 1
    fi
}

# Function to kill process on port
kill_port() {
    local port=$1
    local pid=$(lsof -t -i:$port)
    if [ ! -z "$pid" ]; then
        echo -e "${YELLOW}Killing process on port $port (PID: $pid)${NC}"
        kill -9 $pid 2>/dev/null
        sleep 1
    fi
}

# Clean up function
cleanup() {
    echo -e "\n${YELLOW}Shutting down Ragara Desktop...${NC}"
    
    # Kill Vite server
    if [ ! -z "$VITE_PID" ]; then
        kill $VITE_PID 2>/dev/null
    fi
    
    # Kill Electron
    if [ ! -z "$ELECTRON_PID" ]; then
        kill $ELECTRON_PID 2>/dev/null
    fi
    
    # Kill any remaining processes on port 3002
    kill_port 3002
    
    echo -e "${GREEN}✓ Ragara Desktop shutdown complete${NC}"
    exit 0
}

# Trap CTRL+C to cleanup properly
trap cleanup INT TERM

# Check Node.js and npm
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js is not installed!${NC}"
    echo "Please install Node.js version 16 or higher"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}✗ npm is not installed!${NC}"
    echo "Please install npm"
    exit 1
fi

# Display versions
echo -e "${GREEN}Node.js version:${NC} $(node --version)"
echo -e "${GREEN}npm version:${NC} $(npm --version)"

# Check if port 3002 is already in use
if check_port 3002; then
    echo -e "${YELLOW}Port 3002 is already in use${NC}"
    read -p "Kill existing process and continue? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        kill_port 3002
    else
        echo -e "${RED}Exiting...${NC}"
        exit 1
    fi
fi

# Clear Vite cache
echo -e "${YELLOW}Clearing Vite cache...${NC}"
rm -rf node_modules/.vite 2>/dev/null
rm -rf dist 2>/dev/null

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install
fi

# Build Electron files if needed
if [ ! -f "dist-electron/main.cjs" ]; then
    echo -e "${YELLOW}Building Electron files...${NC}"
    npm run build
fi

# Start Vite dev server in background
echo -e "${GREEN}Starting Vite development server...${NC}"
npm run dev &
VITE_PID=$!

# Wait for Vite to be ready
echo -e "${YELLOW}Waiting for Vite server to start...${NC}"
COUNTER=0
MAX_TRIES=30

while ! check_port 3002; do
    sleep 1
    COUNTER=$((COUNTER + 1))
    
    if [ $COUNTER -ge $MAX_TRIES ]; then
        echo -e "${RED}✗ Vite server failed to start after 30 seconds${NC}"
        kill $VITE_PID 2>/dev/null
        exit 1
    fi
    
    echo -n "."
done

echo -e "\n${GREEN}✓ Vite server is running on http://localhost:3002${NC}"

# Small delay to ensure Vite is fully ready
sleep 2

# Start Electron
echo -e "${GREEN}Launching Electron desktop app...${NC}"

# Check for Electron executable
if [ -f "node_modules/.bin/electron" ]; then
    node_modules/.bin/electron dist-electron/main.cjs &
    ELECTRON_PID=$!
elif command -v npx &> /dev/null; then
    npx electron dist-electron/main.cjs &
    ELECTRON_PID=$!
else
    echo -e "${RED}✗ Could not find Electron executable${NC}"
    kill $VITE_PID 2>/dev/null
    exit 1
fi

echo -e "${GREEN}✓ Ragara Desktop is running!${NC}"
echo -e "${YELLOW}Press CTRL+C to stop the application${NC}"

# Monitor processes
while true; do
    # Check if Vite is still running
    if ! kill -0 $VITE_PID 2>/dev/null; then
        echo -e "${RED}Vite server has stopped unexpectedly${NC}"
        cleanup
    fi
    
    # Check if Electron is still running
    if ! kill -0 $ELECTRON_PID 2>/dev/null; then
        echo -e "${YELLOW}Electron app was closed${NC}"
        cleanup
    fi
    
    sleep 2
done