# Progress — YNAB-lite PWA

**Last updated:** 2025-11-18

## Completed
- Project plan captured in `ynab-lite-pwa-plan.md` and mirrored across Memory Bank.
- Stage 0 (Environment Prep): Nuxt 3 scaffold initialized, dependencies installed, Tailwind/PWA/Pinia configured, and baseline layout in place.
- Validation strategy defined: TS-first models, Zod on UI/import boundaries, strict schemas for versioned JSON backups.
- Money helper layer shipped: `useMoney.ts` with conversion/formatting helpers plus Vitest unit tests (`npm run test` uses the threads pool to satisfy sandbox limits).
- Stage 1 groundwork: entity Zod schemas live in `app/types/budget.ts`, Dexie client/seed modules (`app/db`) define schema + default data, and repositories for accounts/categories/transactions enforce validation and encapsulate all IndexedDB access.
- Stage 1 completion: Pinia stores for accounts, categories, and transactions wrap the repositories, refresh after mutations, and expose derived balance selectors (overall/per account/per category) with Vitest coverage targeting the critical calculations.
- Stage 2 UI: собраны страницы `accounts.vue` и `categories.vue` (создание/редактирование, архивирование/восстановление, балансы из стора транзакций) и обновлена навигация. Страница `transactions.vue` поддерживает создание, фильтры/поиск, ленту и редактирование/удаление записей через стор.
- Stage 2 завершён: `components/MoneyInput.vue` с маской/цифровой клавиатурой/быстрыми суммами встроен в форму транзакций, а `pages/index.vue` пересобран на Pinia-селекторах (KPI, список счетов, чек-лист и CTA пустых состояний).
- Stage 3 (PWA/offline): `nuxt.config.ts` содержит расширенный манифест/Workbox с генерацией иконок (`public/icons`), layout подключает офлайн-индикатор (`components/OfflineIndicator.vue`), а дашборд показывает баннер установки/инструкции (`components/AddToHomeBanner.vue`). Service worker работает и в dev (pwa.devOptions), осталось лишь ручное устройство-тестирование.

## In Progress
- Stage 4 (JSON backup/import): описать snapshot Zod-схему, реализовать экспорт/импорт на `pages/settings.vue` и провести валидационные тесты.

## Next Up
- 1. Stage 4 — JSON backup/import: схема, репозиторий бэкапа, UI на `settings.vue`, smoke на экспорт/импорт.
 2. Stage 5 — полировка: расширить покрытие (MoneyInput/stores/валидаторы, smoke add→filter→export→import), пустые состояния/a11y.
 3. Device verification — прогнать iOS PWA install + офлайн smoke на реальном устройстве, чтобы подтвердить Stage 3.

## Known Risks / Blockers
- iOS PWA install/offline и storage limits must be verified on-device once a build is available.
