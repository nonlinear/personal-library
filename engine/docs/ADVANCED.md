# Advanced Usage

Advanced features and troubleshooting for Librarian MCP.

## Command-Line Flags

### `indexer_v2.py`

Main indexing script with delta detection.

```bash
# Index all topics
python3.11 scripts/indexer_v2.py --all

# Index specific topic
python3.11 scripts/indexer_v2.py --topic "theory/anthropocene"

# Force reindex (ignore hash-based delta detection)
python3.11 scripts/indexer_v2.py --all --force
python3.11 scripts/indexer_v2.py --topic "plants" --force

# Show help
python3.11 scripts/indexer_v2.py --help
```

**Flags:**

- `--topic <name>`: Index single topic (e.g., "AI/policy", "theory/anthropocene")
- `--all`: Index all topics
- `--force`: Skip delta detection, reindex everything
- `--help`: Show usage information

**Delta Detection:**
Without `--force`, indexer only reindexes topics where files changed (using content hashes).

⚠️ **Note:** `reindex_topic.py` is deprecated. Use `indexer_v2.py --topic "topic_name"` instead.

---

### `watch_library.py`

File watcher for automatic reindexing.

```bash
# Watch with live reindexing
python3.11 scripts/watch_library.py

# Dry run (show what would be reindexed, don't actually reindex)
python3.11 scripts/watch_library.py --dry-run

# Custom check interval (default: 60 seconds)
python3.11 scripts/watch_library.py --interval 30
```

**Flags:**

- `--dry-run`: Log changes without reindexing
- `--interval <seconds>`: Check interval (default: 60)

**Use Case:**
Run in background while adding/editing books. Auto-reindexes changed topics.

#### Run as LaunchAgent (macOS)

Keep watchdog running even when VSCode is closed:

```bash
# Load the LaunchAgent (runs at login, auto-restarts)
launchctl load ~/Library/LaunchAgents/com.librarian.watchdog.plist

# Check status
launchctl list | grep librarian

# View logs
tail -f ~/Documents/librarian/watchdog.log
tail -f ~/Documents/librarian/watchdog.error.log

# Stop watchdog
launchctl unload ~/Library/LaunchAgents/com.librarian.watchdog.plist

# Restart after code changes
launchctl kickstart -k gui/$UID/com.librarian.watchdog
```

**Configuration:** [~/Library/LaunchAgents/com.librarian.watchdog.plist](file://~/Library/LaunchAgents/com.librarian.watchdog.plist)

**Properties:**

- `RunAtLoad`: Starts on login
- `KeepAlive`: Auto-restarts if crashes
- `ThrottleInterval`: 10s cooldown between restarts

#### Verify Watchdog Indexed Books

If you add books while VSCode is closed, check if watchdog auto-indexed:

```bash
# Check watchdog log for reindex activity
tail -50 watchdog.log | grep -E "(📖|✅|❌)"

# Check when topic was last indexed
ls -lh books/theory/anthropocene/topic-index.json
# Compare timestamp with book file timestamps

# Quick check: compare topic-index.json vs book files
find books/theory/anthropocene -name "*.epub" -o -name "*.pdf" -exec ls -lt {} + | head -1
ls -lt books/theory/anthropocene/topic-index.json

# If watchdog missed it, manually reindex
python3.11 scripts/indexer_v2.py --topic "theory/anthropocene"
```

**What to look for in logs:**

- `📖 Indexing: <topic>` - Watchdog detected change
- `✅ Reindex completed` - Success
- `❌ Reindex failed` - Check error

---

### `research.py`

CLI wrapper for querying (used by VS Code extension).

```bash
# Search all topics
python3.11 scripts/research.py "design patterns" --top-k 5

# Search specific topic
python3.11 scripts/research.py "permaculture" --topic "plants" --top-k 3

# List available topics
python3.11 scripts/research.py --list-topics
```

**Flags:**

- `--topic <name>`: Search within specific topic
- `--top-k <n>`: Number of results (default: 5)
- `--list-topics`: Show all indexed topics

**Output:** JSON array (for VS Code extension integration)

---

## Troubleshooting

### MCP Server Won't Start

**Symptom:** `mcp_server.py` fails with "metadata.json not found"

**Solution:** Server uses **v2.0 schema** (`library-index.json`) with fallback to v1.0 (`metadata.json`).

Check if indexed:

```bash
ls -la books/library-index.json
```

If missing, run:

```bash
python3.11 scripts/indexer_v2.py --all
```

---

### Query Returns No Results

**Possible causes:**

1. Topic not indexed
2. Faiss index corrupted
3. Wrong topic name

**Debug steps:**

```bash
# List all indexed topics
python3.11 scripts/research.py --list-topics

# Check topic has index files
ls -la books/<topic>/

# Should have:
#   - topic-index.json
#   - chunks.json
#   - faiss.index
```

**Force rebuild:**

```bash
python3.11 scripts/indexer_v2.py --topic "<topic>" --force
```

---

### Watch Library Not Detecting Changes

**Symptom:** File changes don't trigger reindex

**Check:**

1. `watch_library.py` running?
2. Changes inside `books/<topic>/`?
3. File extension is `.epub`, `.pdf`, `.txt`?

**Manual trigger:**

```bash
# Kill watch_library.py (Ctrl+C)
# Manually reindex
python3.11 scripts/indexer_v2.py --topic "<changed-topic>"
# Restart watch
python3.11 scripts/watch_library.py
```

---

### Indexer Fails on EPUB

**Symptom:** "Failed to process <file.epub>"

**Possible causes:**

1. Corrupted EPUB
2. DRM-protected file
3. Missing Python dependencies

**Test file manually:**

```bash
python3.11 -c "
from ebooklib import epub
book = epub.read_epub('books/topic/file.epub')
for item in book.get_items():
    print(item)
"
```

**If file is DRM-protected:** Remove DRM first (Calibre + DeDRM plugin)

---

## Advanced Configuration

### Custom Embedding Model

Default: `sentence-transformers/all-MiniLM-L6-v2` (90MB, fast)

**Switch to better model:**

```python
# In mcp_server.py and indexer_v2.py, change:
model = SentenceTransformer('all-mpnet-base-v2')  # 420MB, more accurate
```

See [embedding-models.md](embedding-models.md) for comparison.

---

### Partition Storage

**Current:** Per-topic indices (`books/<topic>/faiss.index`)

**Why:** Delta detection, faster queries on single topics

**Trade-off:** Cross-topic search requires merging results

---

### FAISS Index Types

Current: `IndexFlatIP` (inner product, exact search)

**Alternatives:**

- `IndexIVFFlat`: Approximate search, faster on huge libraries (>100k chunks)
- `IndexHNSWFlat`: Graph-based, very fast queries

**When to switch:** If library grows >50k chunks per topic

---

## Migration

### v1.0 → v2.0 (Smart Indexing)

**Schema change:** `metadata.json` → `library-index.json`

**Migrate:**

```bash
python3.11 scripts/migrate_to_v2.py
```

**Result:**

- Old: Single `metadata.json` + `books.pkl`
- New: `library-index.json` + per-topic `topic-index.json`

**Backwards compatible:** `mcp_server.py` has failsafe (tries v2, falls back to v1)

---

### Personal Library → Librarian (v1.0.0)

**Breaking changes:**

- MCP server name: `personal-library` → `librarian`
- Folder: `~/Documents/personal library` → `~/Documents/librarian`

**Update MCP config:**

```json
{
  "chat.mcp.servers": {
    "librarian": {
      // Changed from "personal-library"
      "command": "/opt/homebrew/bin/python3.11",
      "args": ["/Users/YOUR_USER/Documents/librarian/scripts/mcp_server.py"]
    }
  }
}
```

**Update paths:** Search for `personal library` or `personal-library` in your configs

---

## Validation

### Pre-Commit Checks

Run before pushing to GitHub:

```bash
# All checks
cat engine/docs/CHECKS.md

# Quick test
python3.11 scripts/research.py "test query" --top-k 1
python3.11 scripts/mcp_server.py  # Should start without errors (Ctrl+C to stop)
```

---

## Performance

### Indexing Speed

- **Small topic** (5 books): ~10 seconds
- **Medium topic** (20 books): ~45 seconds
- **Large topic** (100 books): ~5 minutes

**Bottleneck:** EPUB chunking + embedding generation

**Optimization:** Delta detection (only reindex changed topics)

---

### Query Speed

- **Single topic:** <100ms
- **All topics:** ~500ms (merges results from all topic indices)

**Tip:** Use `--topic` flag for faster queries when you know the topic

---

## Development

### Adding New Scripts

1. Add script to `scripts/`
2. Update [CHECKS.md](CHECKS.md) with test
3. Add documentation to this file
4. Update [CHANGELOG.md](CHANGELOG.md)

---

### Debugging MCP Server

**Enable verbose logging:**

```python
# In mcp_server.py, add:
import logging
logging.basicConfig(level=logging.DEBUG)
```

**Test queries manually:**

```bash
# Start server
python3.11 scripts/mcp_server.py

# In another terminal:
python3.11 scripts/research.py "your query" --top-k 5
```

---

## See Also

- [README.md](../../README.md) - Setup & basic usage
- [CHECKS.md](CHECKS.md) - Validation tests
- [CHANGELOG.md](CHANGELOG.md) - Version history
- [ROADMAP.md](ROADMAP.md) - Future features
- [mcp-setup.md](mcp-setup.md) - MCP configuration
- [embedding-models.md](embedding-models.md) - Model comparison
