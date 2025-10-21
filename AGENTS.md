# AGENT OPERATIONS OVERVIEW

This file is the primary entry point for any AI agent working in this repository. Load it at the beginning of every session to understand the required protocol, project direction, and supporting documentation.

## Required Reference Documents

- `agent-rules.md` — Defines the AICODE tagging protocol for in-code memory notes (WHY/TRAP/LINK/TODO/ASK) and the expected session workflow around them. Follow it when adding, reading, or updating AICODE comments.
- `mb-rules.md` — Explains how to use the Memory Bank (`memory-bank/` directory) as the persistent context layer between sessions. Read all memory bank files at task start and keep `activeContext.md` / `progress.md` current.
- `ynab-lite-pwa-plan.md` — Project roadmap and functional specification for the YNAB-lite PWA. Treat it as the authoritative source for scope, stack, and delivery order.

Always consult all three documents before planning or executing work. They govern how context is captured, recalled, and maintained across sessions, and detail what “done” looks like for the product.

## Session Boot Checklist

1. Read this `AGENTS.md` to refresh the workflow expectations.
2. Read `mb-rules.md`, then load every file under `memory-bank/` to recover persistent context.
3. Review `ynab-lite-pwa-plan.md` to align on current priorities, milestones, and technical decisions.
4. Follow `agent-rules.md` when scanning code for existing AICODE tags and when recording new knowledge.

## Memory Bank Expectations

- The `memory-bank/` directory mirrors the structure defined in `mb-rules.md`. Keep `activeContext.md` and `progress.md` synchronized with actual development status.
- When the plan introduces new decisions or shifts priorities, update the relevant memory bank files so future sessions start with accurate guidance.
- Never remove historical context unless it is superseded; instead, mark items as resolved or archived.
