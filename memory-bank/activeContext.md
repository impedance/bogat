# Active Context — YNAB-lite PWA

**Last reviewed:** 2025-10-21

## Current Focus
- Browser MVP (Stages 0–2): finish Dexie schema + Pinia stores, forms, and transaction list with фильтры/поиск.
- Ensure money utility helpers (`toMinor`, `fromMinor`) are implemented with accompanying tests.

## Near-Term Tasks
- Create Dexie database module defining tables, индексы, сид дефолтных категорий, и lightweight repository helpers.
- Establish Pinia stores/selectors that wrap Dexie, expose derived balance calculations, и поддерживают фильтры/поиск.
- Build transaction/account/category forms + transaction list UI for browser; добавлять unit tests covering money helpers and selectors.

## Pending Decisions / Questions
- Confirm depth of runtime validation: Zod schemas at API boundaries vs. relying on TypeScript inference in stores.
- Plan validation of PWA install/onboarding copy once primary flows render.

## Coordination Notes
- Stage 0 scaffold completed (Nuxt + Tailwind + Pinia + PWA) and recorded in `progress.md`.
- Update `progress.md` after data layer implementation and whenever plan stages shift.
