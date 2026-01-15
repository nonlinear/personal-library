#!/bin/bash

MSG="$1"

OUTPUT=$(git add -A 2>&1 && git commit -m "$MSG" 2>&1)
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    git pull && git push
    terminal-notifier -title "📚 Personal Library" -subtitle "Success" -message "Changes committed and pushed" -sound default
elif echo "$OUTPUT" | grep -q 'nothing to commit'; then
    terminal-notifier -title "📚 Personal Library" -subtitle "Nothing to commit" -message "No changes detected" -sound default
else
    terminal-notifier -title "📚 Personal Library" -subtitle "Error" -message "Check terminal for details" -sound default
    echo "$OUTPUT"
    exit 1
fi
