# Instructions

<INSTRUCTIONS>
# AGENT OPERATIONS OVERVIEW

This file is the primary entry point for any AI agent working in this repository. Load it at the beginning of every session to understand the required protocol, project direction, and supporting documentation.

## New navigation scheme (README + AICODE)

In this repository, agent documentation is:
- `README.md` as an index map (paths -> entry points -> commands -> "how to find via rg").
- `AICODE-*` anchors in code/docs as stable links for `rg -n "AICODE-"`.
- `docs/status.md` as living context (current focus, next steps, risks).
- `docs/decisions/*` (ADR) as "why" and accepted tradeoffs.

## Required documents
- `docs/aicode-anchors.md` - rules and schema for AICODE anchors (allowed prefixes, dates, templates, namespace).
- `docs/ynab-lite-pwa-plan.md` - product plan/roadmap (source of truth for scope).
- `docs/context.md` - concise context skeleton (mission, stack, architectural patterns, invariants).
- `docs/status.md` - current focus and next steps.

## Session Boot Checklist

1) Read this `AGENTS.md`.
2) Read `README.md` and use it as a repository map (Repository layout / Entry points / Search cookbook).
3) Run `rg -n "AICODE-"` (narrow by directory if needed) to find contracts/traps/notes near the code.
4) Read `docs/context.md` (mission/stack/patterns/invariants) and `docs/status.md` (current focus/next steps/risks).
4) Read `docs/ynab-lite-pwa-plan.md` (if the task is product or plan related).
5) Before any changes, run `rg -n "AICODE-"` and find relevant anchors.

## If navigation is missing or outdated

If `README.md` lacks navigation sections (Repository layout / Entry points / Search cookbook) or they do not match the current project structure:
- update/create navigation using the protocol below;
- after the update, use `README.md` + `AICODE-*` as the primary search interface.

## README as index (protocol)

Goal: `README.md` should be a table of contents into code - file paths as links + `rg`/AICODE as fast jumps.

### What `README.md` must include (minimum)
1) Repository layout
   - 10-25 items: `path/or/file` - purpose; search: `AICODE-...` or `rg -n "..."`
   - Short items, no essays.

2) Entry points
   - 3-10 items: key entry points (Nuxt/PWA config, Dexie schema, repositories, stores/selectors, backup/import, critical components).
   - For each: path + how to find via `rg`/`AICODE-*`.

3) Common tasks
   - Project commands (install/dev/build/preview/test/lint) - only those that exist in `package.json`/scripts.

4) Search cookbook
   - 8-15 real `rg -n ...` commands for typical questions (Dexie schema, import/export, Zod schemas, balance calculations, filters, PWA, etc.).

### How to update the index
- Do not use line numbers as links.
- Before adding new AICODE anchors run `rg -n "AICODE-"` and avoid duplicates.
- If navigation without anchors is fragile (refactors break the pointers) add the minimum AICODE anchors in strategic places, strictly following `docs/aicode-anchors.md`.

## AICODE rules (critical)
- Anchors: only `AICODE-*` and only allowed prefixes from `docs/aicode-anchors.md`.
- Before adding new anchors always run `rg -n "AICODE-"` to avoid duplicates.
- For `TRAP/CONTRACT` a date `[YYYY-MM-DD]` is mandatory.

## Where to write context

- Navigation and "where to look": `README.md` (plus targeted `AICODE-NOTE: NAV/...` near code).
- Current focus / next steps / risks: `docs/status.md` (short lists).
- Mission / stack / patterns / invariants: `docs/context.md` (rarely changes).
- "Why so" and tradeoffs: `docs/decisions/*` (ADR), with `ref:` and `AICODE-LINK:` in code if needed.

## Additional interaction rules

- Always answer the user in Russian, even if the question is in another language.
- Always run tests after code changes.

## Minimum "done" for any task

- Relevant `AICODE-*` anchors updated in affected areas (if behavior/contracts changed).
- If structure/entry points changed - update `README.md` (index).
- If focus/plan changed - update `docs/status.md` (short).
- Checks run: `npm run lint:aicode` and `npm test` (or equivalent project commands).


## Skills
These skills are discovered at startup from multiple local sources. Each entry includes a name, description, and file path so you can open the source for full instructions.
- skill-creator: Guide for creating effective skills. This skill should be used when users want to create a new skill (or update an existing skill) that extends Codex's capabilities with specialized knowledge, workflows, or tool integrations. (file: /home/spec/.codex/skills/.system/skill-creator/SKILL.md)
- skill-installer: Install Codex skills into $CODEX_HOME/skills from a curated list or a GitHub repo path. Use when a user asks to list installable skills, install a curated skill, or install a skill from another repo (including private repos). (file: /home/spec/.codex/skills/.system/skill-installer/SKILL.md)
- Discovery: Available skills are listed in project docs and may also appear in a runtime "## Skills" section (name + description + file path). These are the sources of truth; skill bodies live on disk at the listed paths.
- Trigger rules: If the user names a skill (with `$SkillName` or plain text) OR the task clearly matches a skill's description, you must use that skill for that turn. Multiple mentions mean use them all. Do not carry skills across turns unless re-mentioned.
- Missing/blocked: If a named skill isn't in the list or the path can't be read, say so briefly and continue with the best fallback.
- How to use a skill (progressive disclosure):
  1) After deciding to use a skill, open its `SKILL.md`. Read only enough to follow the workflow.
  2) If `SKILL.md` points to extra folders such as `references/`, load only the specific files needed for the request; don't bulk-load everything.
  3) If `scripts/` exist, prefer running or patching them instead of retyping large code blocks.
  4) If `assets/` or templates exist, reuse them instead of recreating from scratch.
- Description as trigger: The YAML `description` in `SKILL.md` is the primary trigger signal; rely on it to decide applicability. If unsure, ask a brief clarification before proceeding.
- Coordination and sequencing:
  - If multiple skills apply, choose the minimal set that covers the request and state the order you'll use them.
  - Announce which skill(s) you're using and why (one short line). If you skip an obvious skill, say why.
- Context hygiene:
  - Keep context small: summarize long sections instead of pasting them; only load extra files when needed.
  - Avoid deeply nested references; prefer one-hop files explicitly linked from `SKILL.md`.
  - When variants exist (frameworks, providers, domains), pick only the relevant reference file(s) and note that choice.
- Safety and fallback: If a skill can't be applied cleanly (missing files, unclear instructions), state the issue, pick the next-best approach, and continue.
</INSTRUCTIONS>
