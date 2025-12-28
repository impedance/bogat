# AICODE anchor comments (Inline Memory) — Universal rules for coding agents

This document defines **AICODE anchor comments**: short, grep-friendly, in-code notes that encode local “memory” (rationale, invariants, risks, and open questions) for coding agents and humans.

The goal is operational: an agent should be able to start with `rg "AICODE-"`, quickly build context, and avoid breaking non-obvious constraints.

## 0) Principles (what “good” looks like)

- Anchors are **discoverable**: always searchable with `rg`.
- Anchors are **actionable**: they explain what must not change, why, and where to look next.
- Anchors are **maintained**: stale anchors are removed or converted after the decision/work is done.
- Anchors are **local**: they belong next to the code they describe, not as a general project diary.

## 1) Quick start checklist (MUST)

Before reading code deeply:
- MUST search for existing anchors in the repo: `rg -n "AICODE-"`.
- SHOULD narrow to the relevant module: `rg -n "AICODE-" src/md2pdf`.
- Allowed tags: `AICODE-NOTE`, `AICODE-TODO`, `AICODE-CONTRACT`, `AICODE-TRAP`, `AICODE-LINK`, `AICODE-ASK`.
- Long-lived tags (`CONTRACT/TRAP`) MUST carry a date `[YYYY-MM-DD]` on the same line.

After completing any task:
- MUST update anchors in touched areas (refresh, resolve, delete if done).

## 2) When to add or update an anchor

Add/update `AICODE-*:` whenever you touch code that is:
- **Non-obvious**: the reason/invariant is not derivable from the code at a glance.
- **Important**: a core pipeline step or a high-impact behavior.
- **Bug-prone**: tricky edge cases, ordering/sorting, text/path rewriting, multi-branch fallbacks.

Anchors are **mandatory** when:
- A future maintainer/agent could “simplify” the code and silently break a requirement.
- The logic mirrors/patches “legacy” or hard-to-find behavior.
- You are modifying an area known to regress or where a small change has big blast radius.

## 3) Allowed anchor types (use exactly one)

Use one of the following prefixes (no custom variants):
- **Long-lived knowledge (require date):** `AICODE-TRAP:`, `AICODE-CONTRACT:`.
- **Cross-links:** `AICODE-LINK:` (related files/docs/tests; date not required).
- **Session-oriented:** `AICODE-NOTE:` (rationale/constraint), `AICODE-TODO:` (follow-up outside current scope), `AICODE-ASK:` (вопрос к людям/команде).

## 4) Format rules (to keep anchors grep-friendly)

### 4.1 Syntax
- MUST use the language-appropriate comment token (`#`, `//`, `/* */`, …).
- MUST start the first line with the exact prefix from the allowed list (see §3).
- MUST keep the first line **self-contained**: it should be useful in `rg` output without reading surrounding code.

### 4.2 Content rubric (what to include)

A good anchor answers at least 1–2 of:
- **Why** is it implemented this way? (rationale / trade-off)
- **What invariant** must hold? (ordering, mapping rules, “must not change”)
- **What edge cases** matter? (inputs that break it, known pitfalls)
- **Where is the source of truth?** (docs, tests, specification, file path)

Recommended fields (use when helpful; keep it short):
- `ref:` a file/doc/test that explains the rule (e.g., `docs/hierarchy-analysis.md`, `tests/test_walker.py`)
- `scope:` the component or function name
- `risk:` what breaks if changed
- `test:` what to add/update to prevent regression
- `decision:` the explicit decision that was made (useful when converting from QUESTION)
- `owner:` optionally, who should decide (only if it’s actionable in your org)

Suggested templates:
- `AICODE-NOTE: <invariant or why>; ref: <path>; risk: <impact>`
- `AICODE-TODO: <follow-up>; why: <reason>; scope: <component>; test: <test>`
- `AICODE-ASK: <question?>; decision: <what is needed>; impact: <what changes>`

## 5) Anti-patterns (what NOT to do)

- Don’t restate the obvious (“increment i”, “sort list”).
- Don’t write essays or logs; anchors should be short and scannable.
- Don’t embed secrets, tokens, or sensitive data.
- Don’t use `AICODE-TODO:` as a replacement for product/task tracking (use `docs/todo.md` for project-level work).
- Don’t leave ambiguous wording (“maybe”, “probably”) unless it is explicitly a `AICODE-ASK:`.

## 6) Lifecycle rules (keep anchors from going stale)

After you finish a task in an area:
- MUST update or delete anchors you touched.
- If a `AICODE-TODO:` is done, delete it or convert it into a `AICODE-NOTE:` if the rationale/invariant remains.
- If an `AICODE-ASK:` is resolved, replace it with a `AICODE-NOTE:` containing the decision and a `ref:` to the source of truth.

## 7) Examples (portable)

### 7.1 NOTE — record an invariant + source of truth
```python
# AICODE-NOTE: traversal order is index → numeric → alpha (recursive); ref: docs/hierarchy-analysis.md; risk: TOC/section order regressions
```

### 7.2 NOTE — link to tests/spec to prevent “helpful” refactors
```python
# AICODE-NOTE: image path mapping strips numeric prefixes and targets /images/<slug>/...; ref: tests/test_images.py; risk: broken asset links in bundle.md
```

### 7.3 TODO — local follow-up outside current scope
```python
# AICODE-TODO: add a unit test for the tagged-PDF fallback branch; scope: pandoc_runner.render; test: tests/test_pandoc_runner.py
```

### 7.4 QUESTION — requires explicit decision
```python
# AICODE-ASK: should missing assets fail the pipeline or be replaced by a placeholder by default? impact: pipeline.validate_images
```

### 7.5 CONTRACT — API/behavioral invariant with date
```typescript
// AICODE-CONTRACT: Import replaces the target store fully (no merge); ref: <path>; risk: partial restore corrupts derived state [2025-01-15]
```

### 7.6 Anti-example (too vague / not actionable)
```python
# AICODE-NOTE: this is tricky, be careful
```

## 8) How to find anchors

- All anchors: `rg -n "AICODE-"`.
- Only canonical prefixes: `rg -n "AICODE-(NOTE|TODO|CONTRACT|TRAP|LINK|ASK):"`.
