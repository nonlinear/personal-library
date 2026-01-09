# Literature RAG (2026)

Minimal, manual workflow for local book retrieval and question-answering.

## How it works

1. Place `.epub` or `.pdf` files in a folder under `books/` (e.g., `books/urbanism/`).
2. Use one of the three prompts/scripts:
   - **update_literature**: Index only new/unindexed books and update `.rag-topics`.
   - **reindex_all_books**: Delete the index and reindex everything from scratch.
   - **literature (query)**: Ask questions to your indexed books.

No watcher, no Hammerspoon, no file monitoring. All updates are manual and reliable.

## Roadmap

1. Embed books via [update literature](scripts/update_literature.py) ✅
2. Turn on literature MCP (via tasks) ✅
3. Query via [literature prompt](.github/prompts/literature.prompt.md) ✅
4. Turn off literature MCP (via tasks) ✅
5. Local embedding model (vs gemini) ⏳
6. Better query (terminal on bg? extension?) ⏳
7. threading/multiprocessing for simultaneous queries and implement cache for recent responses. ⏳
8. literature prompt asking for topic or book for faster response ⏳
9. turn MCP on/off automatically (how?) ⏳
10. PDF support ⏳
11. generalize: path on .env, etc. new computers) ⏳
12. image support (source points to file with image) ⏳

## 🤖 For AI

Always use `/opt/homebrew/bin/python3.11` (Homebrew's Python 3.11) to run scripts and install packages.
Never use venv or virtual environments; always install globally.

Install dependencies with:

```sh
/opt/homebrew/bin/python3.11 -m pip install <package>
```

Run scripts with:

```sh
/opt/homebrew/bin/python3.11 script.py
```

Never use `python3`, `python`, `pip`, or `pip3` without the full path.
Review this notice before running any script or installing dependencies.
Update this list with new findings as needed.
