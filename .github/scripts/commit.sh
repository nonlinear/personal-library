#!/bin/bash

MSG="$1"
NOTIFIER="/opt/homebrew/bin/terminal-notifier"

OUTPUT=$(git add -A 2>&1 && git commit -m "$MSG" 2>&1)
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    git pull && git push
    echo "✅ Success: Changes committed and pushed"
    $NOTIFIER -title "📚 Personal Library" -subtitle "Success" -message "Changes committed and pushed" -sound default 2>/dev/null || true
elif echo "$OUTPUT" | grep -q 'nothing to commit'; then
    echo "⚪ Nothing to commit"
    $NOTIFIER -title "📚 Personal Library" -subtitle "Nothing to commit" -message "No changes detected" 2>/dev/null || true
else
    echo "❌ Error occurred:"
    echo "$OUTPUT"
    $NOTIFIER -title "📚 Personal Library" -subtitle "Error" -message "Check terminal for details" -sound Basso 2>/dev/null || true
    exit 1
fi
