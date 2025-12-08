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

## In Progress
- Stage 3 (PWA/offline): подготовить конфиг `@vite-pwa/nuxt`, офлайн-индикатор и мануальные проверки; после него стартует Stage 4 (backup/import).

## Next Up
- 1. Stage 3 — PWA/offline: завершить настройку `@vite-pwa/nuxt`, добавить офлайн-индикатор и инструкцию «Добавить на Домой», прогнать офлайн смоук на iPhone SE.
 2. Stage 4 — JSON backup/import: описать Zod-схему snapshot`а, реализовать экспорт/импорт на `pages/settings.vue`.
 3. Stage 5 — полировка: расширить покрытие (MoneyInput/stores/валидаторы, smoke add→filter→export→import), допилить пустые состояния/a11y.

## Known Risks / Blockers
- iOS PWA install and storage limits must be verified on-device once a build is available.
