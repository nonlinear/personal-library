# Personal Library - VS Code Implementation

Thin wrapper extension that makes your personal book library searchable in GitHub Copilot Chat.

## Quick Start

```bash
# 1. Index your books (one-time setup)
python3 scripts/reindex_all_books.py

# 2. Install extension
code --install-extension personal-library-mcp-latest.vsix

# 3. Use in GitHub Copilot Chat
/research "what does the book say about infrastructure?"
```

## Available Topics

AI • activism • anthropocene • fiction • oracles • urbanism • usability

## Architecture

```mermaid
graph TB
    subgraph vscode["VS CODE (Extension)<br/>VS Code specific"]
        tools[Register tools<br/>vscode.lm.registerTool]
        spawn[Spawn Python subprocess]
        show[Show results in chat]
    end

    subgraph python["AGNÓSTICO (Python)<br/>Works anywhere: Claude Desktop, terminal, etc"]
        index[Indexing/chunking<br/>reindex_all_books.py]
        storage[FAISS storage<br/>storage/]
        embed[Gemini embeddings<br/>embedding-001]
        query[Query engine<br/>query_partitioned.py]
    end

    tools --> spawn
    spawn -->|subprocess call| query
    query --> show

    style python fill:#e1f5e1
    style vscode fill:#e1e8f5
```

**Zero lock-in:** Python code works independently of VS Code

## Tools Registered

- `query_library` - Search book content
- `list_topics` - List available topics
- `list_books` - List books (all or by topic)

## Development

```bash
cd .vscode/extensions/personal-library-mcp
npm install
npm run compile
vsce package --allow-missing-repository -o personal-library-mcp-latest.vsix
```
