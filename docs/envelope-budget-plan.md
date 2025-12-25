# План реализации: упрощённый «конвертный бюджет» (zero‑based, “к распределению”)

Цель: добавить в текущий YNAB‑lite PWA минимально‑достаточную версию zero‑based budgeting (“каждый рубль занят”), где **доходы увеличивают “К распределению”**, а пользователь **назначает** деньги по расходным категориям, получает **доступно/потрачено**, и может **перемещать** деньги между категориями.

## todo tasks
- [ ] T1 [Параллельно] Определить схемы бюджета и версию бэкапа v2. Контекст: §3/6 задают `monthKey`, `categoryAssignments`, `BACKUP_SNAPSHOT_VERSION = 2`. Действия: добавить в `app/types/budget.ts` `monthKeySchema` (regex `^\\d{4}-\\d{2}$`), `categoryAssignmentSchema` с `assignedMinor`, `createdAt/updatedAt`, экспорт типов; расширить `backupSnapshotSchema` полем `categoryAssignments` и поднять константу версии до 2. Минимальные тесты: Vitest в `tests/types/budget.test.ts` — happy/invalid кейсы для `monthKeySchema` (`2025-12` ок, `2025-1`/`2025-13` нет), `categoryAssignmentSchema` (отрицательные суммы/битые monthKey отклоняются), `backupSnapshotSchema` отвергает `version: 1` и принимает пустые назначения при `version: 2`.
- [ ] T2 [Параллельно] Подготовить миграцию Dexie v2 под таблицу назначений. Контекст: §3 «Dexie миграция» требует таблицу `categoryAssignments` с индексами `id, month, categoryId`. Действия: обновить `app/db/client.ts` до `version(2)` с новой таблицей, сохранить старые схемы без изменений. Минимальные тесты: Vitest интеграционный кейс в `tests/db/client.test.ts` — БД инициализируется с версией 2, таблица `categoryAssignments` доступна, запись/чтение `id='2025-12:cat_1'` проходит, запрос `where('month').equals('2025-12')` работает.
- [ ] T3 Поддержать назначения в репозитории бэкапов. Контекст: §6 «Backup/Import» — экспорт/импорт должен включать `categoryAssignments` в одной Dexie-транзакции (clear → bulkAdd). Действия: обновить `app/repositories/backup.ts` для сериализации/восстановления назначений с остальными таблицами. Минимальные тесты: расширить `tests/repositories/backup.test.ts` — снапшот содержит ключ `categoryAssignments` (в том числе пустой), импорт восстанавливает назначения вместе с остальными сущностями, импорт `version: 1` отдаёт ожидаемую ошибку (v2-only стратегия из §8).

## 1) Scope v1 (что делаем сейчас)

### Пользовательские возможности
- Отдельный экран **«Бюджет»** для выбранного месяца (по умолчанию — текущий).
- Метрика **«К распределению» (TBB)** для месяца.
- Таблица расходных категорий с колонками:
  - **Назначено** (editable)
  - **Потрачено** (derived из транзакций)
  - **Доступно** (derived: перенос + назначено − потрачено)
- Действие **«Переместить деньги»** между категориями (в рамках одного месяца) без изменения общего TBB.
- Подсветка **перерасхода** (доступно < 0) и быстрый CTA «Перекрыть».

### Осознанные упрощения v1
- Все счета считаем **on‑budget** (вынесение tracking/off‑budget — позже).
- Бюджетируем только **расходные категории** (`type: 'expense'`); доходные категории остаются для классификации, но не участвуют в «конвертах».
- Доходные транзакции (`type: 'income'`) всегда увеличивают пул денег, т.к. входят в on‑budget баланс (и, следовательно, в TBB).
- Нет целей/таргетов, scheduled/recurring, кредиток, split‑транзакций, правил overspending “как в YNAB”.

## 2) Контракты и расчёты (основная математика)

### Ключи месяцев
- Вводим `monthKey` в формате `YYYY-MM` (например `2025-12`).

### Потрачено (activity) по категории и месяцу
- `spentMinor(month, category)` = сумма **расходных** транзакций этой категории, попавших в месяц.
  - По текущей модели транзакции хранят `type` и `amountMinor`, поэтому расход — это `amountMinor` со знаком “+” в сумме потраченного (а в балансе счета он будет идти со знаком “−”).

### Назначено (assigned) по категории и месяцу
- `assignedMinor(month, category)` хранится отдельно (таблица назначений).
- Изменение назначений — единственный способ “занять рубли” в конвертах.

### Перенос (carryover) остатков
Для категории на начало месяца:
- `carryoverMinor(month, category)` = `sumAssigned(before month) - sumSpent(before month)`
  - где `before month` — все месяцы строго меньше выбранного.
  - Это даёт перенос без рекурсии по месяцам и без хранения агрегатов.

### Доступно (available) по категории и месяцу
- `availableMinor(month, category)` = `carryoverMinor + assignedMinor(month) - spentMinor(month)`
  - Месяц транзакции определяется как `format(parseISO(transaction.date), 'yyyy-MM')` без учёта часовых поясов; тесты должны покрывать границы месяца.

### “К распределению” (TBB) по месяцу
- `onBudgetBalanceMinor(monthEnd)` = сумма всех транзакций до `monthEnd` включительно: `income - expense`.
- `assignedCumulativeMinor(month)` = сумма `assignedMinor` по всем расходным категориям за месяцы `<= month`.
- **Контракт TBB (не гасит перерасход):** `tbbMinor(month) = onBudgetBalanceMinor(monthEnd) - assignedCumulativeMinor(month)`
  - Связка: `tbbMinor(month) + sum(availableMinor(month, expenseCategories)) = onBudgetBalanceMinor(monthEnd)`, поэтому любой минус на счетах уменьшает TBB и виден пользователю.

## 3) Изменения в данных (Zod + Dexie)

### Новые типы/схемы (`app/types/budget.ts`)
- `monthKeySchema` (regex `^\\d{4}-\\d{2}$`)
- `categoryAssignmentSchema`:
  - `id: string` (например `${monthKey}:${categoryId}`)
  - `month: monthKey`
  - `categoryId: string`
  - `assignedMinor: MoneyMinor`
  - `createdAt/updatedAt` (ISO)
- `BACKUP_SNAPSHOT_VERSION`: поднять до `2`.
- `backupSnapshotSchema`: расширить полем `categoryAssignments: CategoryAssignment[]`.

### Dexie миграция (`app/db/client.ts`)
- Поднять версию БД: `version(2)` и добавить таблицу `categoryAssignments`.
- Индексы (минимум): `categoryAssignments: 'id, month, categoryId'`.

### Репозиторий назначений (новый файл `app/repositories/assignments.ts`)
- `getAssignmentsForMonth(monthKey)`
- `setCategoryAssignment({ month, categoryId, assignedMinor })`:
  - upsert по `id = ${month}:${categoryId}`
  - обновляет timestamps
- `moveMoney({ month, fromCategoryId, toCategoryId, amountMinor })`:
  - в одной Dexie‑транзакции уменьшить assigned у `from`, увеличить у `to`
  - валидации: `amountMinor > 0`, `amountMinor <= available(fromCategoryId, month)`, категории различны, обе категории типа expense

## 4) Store и селекторы (Pinia)

### Новый store `stores/budget.ts`
- `state`:
  - `month: monthKey` (по умолчанию текущий)
  - `assignments: CategoryAssignment[]`
  - `isLoading`
- `actions`:
  - `setMonth(monthKey)` → fetch assignments
  - `fetchAssignments(monthKey)`
  - `setAssigned(categoryId, assignedMinor)`
  - `moveMoney(fromCategoryId, toCategoryId, amountMinor)`
- `getters` (производные):
  - `expenseCategories` (из `stores/categories`)
  - `spentByCategoryForMonth` (из `stores/transactions` + фильтрация по месяцу)
  - `carryoverByCategory` (через суммы до месяца)
  - `availableByCategory`
  - `tbbMinor`

Техническая цель: хранить в состоянии только “назначения”, а всё остальное вычислять из транзакций/категорий/назначений.

## 5) UI (страница Бюджета)

### Новая страница `pages/budget.vue`
- Header:
  - выбор месяца (минимально: prev/next и отображение `YYYY‑MM`)
  - карточка “К распределению” + подсказка
  - CTA “Переместить деньги”
- Таблица категорий (расходные):
  - строка категории
  - “Потрачено” (readonly)
  - “Назначено” (editable через `MoneyInput`)
  - “Доступно” (badge, красный если < 0)
  - CTA “Перекрыть” появляется при `available < 0` и открывает move‑dialog

### Компоненты (по необходимости)
- `components/MoveMoneyDialog.vue` (простая модалка):
  - from category, to category, amount (MoneyInput)
  - submit вызывает `budgetStore.moveMoney`

### Навигация
- Добавить пункт «Бюджет» в текущую навигацию (tab‑bar/меню).

## 6) Backup/Import (обязательное для корректности данных)

### `app/repositories/backup.ts`
- Включить `categoryAssignments` в `createBackupSnapshot()`.
- В `importBackupSnapshot()`:
  - добавить таблицу `categoryAssignments` в транзакцию очистки/восстановления
  - порядок: clear → bulkAdd

### `pages/settings.vue`
- В preview показать 4‑й счетчик: “Назначения”.
- Поддержать новый `version: 2`.

## 7) Тесты (Vitest)

### Unit: расчёты бюджета (новый тестовый файл)
- `tbbMinor` уменьшается при назначении денег в категорию.
- `moveMoney` не меняет `tbbMinor`, но переносит `available` между категориями.
- `available` реагирует на расходную транзакцию в выбранном месяце.
- `carryover` учитывает суммы назначений/расходов до месяца.

### Unit: backup v2 (обновить существующий тест)
- snapshot включает `categoryAssignments`
- import восстанавливает назначения и не ломает старые сущности
- импорт с `version: 1` даёт понятную ошибку (v2-only стратегия)

## 8) Совместимость и миграция

- Так как приложение ещё не запускалось и данных нет, берём **v2-only** стратегию: `BACKUP_SNAPSHOT_VERSION = 2`, импорт принимает только `version: 2` и выдаёт явную ошибку для v1.
- Миграции V1→V2 не нужны до появления реальных данных; можно добавить позднее, если потребуется совместимость.

## 9) Definition of Done (DoD)
- На странице “Бюджет” для текущего месяца:
  - видно TBB, список расходных категорий, назначение денег работает
  - “Потрачено” и “Доступно” корректно реагируют на добавление/редактирование транзакций
  - move money переносит сумму между категориями без изменения TBB
  - перерасход подсвечивается и есть быстрый способ “перекрыть”
- Экспорт/импорт JSON сохраняет и восстанавливает назначения.
- Есть unit‑тесты на ключевые расчёты (TBB/available/move/carryover) и на backup v2.

## 10) Дальнейшие расширения (после v1, без переделки основы)
- Off‑budget / tracking accounts и исключение их из `onBudgetBalance`.
- Цели (targets) и подсказки “сколько назначить”.
- Scheduled/recurring транзакции.
- Более точные правила overspending (перенос/сброс) и настройки “carryover on/off” на категорию.
- Кредитные карты и “payment category” модель.
