#!/bin/bash

MSG="$1"

OUTPUT=$(git add -A 2>&1 && git commit -m "$MSG" 2>&1)
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    git pull && git push
    echo ""
    echo "✅ 📚 Personal Library - Committed and pushed successfully!"
    echo ""
elif echo "$OUTPUT" | grep -q 'nothing to commit'; then
    echo ""
    echo "⚪ 📚 Personal Library - Nothing to commit"
    echo ""
else
    echo ""
    echo "❌ 📚 Personal Library - Error:"
    echo "$OUTPUT"
    echo ""
    exit 1
fi
