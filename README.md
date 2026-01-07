# Literature RAG

Automated system for private, fast retrieval-augmented queries over your reference books. Uses Gemini for embeddings and LLM, with all API keys kept secure in `.env`. Integrates with VS Code (Copilot MCP) for seamless querying, and supports CLI workflows. All code and data live in `~/Documents/literature`.

---

## What it does

1. **Indexes `.epub` books** in thematic folders under `books/`
2. **Extracts and updates keywords** for each folder using Gemini
3. **Allows fast queries** with citations, markdown links, and text snippets
4. **Integrates with VS Code (Copilot MCP)** for direct queries in the editor
5. **Keeps API keys secure** in `.env` (never exposed in config)
6. **Tracks costs** for queries and embeddings

---

## Requirements

- VS Code: for editing and MCP integration
- Python 3.11+: recommended
- llama-index: RAG framework
- ebooklib: EPUB parsing
- beautifulsoup4: HTML parsing
- google-generativeai: Gemini API
- watchdog: file monitoring
- an LLM
- [Hammerspoon](https://www.hammerspoon.org/): configure the `literature_rag.lua` script to watch the `books/` folder for changes
- Gemini API key: kept in `.env`

---

## Usage

Always start with `[/literature](./.github/prompts/literature.prompt.md)` prompt so it turns MCP on and understands you want RAG context

### Adding or removing books

1. Place `.epub` files in a folder under `books/` (e.g., `books/urbanism/`)
2. Hammerspoon (macOS) detects changes and triggers auto-indexing
3. Keywords for each folder are updated automatically using Gemini
4. `.rag-topics` files are created/updated for keyword management

### CLI

- Query a book:
  ```bash
  python3 scripts/query_book.py "Book Name" "Your question"
  ```
- View costs/usage:
  ```bash
  python3 scripts/view_detailed_costs.py
  ```

### VS Code (MCP)

- Ask questions directly in Copilot (MCP panel):
  - `What is legibility?`
  - `Show me usage for anthropocene`
  - Results include citations, markdown links, and cost tracking

---

## Architecture

### 1. Querying (Ask a Question)

```mermaid
graph TD
  q1[User question] --> k1[Keyword detection]
  k1 --> f1[Select folder]
  f1 --> r1[llama-index retrieval]
  r1 --> v1[VectorStore]
  r1 --> l1[Gemini LLM]
  l1 --> u1[Answer to user]
```

### 2. Updating RAG (Add/Remove Book)

```mermaid
graph TD
  a1[Add or remove EPUB] --> h1[Hammerspoon]
  h1 --> w1[Watchdog script]
  w1 --> idx1[Indexing]
  idx1 --> v2[VectorStore]
  w1 --> k2[Update rag-topics]
  v2 --> s1[Persist to storage]
```

---

## Security & Best Practices

- All API keys are kept in `.env` and never exposed in config files or code.
- Only the Gemini API key is required for embedding and LLM.
- All code and data live in `~/Documents/literature` for privacy and portability.

---

## TODO

### 🌀 UX Feedback Loop

- [ ] Discuss and design a better feedback loop for literature queries
- [ ] Reduce friction in user interactions and query approval
- [ ] Suggestion: MCP should only activate when `literature.prompt.md` is present, and always route literature questions through MCP for consistent, source-based answers
