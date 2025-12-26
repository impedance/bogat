# Active Context — YNAB-lite PWA

**Last reviewed:** 2025-12-26

## Current Focus
- Браузерный MVP завершён (Stages 0–4): Dexie + repositories + Pinia, UI транзакций/счетов/категорий, MoneyInput, dashboard, PWA manifest/Workbox и JSON backup/import работают. `app/repositories/backup.ts` фиксирует контракт: импорт полностью заменяет таблицы Dexie, `/settings` показывает предпросмотр и предупреждение перед восстановлением.
- Утилиты `useMoney`, Zod schemas, `MoneyInput` и Pinia selectors покрыты Vitest; текущая фокусная зона — Stage 5 (тесты/полировка).
- UI-тесты начаты: добавлены Playwright конфиг/скрипты, фикстуры, helper импорта и набор smoke + первые снапшоты (dashboard/transactions/form).
- **Stage 5 / Полировка & тесты:** добавить unit-coverage для `MoneyInput`, stores/репозитория `accounts` и `categories`, расширить валидации, собрать smoke add→filter→export→import, оптимизировать пустые состояния и ключевые a11y-подсказки (фокус, aria, клавиатура).
- **Device smoke:** прогнать iOS install/offline на iPhone SE Safari (service worker + AddToHomeBanner), задокументировать TTI/Lighthouse и ручной JSON экспорт/импорт с предупреждением/предпросмотром.
- Keep the guardrails: Clean Architecture-lite, SOLID, repository adapters и CQRS-lite при взаимодействии с Dexie/Pinia/UI.
- Дашборд и MoneyInput контракты остаются: `MoneyInput` обещает `v-model string` и quick amounts, дашборд отражает текущие фильтры транзакций.
- Новый план `docs/envelope-budget-plan.md` описывает упрощённый zero-based budgeting (TBB/assignments, страница бюджета, переносы). Реализация UI/store ещё не начата, но база готова: Dexie поднят до v2 с таблицей `categoryAssignments` (проверено через `fake-indexeddb` в `tests/db/client.test.ts`), импорт/экспорт работает по v2-only и включает назначения.
- Zero-based budgeting groundwork закрыт: `monthKeySchema`, `categoryAssignmentSchema`, `BACKUP_SNAPSHOT_VERSION = 2`, `backupSnapshotSchema` принимает `categoryAssignments`, Dexie schema обновлена до v2, backup репозиторий пишет/читает назначения и отвергает v1 снапшоты.
- В дереве есть новый unit-тест `tests/repositories/backup.test.ts` (пока не в git), подтверждающий полную замену Dexie при импорте snapshot.

### Параллельные дорожки
- Device smoke: вручную подтверждать offline/install на iPhone SE и фиксировать результаты в Memory Bank.
- JSON backup/import: функциональность готова, но нужен smoke и отчет по предупреждению/предпросмотру.
- Тесты/полировка: покрытие MoneyInput/store/репо, smoke add→filter→export→import, пустые состояния и a11y.

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
