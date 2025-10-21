# Progress — YNAB-lite PWA

**Last updated:** 2025-10-21

## Completed
- Project plan captured in `ynab-lite-pwa-plan.md` and mirrored across Memory Bank.
- Stage 0 (Environment Prep): Nuxt 3 scaffold initialized, dependencies installed, Tailwind/PWA/Pinia configured, and baseline layout in place.

## In Progress
- Stage 1 (Data Layer): implementing Dexie schema and Pinia data access layer.

## Next Up
1. Finish Dexie schema, repositories, and Pinia stores for accounts/categories/transactions.
2. Deliver money utility helpers with tests to guarantee accurate minor-unit handling.
3. Stage 2 (UI & Flows) — build dashboard, transaction form, filters, and navigation once data layer stabilizes.

## Known Risks / Blockers
- Choice between strict TypeScript vs Zod-first validation needs confirmation before locking store APIs.
- iOS PWA install and storage limits must be verified on-device once a build is available.
