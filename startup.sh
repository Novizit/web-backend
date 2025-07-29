#!/bin/bash

# Install dependencies
echo "Installing Node.js dependencies..."
npm install --omit=dev

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Start the application
echo "Starting application..."
npm start