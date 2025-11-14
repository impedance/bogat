# System Patterns — YNAB-lite PWA

## Architecture Overview
- **Local-first**: IndexedDB (via Dexie.js) is the authoritative store. Все CRUD-операции и бизнес-логика выполняются на клиенте, включая экспорт/импорт JSON.
- **Nuxt 3 SPA/PWA**: Nuxt управляет маршрутизацией, hydration и PWA-shell'ом; `@vite-pwa/nuxt` подключён сразу для installable офлайн-режима.
- **State Layer**: Pinia stores оборачивают Dexie, обеспечивают реактивные селекторы балансов, фильтров и результатов поиска.
- **Data Flow**: Формы пишут в Dexie; UI подписывается на Pinia getters и отображает агрегаты/списки на лету. Экран бэкапа читает/пишет в Dexie через репозитории.
- **PWA Layer**: Сервис-воркер кеширует приложение и последние данные; офлайн режим сохраняет возможность CRUD, фильтров и JSON экспорта.

## Data Modeling Patterns
- Money values хранятся как `amountMinor` (копейки). Общие helpers `toMinor`/`fromMinor` обязательны для валидации и форматирования.
- Сущности содержат ISO `createdAt`/`updatedAt` и флаги `archived?`, чтобы поддерживать soft-delete.
- Dexie таблицы: `accounts` (cash/card/bank, currency=RUB), `categories` (income/expense, `isDefault`), `transactions` (accountId, categoryId, type, amountMinor, note, date). Все таблицы используют `nanoid` как primary key.
- Индексы: `transactions.accountId`, `transactions.categoryId`, `transactions.date`, `transactions.type` — обеспечивают фильтры/поиск; дополнительные compound индексы добавим по мере роста.
- Экспорт/импорт: версионный JSON `{ version, exportedAt, accounts, categories, transactions }`; импорт валидирует данные, обновляет записи по `id` и оставляет конфликтное разрешение пользователю.
- Валидация на трёх уровнях: модели Dexie/Pinia описаны через TypeScript интерфейсы, каждый UI/форма/экшен прогоняет данные через Zod перед записью, а импорт/экспорт JSON использует строгую Zod-схему с проверкой версии.
- Сид данных: при первой миграции в `categories` добавляется набор дефолтов (еда, транспорт, жильё, доход и т.п.); пользователь может добавлять/архивировать категории и счета.

## UI/UX Patterns
- Tailwind utility classes; верстка оптимизирована под iPhone SE и десктоп.
- **Dashboard**: показывает общий баланс, список счетов с балансами, быстрый фильтр по счёту.
- **Transaction List**: обратная хронология + фильтры (счёт, категория, период) и поиск по заметке; отображает денормализованные имена.
- **Forms**: отдельные компоненты для счетов, категорий, транзакций; валидация через Zod/TS, money helper применяет `toMinor`.
- **Backup Screen**: экспорт JSON (скачать файл) и импорт (файл → валидация → Dexie). UI информирует о дате последнего экспорта.
- Пустые состояния напоминают создать счёт/категорию, подсказки по JSON-бэкапам и офлайн-режиму.

## Future Evolutions (Not in MVP but planned)
- Optional backend sync using last-write-wins per `updatedAt` timestamp.
- Additional tables for budgets, scheduled transactions, and reports once MVP stabilizes.
