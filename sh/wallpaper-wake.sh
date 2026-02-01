#!/bin/bash

# Log file (commented out for now)
# LOG_FILE="$HOME/wallpaper-wake.log"

# echo "===== $(date) =====" >> "$LOG_FILE"
# echo "Wake script started" >> "$LOG_FILE"

# Folder for wallpapers
WALLPAPER_DIR="$HOME/Pictures/SpotlightWallpapers"
mkdir -p "$WALLPAPER_DIR"

# Image list
# Get a random image from your Vercel API
IMAGE_URL="https://wallpaper-sh.vercel.app/api/wallpaper"

# echo "Selected image URL: $IMAGE_URL" >> "$LOG_FILE"

# Remove old wallpapers
rm -f "$WALLPAPER_DIR"/*
# echo "Cleared old wallpapers" >> "$LOG_FILE"

# Download new wallpaper
FILENAME="$WALLPAPER_DIR/wallpaper-$(date +%s).jpg"
curl -s -L -o "$FILENAME" "$IMAGE_URL"
# echo "Downloaded new wallpaper: $FILENAME" >> "$LOG_FILE"

# Set wallpaper on all monitors
osascript <<EOD
tell application "System Events"
  repeat with d in desktops
    set picture of d to "$FILENAME"
  end repeat
end tell
EOD

# echo "Wallpaper updated! Saved as $FILENAME" >> "$LOG_FILE"
# echo "Wake script finished" >> "$LOG_FILE"
