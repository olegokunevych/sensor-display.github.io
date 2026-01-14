#!/bin/bash

# Build script to replace environment variables in app.js

if [ -z "$FIREBASE_URL" ]; then
    echo "Error: FIREBASE_URL environment variable not set"
    exit 1
fi

# Create build directory
mkdir -p build
cp -r *.html *.css *.json sw.js icons build/

# Replace FIREBASE_URL in app.js
sed "s|FIREBASE_URL_PLACEHOLDER|$FIREBASE_URL|g" app.js > build/app.js

echo "✅ Build complete! Files in build/"
echo "   FIREBASE_URL: $FIREBASE_URL"
