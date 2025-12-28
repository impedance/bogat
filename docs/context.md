# Контекст проекта (кратко, для агентов)

<!-- AICODE-NOTE: CONTEXT/BOOT — начни с README (индекс), затем STATUS, затем `rg -n "AICODE-"`; ref: AGENTS.md -->
<!-- AICODE-CONTRACT: CONTEXT/MONEY — все деньги хранятся как integer minor units (копейки) в `amountMinor`; risk: float-ошибки и рассинхрон балансов [2025-12-28] -->
<!-- AICODE-CONTRACT: CONTEXT/BACKUP-IMPORT — импорт снапшота полностью заменяет таблицы Dexie (без merge); ref: app/repositories/backup.ts; risk: частичный restore сломает балансы [2025-12-28] -->

## Миссия и MVP
- Offline‑capable PWA для учёта личных финансов в стиле YNAB‑lite, оптимизированный под iPhone SE 2022.
- MVP: счета/категории/транзакции, балансы, фильтры/поиск, JSON export/import, installable PWA, работа полностью офлайн (без бэкенда).

## Пользователи и UX‑цели
- Privacy‑friendly: всё хранится локально.
- Быстрый ввод транзакции, быстрый взгляд на балансы, предсказуемые фильтры/поиск.

## Стек
- Nuxt 4 (Vue 3 + Vite), TypeScript.
- Pinia (stores + селекторы).
- Dexie (IndexedDB) как system of record.
- Zod для валидации форм/DTO/backup snapshot.
- Tailwind CSS.
- PWA через `@vite-pwa/nuxt` (manifest + Workbox).
- Тесты: Vitest + (частично) Playwright.

## Архитектурные паттерны (что важно не сломать)
- Local‑first: IndexedDB/Dexie — единственный источник данных в MVP.
- Clean Architecture‑lite: UI → stores/selectors → repositories → Dexie (не наоборот).
- CQRS‑lite: actions = команды, getters/selectors = запросы/агрегаты.
- Functional core: money/date/агрегации — чистые функции, покрываемые тестами.

## Где что искать (первые точки входа)
- План и scope: `docs/ynab-lite-pwa-plan.md`
- Живой фокус: `docs/status.md`
- Конфиг PWA/manifest: `nuxt.config.ts`
- Dexie schema/versioning: `app/db/client.ts`
- Репозитории (Dexie access + Zod): `app/repositories/*`
- Сторы/селекторы: `stores/*`
- Money helpers + форматирование: `app/composables/useMoney.ts` (см. тесты `tests/useMoney.test.ts`)
- UI: `pages/*`, `components/*`

## Прогресс (крупно)
- Stage 0–4 завершены (CRUD + PWA + JSON backup/import).
- Stage 5 в работе: тесты/полировка/a11y + smoke add→filter→export→import + ручной iOS install/offline.
- Zero‑based budgeting groundwork: схема Dexie v2 + snapshot v2 подготовлены, UI/стор бюджета ещё не начаты (см. `docs/envelope-budget-plan.md`).
