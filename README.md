# Personal Library MCP

> A BYOB (Bring Your Own Books) local MCP so you can consult your library as you build your projects.

---

## Core Principles

**Every millisecond matters.**

This system is a **semantic orientation tool**, not a conversational assistant.

- **Map ≠ Territory**: Uses a single metadata file for navigation, not content replication
- **Explicit invocation only**: No automatic exploration or unsolicited responses
- **Delta indexing**: Only reindexes what changed
- **Client-agnostic backend**: VS Code is just one possible interface

---

## Architecture

### Vault Structure

```
books/
├── topic_a/
│   ├── book1.epub
│   └── book2.pdf
├── topic_b/
│   └── book3.epub
```

**Rules:**

- Exactly 1 folder level below `books/`
- Each folder = 1 topic
- Only EPUBs and PDFs inside

## The Map: `metadata.json`

**Purpose:** Minimal abstraction for rapid AI decision-making.

**Not:**

- A content copy
- A search index
- A documentation system

**Design decisions:**

- Tags exist only on books (semantic signal)
- Topics have: name + short description
- No text duplication
- Every field serves navigation

---

```mermaid
graph TD
    QUERY([research prompt+<br>specific book query]) --> MAP[Read metadata.json]
    MAP --> SIM[Semantic Similarity]

    SIM --> T1[Topic: philosophy<br/>Score: 0.89]
    SIM --> T2[Topic: AI<br/>Score: 0.32]

    T1 --> B1[Book: Psychopolitics<br/>Tags: power, discipline<br/>Score: 0.91]

    B1 --> DECISION1{Confident match?}
    T2 --> DECISION2{Confident match?}

    DECISION1 -->|Yes| VEC[Query Vector Store<br/>Scope: philosophy/Psychopolitics]
    DECISION2 -->|No| ASK[System asks for clarification]

    ASK --> CLARIFY[Clarification query]
    CLARIFY --> MAP

    VEC --> ANSWER([Precise answer from<br>relevant book chunks])
```

**Rule:** Never reindex everything. Only delta changes.

## Query Flow Principles

**Steps:**

1. User asks a question
2. AI reads **only** `metadata.json`
3. AI calculates semantic similarity (query ↔ topics/tags)
4. AI selects best topic + books
5. **Only then** does vector store query execute
6. If unclear → request clarification

**Never:**

- Explore the vault without direction
- Load large contexts speculatively
- Attempt "smart" auto-discovery
- Make guesses when uncertain

---

## File Watching & Indexing

**Trigger:** Book added/removed from vault

**Process:**

1. `watchdog` detects filesystem change
2. Extract delta (new/removed files only)
3. Update embeddings (incremental)
4. Update `metadata.json`
5. Persist to LlamaIndex storage

**No full reindexing unless explicitly requested.**

---

## Quick Start

### Prerequisites

Before installation, you need:

1. Python 3.11 or higher

- macOS`brew install python@3.11`
- Ubuntu/Debian `sudo apt install python3.11`
- Windows [Download from python.org](https://www.python.org/downloads/)
- Verify: `python3.11 --version`

## Setup

3. Rename `.env-template` as `.env`
4. [Get Google Gemini API Key](https://aistudio.google.com/app/apikey)
5. Add your key to `.env`
   - ⚠️ Maske sure `.env` is in `.gitignore`
6. Run setup script: `bash ./scripts/setup.sh` (installs all Python dependencies automatically)

**Manual setup (if needed):**

```bash
python3.11 -m pip install -r requirements.txt
```

## Usage

1. Add your books

- `books/TOPICNAME/(epub files)

2. Generate metadata: `bash python3.11 scripts/generate_metadata.py`
3. Build index: `bash python3.11 scripts/indexer.py` (soon: folder watch)

- Creates vector store in `storage/` (~92MB for 25 books)

4. Test query your library: `bash python3.11 scripts/query.py "what books discuss AI ethics?"`

## What This System Is Not

- ❌ Not a chat interface
- ❌ Not cloud-dependent
- ❌ Not a general-purpose MCP
- ❌ Not trying to be "smart" beyond navigation

**It is:**

- ✅ A navigation layer for your books
- ✅ A semantic index with minimal latency
- ✅ A local-first, privacy-preserving tool

## Roadmap

### Phase 1: Core Infrastructure ✅

- [x] Implement `metadata.json` generation
- [x] LlamaIndex vector store setup
- [x] Gemini embedding pipeline
- [x] CLI query tool (scripts/query.py)
- [ ] **NEXT:** File watcher with delta detection

### Phase 2: MCP Integration

- [x] MCP server with 3 tools (query_library, list_topics, list_books)
- [x] Metadata-first query routing
- [ ] **NEXT:** Test VS Code MCP integration end-to-end
- [ ] Clarification prompts when ambiguous
- [ ] Response caching

### Phase 3: Optimization

- [ ] **NEXT:** Measure MCP startup time (<0.5s target)
- [ ] Threading/multiprocessing for indexing
- [ ] Index persistence optimization
- [ ] PDF support (currently EPUB only)
- [ ] Image extraction and indexing

### Phase 4: Production

- [ ] Watchdog integration for auto-reindexing
- [ ] Terminal client (standalone)
- [ ] API documentation
- [ ] Performance benchmarks
