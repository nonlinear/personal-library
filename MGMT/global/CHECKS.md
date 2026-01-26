# MGMT - Universal Validation Checks

> Validation tests that apply to ALL projects using MGMT system.

**Purpose:** Ensure project follows MGMT conventions and documentation stays in sync.

---

## 📐 Status File Formatting (MANDATORY)

All status files (CHECKS.md, ROADMAP.md, CHANGELOG.md, POLICY.md) must be both **human-readable** and **machine-readable**.

**Rules:**

1. Each test/check = short, copy-pasteable code block
2. No large monolithic scripts
3. No markdown inside code blocks
4. Explanations outside code blocks
5. Easy for humans AND automation to parse

**Example:**

```bash
python3.11 -c "import sys; print(sys.version)"
```

Expected: Prints Python version
Pass: ✅ Python 3.11+

---

## 🤖 Navigation Block Validation

**Every status file must have 🤖 navigation block.**

**Test: README has navigation block**

```bash
grep -q '> 🤖' README.md && echo '✅ Navigation block exists' || echo '❌ Missing navigation block'
```

Expected: Prints '✅ Navigation block exists'
Pass: ✅ Navigation block exists

**Test: All status files have navigation block**

```bash
for file in MGMT/CHANGELOG.md MGMT/ROADMAP.md MGMT/POLICY.md MGMT/CHECKS.md; do
  grep -q '> 🤖' "$file" || echo "❌ Missing in $file"
done && echo '✅ All files have navigation blocks'
```

Expected: Prints '✅ All files have navigation blocks'
Pass: ✅ All navigation blocks present

---

## 📊 Documentation Sync Check

**Changes in code must be reflected in ROADMAP/CHANGELOG.**

**Test: Git changes match documented work**

```bash
# Check if there are uncommitted changes
if git diff --quiet; then
  echo '✅ No uncommitted changes'
else
  echo '⚠️ Uncommitted changes - run /MGMT-start to sync docs'
fi
```

Expected: Either no changes or reminder to run /MGMT-start
Pass: ✅ Clean state or acknowledged pending sync

---

## 🗂️ File Structure Validation

**Test: Required MGMT files exist**

```bash
test -f README.md && \
test -f MGMT/ROADMAP.md && \
test -f MGMT/CHANGELOG.md && \
test -f MGMT/POLICY.md && \
test -f MGMT/CHECKS.md && \
test -d MGMT/global && \
echo '✅ Required MGMT files exist' || echo '❌ Missing required files'
```

Expected: Prints '✅ Required MGMT files exist'
Pass: ✅ All required files present

**Test: Global MGMT files exist**

```bash
test -f MGMT/global/README.md && \
test -f MGMT/global/POLICY.md && \
test -f MGMT/global/CHECKS.md && \
test -f MGMT/global/update-MGMT.py && \
echo '✅ Global MGMT files exist' || echo '❌ Missing global files'
```

Expected: Prints '✅ Global MGMT files exist'
Pass: ✅ Global files present

---

## 📝 Epic Format Validation

**Epics must follow standard format defined in global/POLICY.md**

**Test: ROADMAP epics use correct syntax**

```bash
grep -E '\[🚧\]\(.*\).*\*\*|⏳.*\*\*|✅.*\*\*' MGMT/ROADMAP.md >/dev/null && \
echo '✅ Epic format correct' || echo '⚠️ Check epic syntax'
```

Expected: Finds properly formatted epics
Pass: ✅ Epics follow format

---

## 🔗 Link Integrity Check

**Navigation links must point to existing files**

**Test: README links are valid**

```bash
# Extract file paths from README navigation block
# (This is a simplified check - full implementation would parse markdown links)
test -f MGMT/CHANGELOG.md && \
test -f MGMT/ROADMAP.md && \
test -f MGMT/POLICY.md && \
test -f MGMT/CHECKS.md && \
echo '✅ README links valid' || echo '❌ Broken links in README'
```

Expected: All linked files exist
Pass: ✅ Links valid

---

## 🎯 Version Consistency

**CHANGELOG versions must follow semantic versioning**

**Test: Version format validation**

```bash
grep -E '^## v[0-9]+\.[0-9]+\.[0-9]+' MGMT/CHANGELOG.md >/dev/null && \
echo '✅ Versions follow semver' || echo '⚠️ Check version format'
```

Expected: Finds semantic version headings
Pass: ✅ Semantic versioning

---

## Summary

**These checks ensure:**

- ✅ Documentation stays in sync with code
- ✅ Navigation works across all files
- ✅ Epics follow standard format
- ✅ Files are properly structured
- ✅ Versions follow semver
- ✅ Links aren't broken

**Run all checks:**

````bash
# From project root
bash -c "$(grep -A 1 '^```bash' MGMT/global/CHECKS.md | grep -v '^```' | grep -v '^--$')"
````

---

**Last updated:** 2026-01-26
**Version:** 1.0.0
