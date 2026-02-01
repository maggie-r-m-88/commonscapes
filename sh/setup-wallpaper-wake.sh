#!/bin/bash

echo "Setting up wallpaper wake script..."

# Get the absolute path to the script directory
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
WALLPAPER_SCRIPT="$SCRIPT_DIR/wallpaper-wake.sh"

# Make the main script executable
chmod +x "$WALLPAPER_SCRIPT"

# Create a temporary plist with correct paths
PLIST_DEST="$HOME/Library/LaunchAgents/com.user.wallpaper-wake.plist"
sed "s|/Users/maggie/Scripts/wallpaper-wake.sh|$WALLPAPER_SCRIPT|g; s|/Users/maggie|$HOME|g" \
    com.user.wallpaper-wake.plist > "$PLIST_DEST"

echo "Plist created at: $PLIST_DEST"

# Load the launch agent
launchctl unload "$PLIST_DEST" 2>/dev/null  # Unload if already loaded
launchctl load "$PLIST_DEST"

echo ""
echo "✅ Setup complete!"
echo ""
echo "The wallpaper will now change:"
echo "  - Every hour (3600 seconds)"
echo "  - When you log in"
echo ""
echo "To test it now, run: ./wallpaper-wake.sh"
echo ""
echo "To check logs:"
echo "  - Script log: ~/wallpaper-wake.log"
echo "  - System stdout: ~/wallpaper-wake-stdout.log"
echo "  - System stderr: ~/wallpaper-wake-stderr.log"
echo ""
echo "To uninstall:"
echo "  launchctl unload ~/Library/LaunchAgents/com.user.wallpaper-wake.plist"
echo "  rm ~/Library/LaunchAgents/com.user.wallpaper-wake.plist"

