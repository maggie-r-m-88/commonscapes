#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PLIST_PATH="$HOME/Library/LaunchAgents/com.user.wallpaper-wake.plist"
LABEL="com.user.wallpaper-wake"

case "$1" in
  start)
    echo "Starting wallpaper service..."
    launchctl load "$PLIST_PATH"
    echo "✅ Service started"
    ;;
  
  stop)
    echo "Stopping wallpaper service..."
    launchctl unload "$PLIST_PATH"
    echo "✅ Service stopped"
    ;;
  
  restart)
    echo "Restarting wallpaper service..."
    launchctl unload "$PLIST_PATH" 2>/dev/null
    cd "$SCRIPT_DIR"
    ./setup-wallpaper-wake.sh > /dev/null
    launchctl load "$PLIST_PATH"
    echo "✅ Service restarted with latest config"
    ;;
  
  status)
    echo "Checking service status..."
    if launchctl list | grep -q "$LABEL"; then
      echo "✅ Service is RUNNING"
      launchctl list | grep "$LABEL"
    else
      echo "❌ Service is NOT running"
    fi
    ;;
  
  logs)
    echo "=== Script Log ==="
    tail -20 ~/wallpaper-wake.log
    echo ""
    echo "=== Error Log ==="
    tail -10 ~/wallpaper-wake-stderr.log 2>/dev/null || echo "No errors"
    ;;
  
  test)
    echo "Running wallpaper change now..."
    cd "$SCRIPT_DIR"
    ./wallpaper-wake.sh
    ;;
  
  *)
    echo "Wallpaper Service Control"
    echo ""
    echo "Usage: $0 {start|stop|restart|status|logs|test}"
    echo ""
    echo "  start   - Start the automatic wallpaper service"
    echo "  stop    - Stop the automatic wallpaper service"
    echo "  restart - Restart and reload config (use after editing plist)"
    echo "  status  - Check if service is running"
    echo "  logs    - Show recent logs"
    echo "  test    - Manually change wallpaper now"
    exit 1
    ;;
esac

