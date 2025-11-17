# Progress — YNAB-lite PWA

**Last updated:** 2025-11-17

## Completed
- Project plan captured in `ynab-lite-pwa-plan.md` and mirrored across Memory Bank.
- Stage 0 (Environment Prep): Nuxt 3 scaffold initialized, dependencies installed, Tailwind/PWA/Pinia configured, and baseline layout in place.
- Validation strategy defined: TS-first models, Zod on UI/import boundaries, strict schemas for versioned JSON backups.
- Money helper layer shipped: `useMoney.ts` with conversion/formatting helpers plus Vitest unit tests (`npm run test` uses the threads pool to satisfy sandbox limits).
- Stage 1 groundwork: entity Zod schemas live in `app/types/budget.ts`, Dexie client/seed modules (`app/db`) define schema + default data, and repositories for accounts/categories/transactions enforce validation and encapsulate all IndexedDB access.
- Stage 1 completion: Pinia stores for accounts, categories, and transactions wrap the repositories, refresh after mutations, and expose derived balance selectors (overall/per account/per category) with Vitest coverage targeting the critical calculations.

## In Progress
- Stage 2 (Transactions & calculations UI): страница транзакций уже реализует создание, фильтры (счёт/категория/тип/даты/поиск) и ленту; впереди формы аккаунтов/категорий, MoneyInput и дашборд.

## Next Up
1. Добавить UI для аккаунтов/категорий (создание/архивация/редактирование) с переиспользованием Zod + money helpers.
2. Улучшить транзакции: редактирование/удаление, маска MoneyInput, быстрые суммы и отображение балансов на дашборде.
3. Подготовить экспорт/импорт JSON и офлайн/PWA проверки после стабилизации основных форм.

## Known Risks / Blockers
- iOS PWA install and storage limits must be verified on-device once a build is available.
