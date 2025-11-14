# Progress — YNAB-lite PWA

**Last updated:** 2025-11-15

## Completed
- Project plan captured in `ynab-lite-pwa-plan.md` and mirrored across Memory Bank.
- Stage 0 (Environment Prep): Nuxt 3 scaffold initialized, dependencies installed, Tailwind/PWA/Pinia configured, and baseline layout in place.
- Validation strategy defined: TS-first models, Zod on UI/import boundaries, strict schemas for versioned JSON backups.
- Money helper layer shipped: `useMoney.ts` with conversion/formatting helpers plus Vitest unit tests (`npm run test` uses the threads pool to satisfy sandbox limits).
- Stage 1 groundwork: entity Zod schemas live in `app/types/budget.ts`, Dexie client/seed modules (`app/db`) define schema + default data, and repositories for accounts/categories/transactions enforce validation and encapsulate all IndexedDB access.

## In Progress
- Stage 1 (Data Layer): Pinia store layer + selectors/tests.
  - Pinia stores for accounts/categories/transactions should consume the new repositories, expose derived balances, and honor archived/default flags.
  - Selector + repository unit tests (beyond money helper coverage) still pending.

## Next Up
1. Implement Pinia stores (accounts/categories/transactions) on top of the repositories with derived balance/filter selectors.
2. Hook Zod schemas + money helpers into incoming forms/actions plus extend Vitest coverage for selectors/repo scenarios.
3. Stage 2 (UI & Flows) — build dashboard, transaction form, filters, and navigation once data layer stabilizes.

## Known Risks / Blockers
- iOS PWA install and storage limits must be verified on-device once a build is available.
