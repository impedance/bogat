# YNAB-lite PWA

Локальный PWA-бюджет, собранный на Nuxt 4 + Tailwind и ориентированный на iPhone SE 2022.  
Приложение управляет счетами/категориями/транзакциями, показывает дашборд с балансами, работает офлайн и умеет экспортировать/импортировать весь набор данных в валидированный JSON. Dexie выступает системой записи, Pinia — реактивным слоем, а `@vite-pwa/nuxt` поддерживает установку и сервис-воркер.

## Для coding-агентов (прочитай первым)

1. Открой `AGENTS.md` (протокол работы в репо).
2. Используй этот `README.md` как карту репозитория, затем прочитай `docs/context.md` и `docs/status.md`.
3. Перед изменениями выполни `rg -n "AICODE-"` и следуй якорям (контракты/ловушки/заметки).
4. Если индекс в README устарел или в проекте появились новые точки входа — обнови его по протоколу из `AGENTS.md` и соблюдай `docs/agent/anchor-scheme.md`.

## Repository layout

- `app/composables/useMoney.ts` — парсинг/формат денег; искать: `rg -n "toMinor|fromMinor|formatMoney" app/composables`
- `app/db/client.ts` — Dexie схема/версии; искать: `rg -n "version\\(" app/db/client.ts`
- `app/db/seed.ts` — дефолтные сиды; искать: `rg -n "seedDefaults" app/db/seed.ts`
- `app/repositories/backup.ts` — экспорт/импорт снапшота; искать: `rg -n "importBackupSnapshot|createBackupSnapshot" app/repositories/backup.ts`
- `app/repositories/` — доступ к Dexie с Zod-валидацией; искать: `rg -n "zod|parse" app/repositories`
- `app/types/budget.ts` — Zod схемы и snapshot version; искать: `rg -n "BACKUP_SNAPSHOT_VERSION|backupSnapshotSchema" app/types/budget.ts`
- `components/MoneyInput.vue` — денежный инпут/маска; искать: `rg -n "MoneyInput" components/MoneyInput.vue`
- `components/OfflineIndicator.vue` — индикатор офлайна; искать: `rg -n "OfflineIndicator" components`
- `components/AddToHomeBanner.vue` — iOS install подсказка; искать: `rg -n "AddToHomeBanner" components`
- `pages/index.vue` — дашборд/балансы; искать: `rg -n "AICODE-NOTE" pages/index.vue`
- `pages/transactions.vue` — список и фильтры; искать: `rg -n "filters|search" pages/transactions.vue`
- `pages/settings.vue` — UI backup/import; искать: `rg -n "backup|import|export" pages/settings.vue`
- `stores/transactions.ts` — селекторы/агрегации; искать: `rg -n "defineStore\\('transactions'" stores`
- `stores/accounts.ts` — стор счетов; искать: `rg -n "defineStore\\('accounts'" stores`
- `stores/categories.ts` — стор категорий; искать: `rg -n "defineStore\\('categories'" stores`
- `nuxt.config.ts` — PWA manifest/Workbox; искать: `rg -n "pwa:|workbox|manifest" nuxt.config.ts`
- `app/assets/css/main.css` — глобальные стили; искать: `rg -n "tailwind|@layer" app/assets/css/main.css`
- `tests/` — unit/smoke тесты; искать: `rg -n "describe\\(" tests`
- `scripts/lint-aicode.sh` — валидация AICODE; искать: `rg -n "AICODE-" scripts/lint-aicode.sh`

## Entry points

- `nuxt.config.ts` — конфигурация PWA и сборки; искать: `rg -n "pwa:|workbox" nuxt.config.ts`
- `app/db/client.ts` — схема/версии Dexie; искать: `rg -n "version\\(" app/db/client.ts`
- `app/repositories/backup.ts` — контракт импорта снапшота; искать: `rg -n "importBackupSnapshot" app/repositories/backup.ts`
- `app/types/budget.ts` — Zod-валидации и snapshot version; искать: `rg -n "backupSnapshotSchema|BACKUP_SNAPSHOT_VERSION" app/types/budget.ts`
- `components/MoneyInput.vue` — ключевой UI ввода денег; искать: `rg -n "MoneyInput" components/MoneyInput.vue`
- `pages/index.vue` — дашборд с агрегатами; искать: `rg -n "AICODE-NOTE" pages/index.vue`
- `stores/transactions.ts` — селекторы балансов и фильтры; искать: `rg -n "defineStore\\('transactions'" stores/transactions.ts`

## Что уже сделано

- Stage 0–2: scaffold Nuxt+Pinia, модели/репозитории, формы транзакций/счетов/категорий и `MoneyInput` с маской и быстрыми суммами.
- Stage 3: PWA manifest/Workbox, OfflineIndicator, AddToHomeBanner и конфигурация `nuxt.config.ts` для installable офлайн-режима.
- Stage 4: JSON backup/import через `backupSnapshotSchema`, `app/repositories/backup.ts` и UI на `/settings` с предпросмотром и подтверждением полной замены Dexie данных.
- Текущий фокус: Stage 5 — полировка (тесты, empty-states, a11y) + ручные смоуки add→filter→export→import и валидация на iOS-устройстве.

## Стек

- Nuxt 4 (Vite + Vue 3)  
- Pinia + Dexie (IndexedDB)  
- Tailwind CSS  
- Zod для схем и формы  
- date-fns для форматирования дат  
- nanoid для id сущностей  
- `@vite-pwa/nuxt` для манифеста + Workbox  
- Vitest для unit/smoke тестов

## Common tasks

```bash
# установить зависимости (npm или pnpm)
npm install

# режим разработки
npm run dev

# сборка и предпросмотр
npm run build
npm run preview

# локальные тесты (useMoney, Pinia selectors, backup repository)
npm run test

# валидация AICODE-комментариев
npm run lint:aicode

# UI тесты (Playwright)
npm run test:ui
```

## Особенности

- Денежные значения хранятся как `amountMinor` (копейки); `useMoney` предоставляет `toMinor`, `fromMinor`, `formatMoney` и валидатор.
- `MoneyInput` предлагает цифровую клавиатуру, маску и кнопки быстрых сумм — его API нельзя ломать (v-model строка, quick amounts добавляют значение).
- `transactions`, `accounts`, `categories` хранятся в Pinia и обновляются через репозитории (`app/repositories/*`) с Zod-валидацией.
- JSON backup snapshot `{ version, exportedAt, accounts, categories, transactions, categoryAssignments }` валидируется схемой; импорт **перезаписывает** таблицы Dexie (см. `pages/settings.vue` предупреждения и `app/repositories/backup.ts` контракт).
- PWA-манифест хранится в `nuxt.config.ts`; service worker кеширует шрифт Google и прочие ассеты, а `AddToHomeBanner` подсказывает пользовательские действия на iOS.

## Search cookbook

- `rg -n "BACKUP_SNAPSHOT_VERSION|backupSnapshotSchema" app/types`
- `rg -n "importBackupSnapshot|createBackupSnapshot" app/repositories`
- `rg -n "version\\(" app/db/client.ts`
- `rg -n "amountMinor|moneyMinorSchema" app`
- `rg -n "categoryAssignments" app`
- `rg -n "MoneyInput" components pages`
- `rg -n "AddToHomeBanner|OfflineIndicator" components pages`
- `rg -n "pwa:|workbox|manifest" nuxt.config.ts`
- `rg -n "defineStore\\(" stores`
- `rg -n "transactionFiltersSchema|dateRangeFilterSchema" app/types/budget.ts`
- `rg -n "backup|import|export" pages/settings.vue app/repositories`

## Что проверить вручную

1. Скриншоты/сценарии `add→filter→export→import` в браузере (Vitest smoke/ручной прогон).  
2. Установка/офлайн на iPhone SE (Safari) — service worker должен работать, `AddToHomeBanner` исчезать, логика фильтров не ломаться.  
3. JSON экспорт/импорт с полной заменой Dexie и предпросмотром перед импорта.  
4. Lighthouse PWA (installable + offline ready + TTI < 2.5 с warm start).

## Что дальше

1. Полировка tests: добавить unit для `MoneyInput`, сторов/реп про `accounts` и `categories`, а также сценарий smoke add→filter→export→import.  
2. Запомнить результаты ручных проверок (iOS install/offline, JSON import warning) в `docs/status.md` (и при необходимости добавить AICODE-якорь рядом с кодом).  
3. Улучшить пустые состояния и базовую a11y, чтобы формы транзакций/категорий были удобны на клавиатуре и для фокус-режима.
