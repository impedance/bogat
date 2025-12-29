# ADR-0001: Navigation via README + AICODE anchors

<!-- AICODE-NOTE: DECISION/ADR-0001 - README becomes the repository map, and AICODE anchors provide stable entry points for `rg` and agents; ref: docs/aicode-anchors.md [2025-12-28] -->

## Context
We need LLM agents and humans to orient quickly in the project without long-form documentation and without line-number links.

## Decision
- Keep `README.md` as a navigation index (Repository layout / Entry points / Common tasks / Search cookbook).
- Use `AICODE-*` anchors near code for:
  - invariants and contracts,
  - rationale for non-obvious decisions,
  - links to tests/docs.
- Move the living status to `docs/status.md`, and rare architectural decisions to `docs/decisions/*`.

## Rationale
- File paths and `rg` are the fastest navigation interface for both humans and agents.
- Anchors are stable across file moves and refactors (unlike line links).
- The README index lowers entry cost, while ADRs capture the "why" without bloating inline comments.

## Consequences
Pros:
- Fast start: `README.md` -> `rg -n "AICODE-"` -> entry point in code.
- Contracts/traps live next to the places where they can be violated.

Cons/risks:
- Requires discipline: update the README index on structural changes.
- Anchors can bloat if completed `AICODE-TODO` items are not removed.

## Related documents
- `AGENTS.md`
- `docs/aicode-anchors.md`
- `docs/status.md`
