#!/usr/bin/env bash
# Make script exit on first error
set -e

echo "Starting build process..."

# Create cache directory with appropriate permissions
echo "Setting up cache directories..."
mkdir -p ~/.cache
chmod -R 777 ~/.cache

# Install Node.js dependencies
echo "Installing Node.js dependencies..."
npm install

# Explicitly install Chrome browser for Puppeteer 24.4.0
echo "Installing Chrome browser for Puppeteer..."
npx puppeteer browsers install chrome

