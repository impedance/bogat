# Active Context — YNAB-lite PWA

**Last reviewed:** 2025-10-21

## Current Focus
- Stage 0 (Environment Prep) from `ynab-lite-pwa-plan.md`: initialize Nuxt 3 project with Tailwind, Pinia, Dexie, and PWA module configured.
- Establish baseline project structure and linting to support subsequent feature work.

## Near-Term Tasks
- Scaffold IndexedDB layer with Dexie schema for accounts, categories, transactions.
- Implement core money utility helpers (`toMinor`, `fromMinor`) with unit tests.
- Draft Tailwind-based layout shell for dashboard and transaction form.

## Pending Decisions / Questions
- Confirm whether to adopt full TypeScript strict mode or Zod-based validation for the initial iteration (default assumption: use TypeScript with runtime checks where necessary).
- Validate device-specific PWA install flow on iPhone SE once the scaffold is ready.

## Coordination Notes
- Update `progress.md` after each milestone (e.g., data layer ready, UI shell complete).
- Record any deviations from the published plan directly in this file and mirror the change in the relevant memory bank sections.
