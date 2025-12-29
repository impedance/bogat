# Project context (concise, for agents)

<!-- AICODE-NOTE: CONTEXT/BOOT - start with README (index), then STATUS, then `rg -n "AICODE-"`; ref: AGENTS.md -->
<!-- AICODE-CONTRACT: CONTEXT/MONEY - all money is stored as integer minor units in `amountMinor`; risk: float errors and balance drift [2025-12-28] -->
<!-- AICODE-CONTRACT: CONTEXT/BACKUP-IMPORT - snapshot import fully replaces Dexie tables (no merge); ref: app/repositories/backup.ts; risk: partial restore breaks balances [2025-12-28] -->

## Mission and MVP
- Offline-capable PWA for personal finance tracking (YNAB-lite style), optimized for iPhone SE 2022.
- MVP: accounts/categories/transactions, balances, filters/search, JSON export/import, installable PWA, fully offline (no backend).

## Users and UX goals
- Privacy-friendly: everything stored locally.
- Fast transaction entry, quick balance view, predictable filters/search.

## Stack
- Nuxt 4 (Vue 3 + Vite), TypeScript.
- Pinia (stores + selectors).
- Dexie (IndexedDB) as system of record.
- Zod for form/DTO/backup snapshot validation.
- Tailwind CSS.
- PWA via `@vite-pwa/nuxt` (manifest + Workbox).
- Tests: Vitest + (partial) Playwright.

## Architecture patterns (do not break)
- Local-first: IndexedDB/Dexie is the only data source in MVP.
- Clean Architecture-lite: UI -> stores/selectors -> repositories -> Dexie (not reversed).
- CQRS-lite: actions = commands, getters/selectors = queries/aggregations.
- Functional core: money/date/aggregations are pure functions with tests.

## Where to look first (entry points)
- Plan and scope: `docs/ynab-lite-pwa-plan.md`
- Living focus: `docs/status.md`
- PWA/manifest config: `nuxt.config.ts`
- Dexie schema/versioning: `app/db/client.ts`
- Repositories (Dexie access + Zod): `app/repositories/*`
- Stores/selectors: `stores/*`
- Money helpers + formatting: `app/composables/useMoney.ts` (see tests in `tests/useMoney.test.ts`)
- UI: `pages/*`, `components/*`

## Progress (high level)
- Stage 0-4 complete (CRUD + PWA + JSON backup/import).
- Stage 5 in progress: tests/polish/a11y + smoke add->filter->export->import + manual iOS install/offline.
- Zero-based budgeting groundwork: Dexie v2 schema + snapshot v2 prepared, budget UI/store not started (see `docs/envelope-budget-plan.md`).
