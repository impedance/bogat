# Progress — YNAB-lite PWA

**Last updated:** 2025-11-15

## Completed
- Project plan captured in `ynab-lite-pwa-plan.md` and mirrored across Memory Bank.
- Stage 0 (Environment Prep): Nuxt 3 scaffold initialized, dependencies installed, Tailwind/PWA/Pinia configured, and baseline layout in place.
- Validation strategy defined: TS-first models, Zod on UI/import boundaries, strict schemas for versioned JSON backups.
- Money helper layer shipped: `useMoney.ts` with conversion/formatting helpers plus Vitest unit tests (`npm run test` uses the threads pool to satisfy sandbox limits).

## In Progress
- Stage 1 (Data Layer): implementing Dexie schema and Pinia data access layer.
  - Domain primitives: shared types exist, money helper done; pending Zod schemas.
  - Dexie client + seed routines per plan.
  - Repository modules (accounts/categories/transactions) encapsulating Dexie queries.
  - Pinia stores/selectors providing balances, filters, and CRUD orchestration.

## Next Up
1. Finish Dexie schema, repositories, and Pinia stores for accounts/categories/transactions.
2. Hook Zod schemas + money helpers into the upcoming forms/actions so validation stays centralized.
3. Stage 2 (UI & Flows) — build dashboard, transaction form, filters, and navigation once data layer stabilizes.

## Known Risks / Blockers
- iOS PWA install and storage limits must be verified on-device once a build is available.
