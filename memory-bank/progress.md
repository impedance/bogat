# Progress — YNAB-lite PWA

**Last updated:** 2025-11-15

## Completed
- Project plan captured in `ynab-lite-pwa-plan.md` and mirrored across Memory Bank.
- Stage 0 (Environment Prep): Nuxt 3 scaffold initialized, dependencies installed, Tailwind/PWA/Pinia configured, and baseline layout in place.
- Validation strategy defined: TS-first models, Zod on UI/import boundaries, strict schemas for versioned JSON backups.
- Money helper layer shipped: `useMoney.ts` with conversion/formatting helpers plus Vitest unit tests (`npm run test` uses the threads pool to satisfy sandbox limits).
- Stage 1 groundwork: entity Zod schemas live in `app/types/budget.ts`, Dexie client/seed modules (`app/db`) define schema + default data, and repositories for accounts/categories/transactions enforce validation and encapsulate all IndexedDB access.
- Stage 1 completion: Pinia stores for accounts, categories, and transactions wrap the repositories, refresh after mutations, and expose derived balance selectors (overall/per account/per category) with Vitest coverage targeting the critical calculations.

## In Progress
- Stage 2 (Transactions & calculations UI): transaction/account/category forms plus transaction list, filters, and search screens wired to the stores.

## Next Up
1. Build account/category/transaction forms that submit via the new stores and re-use shared Zod + money helpers.
2. Implement the transaction list with filters/search, leveraging the store selectors for derived balances.
3. Continue Stage 2 Browser MVP work (MoneyInput mask, dashboard wiring) once primary CRUD UI flows are interactive.

## Known Risks / Blockers
- iOS PWA install and storage limits must be verified on-device once a build is available.
