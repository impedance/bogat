# Active Context — YNAB-lite PWA

**Last reviewed:** 2025-11-18

## Current Focus
- Browser MVP (Stages 0–2) закрыт: данные (Dexie + repositories + Pinia stores/selectors) и UI (транзакции + дашборд) готовы. Stage 3 (PWA/offline) тоже закрыт: `nuxt.config.ts` содержит полный манифест/Workbox, иконки генерируются в `public/icons`, layout показывает офлайн-индикатор, а дашборд — баннер установки «Добавить на Домой». Следующий крупный блок — Stage 4 (JSON backup/import).
- Страница транзакций теперь использует `components/MoneyInput.vue` — маска денег, цифровая клавиатура и быстрые суммы позволяют вводить копейки без ошибок (`toMinor`/`fromMinor`). Быстрые суммы наращивают текущую сумму.
- Дашборд (`pages/index.vue`) подключён к Pinia селекторам (`overallBalance`, `balanceByAccount`, `incomeTotal`, `expenseTotal`) и выводит KPI, список активных счетов, чек-лист готовности и CTA-пустые состояния.
- Страницы `accounts.vue` и `categories.vue` реализуют создание/редактирование, архивирование/восстановление и отображают балансы по данным транзакций.
- Money utility helpers (`useMoney` with `toMinor`/`fromMinor`/formatting) + entity Zod schemas live with Vitest coverage—reuse them across forms and validation flows.
- Enforce the agreed validation stack: TS-first models, Zod on all form submissions, and strict schemas for JSON import/export.
- Keep the minimal-effective test pyramid: unit tests for money helpers, store/validator coverage (transactions selectors already covered via Vitest), and a single smoke E2E flow for export/import.
- Apply the lightweight architecture guardrails (Clean Architecture-lite, SOLID responsibilities, repository adapters) when touching Dexie/Pinia/UI layers.

## Near-Term Tasks
- **Stage 4 / Backup**: описать Zod-схему snapshot`а, собрать экспорт/импорт JSON на `pages/settings.vue`, завести композабл/репозиторий.
- **PWA smoke**: прогнать офлайн смоук и установку на реальном устройстве (iPhone SE) теперь, когда манифест/иконки готовы.
- **Полировка/тесты**: дописать тесты для MoneyInput/сторов/валидаторов + smoke-сценарий add→filter→export→import.
- Дашборд и новая MoneyInput заданы контракты: не ломать `components/MoneyInput.vue` API (v-model string, quick суммы добавляют значение) и помнить, что дашборд следует текущему состоянию фильтров стора транзакций.

### Параллельные дорожки (готовы к распределению)
- PWA/offline: закрыто — текущая задача только в ручной валидации на устройстве.
- Бэкап/импорт: Zod-схема snapshot + экспорт/импорт в `pages/settings.vue` (композабл/репозиторий).
- Тесты/полировка: покрытие стор/валидаторов/MoneyInput, smoke add→filter→export→import, UI пустые состояния и a11y.

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
- Vitest (`npm run test`) is configured via `vitest.config.ts` to run in the `threads` pool because the sandbox blocks forked workers. Keep this setting when adding more suites (покрытие есть для money helpers и selectors).
- Stage 3 закрыт; `progress.md` зафиксировал переход к Stage 4 (backup/import) и полировке.
