#!/bin/bash

# Simple script to generate PWA icons from an SVG or PNG source
# Requires ImageMagick: brew install imagemagick

if [ -z "$1" ]; then
    echo "Usage: ./generate-icons.sh <source-image.png|svg>"
    echo "Example: ./generate-icons.sh logo.png"
    exit 1
fi

SOURCE=$1

echo "Generating PWA icons from $SOURCE..."

# Create icons directory if it doesn't exist
mkdir -p icons

# Generate different sizes
convert "$SOURCE" -resize 192x192 icons/icon-192.png
convert "$SOURCE" -resize 512x512 icons/icon-512.png
convert "$SOURCE" -resize 180x180 icons/apple-touch-icon.png

echo "✅ Icons generated successfully!"
echo "  - icons/icon-192.png"
echo "  - icons/icon-512.png"
echo "  - icons/apple-touch-icon.png"
