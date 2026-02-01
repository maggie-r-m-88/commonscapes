# macOS Auto Wallpaper Changer 🎨

Automatically changes your Mac wallpaper to a random image from a curated list. Works like Windows Spotlight!

## Features

- 🔄 Automatically changes wallpaper at set intervals
- 🎲 Randomly selects from a list of images
- 📥 Downloads and caches wallpaper locally
- 🖥️ Sets wallpaper on all monitors
- 📝 Logs all changes for debugging

## Installation

1. Clone or download this repository
2. Navigate to the folder in Terminal
3. Run the setup script:

```bash
./setup-wallpaper-wake.sh
```

That's it! Your wallpaper will now change automatically.

## Configuration

### Change Interval

Edit `com.user.wallpaper-wake.plist` and modify the `StartInterval` value:

- `60` = Every minute (for testing)
- `3600` = Every hour
- `86400` = Every 24 hours (daily, like Windows Spotlight)

After changing, restart the service:
```bash
./wallpaper-control.sh restart
```

### Add Your Own Images

Edit `wallpaper-wake.sh` and add URLs to the `IMAGES` array (lines 14-19):

```bash
IMAGES=(
  "https://example.com/image1.jpg"
  "https://example.com/image2.jpg"
  "https://example.com/image3.jpg"
)
```

## Control Commands

```bash
./wallpaper-control.sh start    # Start the service
./wallpaper-control.sh stop     # Stop the service
./wallpaper-control.sh restart  # Restart (use after config changes)
./wallpaper-control.sh status   # Check if running
./wallpaper-control.sh logs     # View recent logs
./wallpaper-control.sh test     # Change wallpaper immediately
```

## Files

- `wallpaper-wake.sh` - Main script that downloads and sets wallpaper
- `com.user.wallpaper-wake.plist` - Launch Agent configuration
- `setup-wallpaper-wake.sh` - Installation script
- `wallpaper-control.sh` - Service management script

## Logs

- `~/wallpaper-wake.log` - Main script log
- `~/wallpaper-wake-stdout.log` - System output log
- `~/wallpaper-wake-stderr.log` - Error log

## Uninstall

```bash
./wallpaper-control.sh stop
rm ~/Library/LaunchAgents/com.user.wallpaper-wake.plist
```

## How It Works

1. macOS Launch Agent runs the script at specified intervals
2. Script randomly selects an image URL from the list
3. Downloads the image to `~/Pictures/SpotlightWallpapers/`
4. Removes old wallpapers to save space
5. Sets the new image as wallpaper on all monitors using AppleScript

## Requirements

- macOS (tested on recent versions)
- `curl` (pre-installed on macOS)
- `osascript` (pre-installed on macOS)

## License

Free to use and modify!

TODO: Run: ./wallpaper-control.sh restart after updating time interval