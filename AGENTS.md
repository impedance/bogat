# AGENT OPERATIONS OVERVIEW

This file is the primary entry point for any AI agent working in this repository. Load it at the beginning of every session to understand the required protocol and supporting documentation.

## Required Reference Documents

- `agent-rules.md` — Defines the AICODE tagging protocol for in-code memory notes (WHY/TRAP/LINK/TODO/ASK) and the expected session workflow around them. Follow it when adding, reading, or updating AICODE comments.
- `mb-rules.md` — Explains how to use the Memory Bank (`memory-bank/` directory) as the persistent context layer between sessions. Read all memory bank files at task start and keep `activeContext.md` / `progress.md` current.

Always consult both documents before planning or executing work. They govern how context is captured, recalled, and maintained across sessions.
