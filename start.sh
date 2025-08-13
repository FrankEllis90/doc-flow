#!/bin/bash

echo "================================================"
echo "   PeppercornAI Knowledge Base Builder"
echo "================================================"
echo ""

echo "Checking if Node.js is installed..."
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed or not in PATH"
    echo "Please install Node.js from https://nodejs.org/"
    echo "Or install via Homebrew: brew install node"
    exit 1
fi

echo "Node.js version:"
node --version
echo ""

echo "Checking if npm is available..."
if ! command -v npm &> /dev/null; then
    echo "ERROR: npm is not available"
    exit 1
fi

echo "npm version:"
npm --version
echo ""

echo "Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install dependencies"
    exit 1
fi

echo ""
echo "Dependencies installed successfully!"
echo ""
echo "Starting development server..."
echo ""
echo "The application will be available at: http://localhost:3000 (or next available port)"
echo "Press Ctrl+C to stop the server"
echo ""

npm run dev