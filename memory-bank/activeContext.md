# Active Context — YNAB-lite PWA

**Last reviewed:** 2025-11-15

## Current Focus
- Browser MVP (Stages 0–2): Dexie schema + repo layer landed, next priority is wiring Pinia stores/selectors and UI forms (фильтры/поиск still pending).
- Money utility helpers (`useMoney` with `toMinor`/`fromMinor`/formatting) + entity Zod schemas live with Vitest coverage—reuse them across forms and validation flows.
- Enforce the agreed validation stack: TS-first models, Zod on all form submissions, and strict schemas for JSON import/export.
- Keep the minimal-effective test pyramid: unit tests for money helpers, store/validator coverage, and a single smoke E2E flow for export/import.
- Apply the lightweight architecture guardrails (Clean Architecture-lite, SOLID responsibilities, repository adapters) when touching Dexie/Pinia/UI layers.

## Near-Term Tasks
- Create Dexie database module defining tables, индексы, сид дефолтных категорий, и lightweight repository helpers.
- Establish Pinia stores/selectors that wrap Dexie, expose derived balance calculations, и поддерживают фильтры/поиск.
- Build transaction/account/category forms + transaction list UI for browser; добавлять unit tests covering money helpers and selectors.

## Stage 1 — Detailed Backlog (assignable slices)
1. **Domain primitives & validation ready** — ✅ `app/types/budget.ts` now exports Zod schemas + derived TS types; `useMoney` helpers stay the single source of money conversions/tests.
2. **Dexie database foundation** — ✅ `app/db/client.ts` defines v1 schema/indexes + `app/db/seed.ts` seeds default categories and a starter cash account via the populate hook (documented with AICODE-WHY).
3. **Repository layer (Ports & Adapters)** — ✅ Accounts, categories, and transactions repositories wrap Dexie, enforce Zod payload validation, and expose CRUD/filter helpers.
4. **Pinia stores & selectors**
   - `stores/accounts.ts`: load/seed accounts, expose balances per account, actions for create/update/archive.
   - `stores/categories.ts`: manage visible categories (respecting archived/default flags) and provide type-filtered lists for forms.
   - `stores/transactions.ts`: CRUD actions wired to repositories, derived getters for overall balance, filtered lists, and search; include tests for selectors.
5. **Validation & testing harness**
   - Hook repositories/stores into the Zod schemas, surfacing friendly errors.
   - Add unit tests for selectors and repositories (mocks/in-memory Dexie) plus keep instructions for E2E smoke ready for Stage 2.

## Pending Decisions / Questions
- Plan validation of PWA install/onboarding copy once primary flows render.

## Coordination Notes
- Stage 0 scaffold completed (Nuxt + Tailwind + Pinia + PWA) and recorded in `progress.md`.
- Vitest (`npm run test`) is configured via `vitest.config.ts` to run in the `threads` pool because the sandbox blocks forked workers. Keep this setting when adding more suites (recent run covers money helpers; add store/repo cases next).
- Update `progress.md` after data layer implementation and whenever plan stages shift (accounts/categories/transactions repositories exist; next write Pinia wrappers & selector tests).
