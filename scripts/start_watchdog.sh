#!/bin/bash
# Wrapper para iniciar watchdog com logging

cd /Users/nfrota/Documents/librarian

echo "🚀 Starting Librarian Watchdog at $(date)" >> watchdog.log
echo "===========================================" >> watchdog.log

# -u forces unbuffered output so logs appear immediately
/opt/homebrew/bin/python3.11 -u scripts/watch_library.py >> watchdog.log 2>&1
