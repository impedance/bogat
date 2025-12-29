# AICODE anchors - rules and schema (portable across repositories)

This document combines:
- normative rules for AICODE anchors (allowed prefixes, format, lifecycle);
- a schema for topics and namespaces inside anchor text;
- examples and placement guidance.

If requirements conflict, the normative rules in this document take priority.

Goal: most context lives next to code and is discoverable via `rg -n "AICODE-"`.

---

## 0) Principles (what "good" means)

- Anchors are discoverable: always found via `rg`.
- Anchors are actionable: explain what cannot be broken, why, and where the source of truth lives.
- Anchors are maintained: outdated ones are removed or converted.
- Anchors are local: placed next to code, not a replacement for a project diary.

## 1) Quick start (mandatory)

Before reading code deeply:
- MUST search for existing anchors in the repo: `rg -n "AICODE-"`.
- SHOULD narrow to a module: `rg -n "AICODE-" app/repositories`.
- Allowed tags: `AICODE-NOTE`, `AICODE-TODO`, `AICODE-CONTRACT`, `AICODE-TRAP`, `AICODE-LINK`, `AICODE-ASK`.
- Long-lived tags (`CONTRACT/TRAP`) MUST include a date `[YYYY-MM-DD]` on the same line.

After completing a task:
- MUST update or remove anchors in affected areas.

## 2) When to add or update an anchor

Add or update `AICODE-*:` if the code is:
- non-obvious (the invariant is not obvious at a glance);
- important (core business logic or pipeline);
- fragile (edge cases, step ordering, conditions).

Anchors are mandatory if:
- someone might "simplify" the code and break a requirement;
- logic repeats a legacy or a patch;
- the area is known for regressions or has high blast radius.

## 3) Allowed anchor types (one per line)

- Long-lived (date required): `AICODE-TRAP:`, `AICODE-CONTRACT:`.
- Glue/links: `AICODE-LINK:` (docs/tests/related files; date not needed).
- Session: `AICODE-NOTE:` (rationale/invariant), `AICODE-TODO:` (local queue), `AICODE-ASK:` (question to the team).

## 4) Format rules (grep-friendly)

### 4.1 Syntax
- Use a valid comment for the language (`#`, `//`, `/* */`, ...).
- The first line must start with an allowed prefix from section 3.
- The first line is self-contained: it should make sense in `rg` output without context.

### 4.2 Content (what to include)

A good anchor answers at least 1-2 questions:
- Why is it done this way? (rationale/tradeoff)
- Which invariant must not change? (ordering, mapping, "must not change")
- Which edge cases are critical?
- Where is the source of truth? (doc/test/spec)

Recommended fields (short):
- `ref:` file/doc/test
- `scope:` component/function
- `risk:` what breaks
- `test:` what to cover/update
- `decision:` chosen decision
- `owner:` who decides (if applicable)

Templates:
- `AICODE-NOTE: <invariant or why>; ref: <path>; risk: <impact>`
- `AICODE-TODO: <follow-up>; why: <reason>; scope: <component>; test: <test>`
- `AICODE-ASK: <question?>; decision: <what is needed>; impact: <what changes>`

## 5) Topic schema inside the text (namespace)

Principle: prefix is fixed, topic is inside the text. We do not introduce new prefixes like `AICODE-STATUS:`.

Example:
```ts
// AICODE-NOTE: NAV/REPO-LAYOUT - short map of key paths; ref: README.md; risk: agent will get lost
// AICODE-NOTE: STATUS/FOCUS - current focus and next steps; ref: docs/status.md
// AICODE-NOTE: DECISION/ADR-0001 - why we chose AICODE+README for navigation; ref: docs/decisions/ADR-0001-anchor-navigation.md
```

### Namespace after `:`
- `NAV/<slug>` - navigation anchors (entry points, key places).
- `CONTRACT/<slug>` - behavior invariants (use with `AICODE-CONTRACT:`).
- `TRAP/<slug>` - sharp edges/regressions (use with `AICODE-TRAP:`).
- `DECISION/<id>` - architectural decisions (ADR).
- `STATUS/<slug>` - operational status (use only in `docs/status.md`).
- `TEST/<slug>` - where to test/which tests.

Slug style:
- `kebab-case` or `SCREAMING_SNAKE`.
- stability and uniqueness matter.

### Mapping "knowledge type" -> AICODE prefix

- Contract/invariant: `AICODE-CONTRACT: CONTRACT/<slug> - ... [YYYY-MM-DD]`
- Trap/regression: `AICODE-TRAP: TRAP/<slug> - ... [YYYY-MM-DD]`
- Navigation/note: `AICODE-NOTE: NAV/<slug> - ...`
- Glue: `AICODE-LINK: ...`
- Work queue: `AICODE-TODO: ...` (remove/convert after done)
- Question: `AICODE-ASK: <question?>; decision: <what is needed>; impact: <what changes>`

## 6) Where to place anchors (priority)

1) Entry points
   - main/bootstrap/config
   - storage init/migrations/schema
   - data access (repositories/adapters/clients)
   - state/selectors/aggregations (stores/selectors)
   - critical UI components/handlers

2) Data invariants
   - money in minor units
   - import/export snapshot rules
   - Dexie indices/versioning

3) Sharp edges
   - iOS/PWA specifics
   - tricky edge cases in filters/selectors

4) Links
   - `AICODE-LINK:` to tests/docs/related files

## 7) How to avoid bloat

- For one code area, 1-3 anchors are usually enough.
- If `rg -n "AICODE-" <dir>` returns dozens of matches, group them: keep 1 index anchor + `AICODE-LINK:`.
- Resolved `AICODE-TODO` should be removed or converted to `AICODE-NOTE`.
- Closed `AICODE-ASK` should be converted to `AICODE-NOTE` with `decision:` and `ref:`.

## 8) Lifecycle (keep anchors fresh)

- MUST update or remove anchors after behavior changes.
- `AICODE-TODO` -> remove or convert to `AICODE-NOTE`.
- `AICODE-ASK` -> replace with `AICODE-NOTE` with decision and `ref:`.

## 9) Anti-patterns (do not do)

- Do not repeat the obvious ("increment i", "sort list").
- Do not write essays or logs - the anchor must be short.
- Do not put secrets/tokens/sensitive data.
- Do not use `AICODE-TODO:` as a task tracker (use `docs/todo.md`).
- Do not leave ambiguity ("maybe", "probably"), unless it is `AICODE-ASK:`.

## 10) Examples

### NOTE - invariant + source of truth
```python
# AICODE-NOTE: traversal order is index -> numeric -> alpha (recursive); ref: docs/hierarchy-analysis.md; risk: TOC/section order regressions
```

### NOTE - link to tests/spec
```python
# AICODE-NOTE: image path mapping strips numeric prefixes and targets /images/<slug>/...; ref: tests/test_images.py; risk: broken asset links in bundle.md
```

### TODO - local follow-up
```python
# AICODE-TODO: add a unit test for the tagged-PDF fallback branch; scope: pandoc_runner.render; test: tests/test_pandoc_runner.py
```

### ASK - needs decision
```python
# AICODE-ASK: should missing assets fail the pipeline or be replaced by a placeholder by default? impact: pipeline.validate_images
```

### CONTRACT - behavior invariant with date
```typescript
// AICODE-CONTRACT: Import replaces the target store fully (no merge); ref: <path>; risk: partial restore corrupts derived state [2025-01-15]
```

### Anti-example (too vague)
```python
# AICODE-NOTE: this is tricky, be careful
```

## 11) How to search anchors

- All anchors: `rg -n "AICODE-"`.
- Only canonical prefixes: `rg -n "AICODE-(NOTE|TODO|CONTRACT|TRAP|LINK|ASK):"`.

## 12) Recommended index anchors for this repository

These are useful stable entry points (if they do not exist yet):
- `AICODE-NOTE: NAV/README-INDEX - README as repository map; ref: README.md`
- `AICODE-NOTE: NAV/ENTRYPOINT - primary entry point; ref: <path>`
- `AICODE-NOTE: NAV/STORAGE-SCHEMA - storage schema/migrations; ref: <path>`
- `AICODE-NOTE: NAV/CORE-FLOW - core business flow; ref: <path>`
- `AICODE-NOTE: NAV/TESTS - where to test key contracts; ref: <path>`
