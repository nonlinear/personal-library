# MGMT System

> Universal project management system for AI-assisted development.

**Version:** 1.0.0 (placeholder - will track actual MGMT repo versions)

**Source:** https://github.com/nonlinear/MGMT (not yet published)

---

## Philosophy: Polycentric Governance

**Inspired by Elinor Ostrom's work on commons management.**

MGMT uses a **polycentric structure**—not hierarchical "levels" but **overlapping jurisdictions** where global and project concerns coexist.

**Key principles:**

1. **Multiple centers of power:** Global MGMT defines framework, projects adapt to context
2. **Overlapping not separate:** Project POLICY.md **extends** (not replaces) global/POLICY.md
3. **Self-organized correction:** When MGMT updates, projects decide whether/when to adopt
4. **No top-down mandates:** Global provides patterns, projects choose implementations

**Example:** Epic format syntax lives in global/POLICY.md, but Librarian's "requires reindexing?" column lives in project POLICY.md. Both valid simultaneously.

**Why this matters:** Like Ostrom's federalism, MGMT allows "people to function through self-governing institutions among local, regional, and national communities" (Vincent Ostrom)—your project is a self-governing unit that imports shared infrastructure.

---

## What is MGMT?

A meta-documentation system that provides:

1. **Workflow prompts** (MGMT-start, MGMT-end, MGMT-update)
2. **Universal policies** (epic dance, semantic versioning, branch strategy)
3. **Validation checks** (documentation sync, navigation blocks, formatting)
4. **Update mechanism** (fetch latest MGMT system from repo)

---

## How It Works

**Global files** (in this folder) define **HOW** to manage projects.
**Project files** (in parent MGMT/) are created **BY FOLLOWING** global prompts.

```
MGMT/
  # Project files (you create by following prompts)
  CHANGELOG.md       # Your version history
  ROADMAP.md         # Your planned features
  POLICY.md          # Extends global/POLICY.md
  CHECKS.md          # Includes global/CHECKS.md
  gaps/              # Your discoveries
  schemas/           # Your data structures
  epic-notes/        # Your session logs

  # Global files (imported from MGMT repo)
  global/
    README.md        # This file
    POLICY.md        # Universal workflow rules
    CHECKS.md        # Universal validation tests
    update-MGMT.py   # Update script
```

---

## Files in This Folder

### POLICY.md

Universal workflow rules that apply to ALL projects:

- Epic format syntax
- Branch strategy (epic dance)
- Semantic versioning
- Commit message format
- Rebase vs merge policies

### CHECKS.md

Universal validation tests:

- Navigation block validation
- Documentation sync checks
- Formatting standards
- Status file completeness

### update-MGMT.py

Script to update global MGMT files from repo:

```bash
python3.11 MGMT/global/update-MGMT.py
```

---

## Updating MGMT

When new MGMT versions are released:

1. Run `/MGMT-update` prompt (or `python3.11 MGMT/global/update-MGMT.py`)
2. Script fetches MGMT repo CHANGELOG
3. Shows what changed per version
4. If you confirm, overwrites files in `MGMT/global/`
5. Your project files stay untouched

**Files that update:**

- `MGMT/global/*` (all global files)
- `.github/prompts/MGMT-*.prompt.md` (workflow prompts)

**Files that stay:**

- `MGMT/CHANGELOG.md` (your version history)
- `MGMT/ROADMAP.md` (your features)
- `MGMT/POLICY.md` (your extensions)
- `MGMT/CHECKS.md` (your tests)
- `MGMT/gaps/`, `schemas/`, `epic-notes/` (your content)

---

## Philosophy

**MGMT provides structure, you provide content.**

Global files are like a framework - they define patterns and workflows.
Project files implement those patterns for your specific project.

Example:

- `global/POLICY.md` says "Use epic format: `[🚧](link) Title`"
- Your `ROADMAP.md` follows that format for YOUR epics

---

## Version History

**v1.0.0** (2026-01-26)

- Initial extraction from Librarian MCP
- Created global/ folder structure
- Decoupled MGMT from project files

---

**Last updated:** 2026-01-26
**MGMT Repo:** https://github.com/nonlinear/MGMT (coming soon)
