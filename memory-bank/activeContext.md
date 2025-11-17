# Active Context — YNAB-lite PWA

**Last reviewed:** 2025-11-17

## Current Focus
- Browser MVP (Stages 0–2): data layer (Dexie + repositories + Pinia stores/selectors) is complete. Stage 2 UI marches forward—транзакции готовы, добавлены экраны счетов/категорий.
- Базовая страница транзакций собрана: форма создания, фильтры (счёт/категория/тип/даты/поиск) и лента с форматированием сумм через `useMoney`. Навбар ведёт на дашборд, транзакции, счета, категории.
- Страницы `accounts.vue` и `categories.vue` реализуют создание/редактирование, архивирование/восстановление и отображают балансы по данным транзакций.
- Money utility helpers (`useMoney` with `toMinor`/`fromMinor`/formatting) + entity Zod schemas live with Vitest coverage—reuse them across forms and validation flows.
- Enforce the agreed validation stack: TS-first models, Zod on all form submissions, and strict schemas for JSON import/export.
- Keep the minimal-effective test pyramid: unit tests for money helpers, store/validator coverage (transactions selectors already covered via Vitest), and a single smoke E2E flow for export/import.
- Apply the lightweight architecture guardrails (Clean Architecture-lite, SOLID responsibilities, repository adapters) when touching Dexie/Pinia/UI layers.

## Near-Term Tasks
- Усилить транзакции: добавить редактирование/удаление, маску MoneyInput/быстрые суммы и вывести агрегаты на дашборд.
- Привести дашборд к селекторам балансов (общий/по счетам) и пустым состояниям.
- Add high-level selector/validator tests for remaining store logic as UI flows harden, then prepare for Stage 2 feature work (MoneyInput mask, filters, list interactions).

## Stage 1 — Detailed Backlog (assignable slices)
1. **Domain primitives & validation ready** — ✅ `app/types/budget.ts` now exports Zod schemas + derived TS types; `useMoney` helpers stay the single source of money conversions/tests.
2. **Dexie database foundation** — ✅ `app/db/client.ts` defines v1 schema/indexes + `app/db/seed.ts` seeds default categories and a starter cash account via the populate hook (documented with AICODE-WHY).
3. **Repository layer (Ports & Adapters)** — ✅ Accounts, categories, and transactions repositories wrap Dexie, enforce Zod payload validation, and expose CRUD/filter helpers.
4. **Pinia stores & selectors** — ✅ `stores/accounts.ts`, `stores/categories.ts`, `stores/transactions.ts` wrap repositories, refresh data after mutations, expose derived getters (active lists, balance per account/category, totals) and have Vitest coverage for the transaction selectors.
5. **Validation & testing harness**
   - Hook repositories/stores into the Zod schemas, surfacing friendly errors.
   - Add unit tests for selectors and repositories (mocks/in-memory Dexie) plus keep instructions for E2E smoke ready for Stage 2.

## Pending Decisions / Questions
- Plan validation of PWA install/onboarding copy once primary flows render.

## Coordination Notes
- Stage 0 scaffold completed (Nuxt + Tailwind + Pinia + PWA) and recorded in `progress.md`.
- Vitest (`npm run test`) is configured via `vitest.config.ts` to run in the `threads` pool because the sandbox blocks forked workers. Keep this setting when adding more suites (recent run covers money helpers; add store/repo cases next).
- Update `progress.md` after data layer implementation and whenever plan stages shift (accounts/categories/transactions repositories exist; next write Pinia wrappers & selector tests).
