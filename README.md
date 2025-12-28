# YNAB-lite PWA

Локальный PWA-бюджет, собранный на Nuxt 4 + Tailwind и ориентированный на iPhone SE 2022.  
Приложение управляет счетами/категориями/транзакциями, показывает дашборд с балансами, работает офлайн и умеет экспортировать/импортировать весь набор данных в валидированный JSON. Dexie выступает системой записи, Pinia — реактивным слоем, а `@vite-pwa/nuxt` поддерживает установку и сервис-воркер.

## Для coding-агентов (прочитай первым)

1. Открой `AGENTS.md` (протокол работы в репо).
2. Используй этот `README.md` как карту репозитория, затем прочитай `docs/context.md` и `docs/status.md`.
3. Перед изменениями выполни `rg -n "AICODE-"` и следуй якорям (контракты/ловушки/почему).
4. Если индекс в README устарел или в проекте появились новые точки входа — обнови его по протоколу из `AGENTS.md` и соблюдай `docs/agent/anchor-scheme.md`.

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

## Как запускать

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
```

## Особенности

- Денежные значения хранятся как `amountMinor` (копейки); `useMoney` предоставляет `toMinor`, `fromMinor`, `formatMoney` и валидатор.
- `MoneyInput` предлагает цифровую клавиатуру, маску и кнопки быстрых сумм — его API нельзя ломать (v-model строка, quick amounts добавляют значение).
- `transactions`, `accounts`, `categories` хранятся в Pinia и обновляются через репозитории (`app/repositories/*`) с Zod-валидацией.
- JSON backup snapshot `{ version, exportedAt, accounts, categories, transactions }` валидируется схемой; импорт **перезаписывает** таблицы Dexie (см. `settings.vue` предупреждения и `app/repositories/backup.ts` контракт).
- PWA-манифест хранится в `nuxt.config.ts`; service worker кеширует шрифт Google и прочие ассеты, а `AddToHomeBanner` подсказывает пользовательские действия на iOS.

## Что проверить вручную

1. Скриншоты/сценарии `add→filter→export→import` в браузере (Vitest smoke/ручной прогон).  
2. Установка/офлайн на iPhone SE (Safari) — service worker должен работать, `AddToHomeBanner` исчезать, логика фильтров не ломаться.  
3. JSON экспорт/импорт с полной заменой Dexie и предпросмотром перед импорта.  
4. Lighthouse PWA (installable + offline ready + TTI < 2.5 с warm start).

## Что дальше

1. Полировка tests: добавить unit для `MoneyInput`, сторов/реп про `accounts` и `categories`, а также сценарий smoke add→filter→export→import.  
2. Запомнить результаты ручных проверок (iOS install/offline, JSON import warning) в `docs/status.md` (и при необходимости добавить AICODE-якорь рядом с кодом).  
3. Улучшить пустые состояния и базовую a11y, чтобы формы транзакций/категорий были удобны на клавиатуре и для фокус-режима.
