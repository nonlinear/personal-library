# Reindex Library Prompt

**Purpose:** Rebuild metadata and FAISS indices after reorganizing books or folders.

---

## When to Use This Prompt

✅ **USE when:**

- Moved book files between folders
- Renamed topic folders
- Added/removed books
- Created new topic subfolders
- Fixed folder structure issues
- After bulk file operations

❌ **DO NOT USE for:**

- Just reading/querying library (use `/research` instead)
- Minor changes (single book added - just reindex that topic)
- No file changes made

---

## Reindexing Workflow

**Step 1: Regenerate Metadata**

Scan all book folders and rebuild metadata.json with current structure:

```bash
cd "/Users/nfrota/Documents/personal library"
python3.11 scripts/generate_metadata.py
```

**Expected output:**

- Lists all topics found
- Shows book count per topic
- Reports failed books (if any) in `engine/docs/FAILED.md`
- Saves to `books/metadata.json`

---

**Step 2: Rebuild All Indices**

Reindex all books to rebuild FAISS vector stores:

```bash
cd "/Users/nfrota/Documents/personal library"
python3.11 scripts/indexer.py
```

**Expected output:**

- Processing progress per topic
- Chunk counts per book
- Index files saved to `books/{topic}/faiss.index` and `chunks.pkl`

**Time estimate:** 5-10 minutes for ~200 books

---

**Step 3: Verify**

Check that indices were created:

```bash
cd "/Users/nfrota/Documents/personal library"
find books -name "faiss.index" | wc -l
```

Should match number of topics with books.

---

## Alternative: Reindex Single Topic

If you only changed one topic (faster):

```bash
cd "/Users/nfrota/Documents/personal library"
python3.11 scripts/generate_metadata.py
python3.11 scripts/reindex_topic.py <topic_id>
```

**Example:**

```bash
python3.11 scripts/reindex_topic.py technology_hugo
```

---

## Troubleshooting

**"No books found in topic X"**

- Check folder exists: `ls -la books/X/`
- Verify .epub or .pdf files present
- Check metadata.json has topic listed

**"Failed to extract text"**

- Check `engine/docs/FAILED.md` for list
- Usually corrupted files or DRM-protected
- Remove or replace problematic files

**"ModuleNotFoundError"**

- Run setup: `bash ./scripts/setup.sh`
- Verify Python 3.11+: `python3.11 --version`

**Indices not updating**

- Delete old indices first: `find books -name "faiss.index" -delete`
- Rerun indexer.py

---

## What Gets Regenerated

**metadata.json:**

- Topic IDs and labels
- Folder paths (including subtopics)
- Book titles, authors, years
- Auto-generated tags (8 per book)
- Book count: 197 files

**FAISS indices (per topic):**

- `faiss.index` - Vector similarity search
- `chunks.pkl` - Text chunks with metadata
- `chunks.json` - Human-readable debug format

**Not regenerated:**

- Embedding model (downloaded once during setup)
- Book files (untouched)
- Configuration files

---

## Example Session

```bash
# After moving books/AI/theory/ → books/theory/AI/
cd "/Users/nfrota/Documents/personal library"

# Regenerate metadata
python3.11 scripts/generate_metadata.py
# ✅ Generated: books/metadata.json
#    Topics: 29
#    Books: 197

# Rebuild all indices
python3.11 scripts/indexer.py
# 📚 Processing topic: ai_theory
# ✅ Indexed 8 books → 3,427 chunks
# ...
# ✅ All topics indexed!

# Verify
find books -name "faiss.index" | wc -l
# 29
```

---

## Performance Notes

- **Metadata generation:** ~30 seconds (KeyBERT tag extraction)
- **Full reindexing:** 5-10 minutes (depends on library size)
- **Single topic:** 10-60 seconds (depends on book count)
- **Embedding model:** Runs locally (all-MiniLM-L6-v2, ~90MB)

---

## Post-Reindex

After successful reindex, test with `/research`:

```
/research in AI theory what does Bostrom say about storage capacity?
```

Should return results with correct folder paths in citations.
