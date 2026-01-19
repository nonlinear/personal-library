# Governance: Version Control & Release Process

## Branch Strategy

### Main Branch
- **Purpose:** Production-ready, stable code only
- **Protection:** Never force push (except to fix contamination)
- **Deploys from:** Feature branches when complete

### Feature Branches
- **Naming:** `v{major}.{minor}-{feature-name}`
  - Example: `v0.3-delta-indexing`
  - Example: `v0.4-provider-integration`
  - Example: `v1.0-deep-linking`
- **Lifecycle:**
  1. Create branch from `main`
  2. Develop feature (multiple commits OK)
  3. Regular rebase from `main` to stay current
  4. When complete → PR to `main`
  5. After merge → move to release-notes.md

### Experimental Branches
- **Naming:** `exp/{feature-name}` or `dev/{feature-name}`
  - Example: `exp/engine-refactor`
  - Example: `dev/mcp-fixes`
- **Purpose:** High-risk experiments that might not ship
- **Never merge to main** unless proven stable

---

## Release Process

### 1. Plan (Roadmap)

```markdown
## v0.3: Delta Indexing 🔶 (IN PROGRESS)

**Branch:** `v0.3-delta-indexing`
**Target audience:** Users with large libraries

- [ ] Feature 1
- [ ] Feature 2
```

### 2. Develop (Feature Branch)

```bash
# Create feature branch
git checkout -b v0.3-delta-indexing main

# Develop (multiple commits)
git add .
git commit -m "feat: add delta detection"

# Rebase from main regularly
git fetch origin
git rebase origin/main

# Push to remote
git push origin v0.3-delta-indexing
```

### 3. Complete (Merge to Main)

```bash
# Final rebase
git fetch origin
git rebase origin/main

# Merge to main (fast-forward preferred)
git checkout main
git merge v0.3-delta-indexing

# Push
git push origin main
```

### 4. Document (Release Notes)

Move completed version from roadmap.md to release-notes.md with:

```markdown
## v0.3: Delta Indexing ✅ (Jan 20, 2026)

**Branch:** `main` (promoted from v0.3-delta-indexing)

**👥 Who needs to know:**
- Users with large libraries (>50 books)
- Users reindexing frequently

**📦 What's new:**
[Feature details]

**🔧 Migration:**
[Breaking changes if any]
```

---

## Version Numbering

**Semantic Versioning (0.x for pre-1.0):**

- `v0.x`: Pre-release (breaking changes OK)
  - v0.1: Foundation
  - v0.2: PDF Support
  - v0.3: Delta Indexing (planned)
  - v0.4: Provider Integration (planned)
  - v0.5: Automation (planned)
- `v1.0`: First stable release
  - Breaking changes → major version (v2.0)
  - New features → minor version (v1.1)
  - Bug fixes → patch version (v1.1.1)

---

## Commit Message Convention

**Format:** `type: description`

**Types:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation only
- `refactor:` Code restructuring (no behavior change)
- `test:` Add/update tests
- `chore:` Maintenance (deps, build, etc.)
- `governance:` Process/workflow changes

**Examples:**
```
feat: add PDF support via PyMuPDF
fix: prevent crashes during reindexing on M3 Macs
docs: update roadmap with v0.3 delta indexing
refactor: migrate from FAISS to LlamaIndex
governance: implement semantic versioning
```

---

## Release Notes Template

```markdown
## v{X}.{Y}: {Feature Name} ✅ (Date)

**Branch:** `main` (promoted from v{X}.{Y}-{feature-name})

**👥 Who needs to know:**
- User persona 1 (why they care)
- User persona 2 (why they care)

**📦 What's new:**

**Problem:** [What was broken/missing]

**Solution:** [What we built]

- [x] Key feature 1
- [x] Key feature 2

**Impact:** [Performance, usability, etc.]

**🔧 Migration:** [Breaking changes, upgrade steps, or "None"]
```

---

## Example: Delta Indexing Release

### Before (in roadmap.md)

```markdown
## v0.3: Delta Indexing 🔶 (IN PROGRESS)

**Branch:** `v0.3-delta-indexing`
**Target audience:** Users with large libraries

- [x] Compare filesystem vs metadata
- [x] Identify deltas
- [ ] Auto-reindex affected topics
```

### After (in release-notes.md)

```markdown
## v0.3: Delta Indexing ✅ (Jan 20, 2026)

**Branch:** `main` (promoted from v0.3-delta-indexing)

**👥 Who needs to know:**
- Users with 50+ books (10× faster updates)
- Users adding books frequently (seamless workflow)

**📦 What's new:**

**Problem:** Full reindex took 5min for 50-book library

**Solution:** Delta detection + incremental updates

- [x] Filesystem watcher detects changes
- [x] Only reindex affected topics
- [x] Incremental metadata updates

**Impact:** 10× faster updates (30s vs 5min)

**🔧 Migration:** None (automatic)
```

---

## Protection Against Contamination

**Scenario:** Main branch accidentally contains experimental code

**Solution:**
1. Identify last good commit (e.g., `081296f`)
2. Force push to restore:
   ```bash
   git reset --hard 081296f
   git push --force-with-lease origin main
   ```
3. Preserve experimental work in separate branch:
   ```bash
   git checkout -b exp/contaminated-commits 5ca45ab
   ```

**Prevention:** Use feature branches, never develop directly on main
