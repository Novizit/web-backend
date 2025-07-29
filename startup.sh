#!/bin/bash

# Go to app directory (this is where Azure deploys your code).
cd /home/site/wwwroot

# Install dependencies
echo "Installing Node.js dependencies..."
npm install --omit=dev

# Start the Node.js app
echo "Starting Node.js app..."
npm start