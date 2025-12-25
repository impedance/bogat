# Progress — YNAB-lite PWA

**Last updated:** 2025-11-19

## Completed
- Project plan captured in `ynab-lite-pwa-plan.md` and mirrored across Memory Bank.
- Stage 0 (Environment Prep): Nuxt 3 scaffold initialized, dependencies installed, Tailwind/PWA/Pinia configured, and baseline layout in place.
- Validation strategy defined: TS-first models, Zod on UI/import boundaries, strict schemas for versioned JSON backups.
- Money helper layer shipped: `useMoney.ts` with conversion/formatting helpers plus Vitest unit tests (`npm run test` uses the threads pool to satisfy sandbox limits).
- Stage 1 groundwork: entity Zod schemas live in `app/types/budget.ts`, Dexie client/seed modules (`app/db`) define schema + default data, and repositories for accounts/categories/transactions enforce validation and encapsulate all IndexedDB access.
- Stage 1 completion: Pinia stores for accounts, categories, and transactions wrap the repositories, refresh after mutations, and expose derived balance selectors (overall/per account/per category) with Vitest coverage targeting the critical calculations.
- Stage 2 UI: собраны страницы `accounts.vue` и `categories.vue` (создание/редактирование, архивирование/восстановление, балансы из стора транзакций) и обновлена навигация. Страница `transactions.vue` поддерживает создание, фильтры/поиск, ленту и редактирование/удаление записей через стор.
- Stage 2 завершён: `components/MoneyInput.vue` с маской/цифровой клавиатурой/быстрыми суммами встроен в форму транзакций, а `pages/index.vue` пересобран на Pinia-селекторах (KPI, список счетов, чек-лист и CTA пустых состояний).
- Stage 3 (PWA/offline): `nuxt.config.ts` содержит расширенный манифест/Workbox с генерацией иконок (`public/icons`), layout подключает офлайн-индикатор (`components/OfflineIndicator.vue`), а дашборд показывает баннер установки/инструкции (`components/AddToHomeBanner.vue`). Service worker работает и в dev (pwa.devOptions); остаётся ручное подтверждение установки/offline на iPhone SE.
- Stage 4 (JSON backup/import): `backupSnapshotSchema` в `app/types/budget.ts`, репозиторий `app/repositories/backup.ts`, UI в `pages/settings.vue` (экспорт/предпросмотр/импорт) и unit-тест `tests/repositories/backup.test.ts` закрывают сценарий резервных копий. Импорт полностью очищает Dexie перед восстановлением.

## In Progress
- Stage 5 (полировка/тесты): расширение покрытия (MoneyInput/сторы/валидаторы), smoke add→filter→export→import, ручной Device smoke и empty states/a11y.

## Next Up
1. Unit coverage: `MoneyInput`, `accounts`/`categories` stores+repositories, validation layer и backup import flow.
2. Smoke add→filter→export→import (Vitest/ручной) с настоящим snapshot, фиксация результатов и проверка фильтров/балансов.
3. Device verification: iOS Safari (iPhone SE) install/offline, `AddToHomeBanner` + service worker.
4. JSON import preview: проверка предупреждения/результата import и согласованности данных в `/settings`.

## Known Risks / Blockers
- iOS PWA install/offline и storage limits must be verified on-device once a build is available.
- Smoke add→filter→export→import (including JSON import preview) ещё не прогнан вручную/в тестах, поэтому пока сформален риск регрессии.
