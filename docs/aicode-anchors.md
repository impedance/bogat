# AICODE-якоря — правила и схема (универсально, переносимо между репозиториями)

Этот документ объединяет:
- **нормативные правила** AICODE-якорей (разрешённые префиксы, формат, lifecycle);
- **схему тем/неймспейсов** внутри текста якорей;
- **примеры** и рекомендации по размещению.

Если требования кажутся противоречивыми, приоритет у **нормативных правил** из этого документа.

Цель: большая часть контекста живёт **рядом с кодом** и находится через `rg -n "AICODE-"`.

---

## 0) Принципы (что значит “хорошо”)

- Якоря **находимы**: всегда ищутся через `rg`.
- Якоря **действующие**: поясняют, что нельзя ломать, почему, где источник истины.
- Якоря **поддерживаются**: устаревшие удаляются или конвертируются.
- Якоря **локальны**: ставятся рядом с кодом, не заменяют общий дневник проекта.

## 1) Быстрый старт (обязательный)

Перед тем как глубоко читать код:
- MUST искать существующие якоря в репозитории: `rg -n "AICODE-"`.
- SHOULD сузить поиск до модуля: `rg -n "AICODE-" app/repositories`.
- Разрешённые теги: `AICODE-NOTE`, `AICODE-TODO`, `AICODE-CONTRACT`, `AICODE-TRAP`, `AICODE-LINK`, `AICODE-ASK`.
- Долгоживущие теги (`CONTRACT/TRAP`) MUST иметь дату `[YYYY-MM-DD]` в той же строке.

После выполнения задачи:
- MUST обновить/удалить якоря в затронутых местах.

## 2) Когда добавлять или обновлять якорь

Добавляй/обновляй `AICODE-*:` если код:
- **неочевидный** (инвариант не выводится из кода “с ходу”);
- **важный** (ядро бизнес-логики/пайплайна);
- **хрупкий** (сложные крайние случаи, порядок шагов, условия).

Якоря **обязательны**, если:
- кто-то может “упростить” код и сломать требование;
- логика повторяет легаси/патч;
- зона известна регрессиями или имеет большой blast radius.

## 3) Разрешённые типы якорей (только один на строку)

- **Долгоживущие (обязательна дата):** `AICODE-TRAP:`, `AICODE-CONTRACT:`.
- **Склейки/ссылки:** `AICODE-LINK:` (доки/тесты/смежные файлы; дата не нужна).
- **Сессионные:** `AICODE-NOTE:` (рационал/инвариант), `AICODE-TODO:` (локальная очередь), `AICODE-ASK:` (вопрос к команде).

## 4) Правила формата (grep-friendly)

### 4.1 Синтаксис
- Используй корректный комментарий языка (`#`, `//`, `/* */`, …).
- Первая строка **должна начинаться** с разрешённого префикса из §3.
- Первая строка **самодостаточна**: понятна прямо из `rg` без контекста.

### 4.2 Содержание (что полезно указать)

Хороший якорь отвечает хотя бы на 1–2 вопроса:
- **Почему** так сделано? (рационал/компромисс)
- **Какой инвариант** нельзя менять? (порядок, маппинг, “must not change”)
- **Какие edge cases** критичны?
- **Где источник истины?** (док/тест/спека)

Рекомендуемые поля (кратко):
- `ref:` файл/док/тест
- `scope:` компонент/функция
- `risk:` что сломается
- `test:` что покрыть/обновить
- `decision:` принятое решение
- `owner:` кто должен решать (если применимо)

Шаблоны:
- `AICODE-NOTE: <invariant or why>; ref: <path>; risk: <impact>`
- `AICODE-TODO: <follow-up>; why: <reason>; scope: <component>; test: <test>`
- `AICODE-ASK: <question?>; decision: <what is needed>; impact: <what changes>`

## 5) Схема тем внутри текста (namespace)

Принцип: **префикс фиксирован, тема внутри текста**. Мы **не** вводим новые префиксы типа `AICODE-STATUS:`.

Пример:
```ts
// AICODE-NOTE: NAV/REPO-LAYOUT — краткая карта ключевых путей; ref: README.md; risk: агент будет блуждать
// AICODE-NOTE: STATUS/FOCUS — текущий фокус и next steps; ref: docs/status.md
// AICODE-NOTE: DECISION/ADR-0001 — почему выбрали AICODE+README как навигационный слой; ref: docs/decisions/ADR-0001-anchor-navigation.md
```

### Namespace после `:`
- `NAV/<slug>` — навигационные якоря (точки входа, ключевые места).
- `CONTRACT/<slug>` — поведенческие инварианты (используй с `AICODE-CONTRACT:`).
- `TRAP/<slug>` — острые углы/регрессии (используй с `AICODE-TRAP:`).
- `DECISION/<id>` — архитектурные решения (ADR).
- `STATUS/<slug>` — операционный статус (используй только в `docs/status.md`).
- `TEST/<slug>` — где проверять/какие тесты.

Стилизация `slug`:
- `kebab-case` или `SCREAMING_SNAKE`;
- важна стабильность и уникальность.

### Маппинг “тип знания” → AICODE-префикс

- Контракт/инвариант: `AICODE-CONTRACT: CONTRACT/<slug> — ... [YYYY-MM-DD]`
- Ловушка/регрессия: `AICODE-TRAP: TRAP/<slug> — ... [YYYY-MM-DD]`
- Навигация/заметка: `AICODE-NOTE: NAV/<slug> — ...`
- Склейки: `AICODE-LINK: ...`
- Очередь работы: `AICODE-TODO: ...` (удалять/конвертировать после выполнения)
- Вопрос: `AICODE-ASK: <question?>; decision: <что нужно>; impact: <что меняется>`

## 6) Где ставить якоря (приоритеты)

1) **Entry points**
   - main/bootstrap/config
   - инициализация хранилища/миграции/схема
   - data access (repositories/adapters/clients)
   - состояние/селекторы/агрегации (stores/selectors)
   - критичные UI-компоненты/handlers

2) **Инварианты данных**
   - деньги в minor units
   - правила импорта/экспорта snapshot
   - индексы/версия Dexie

3) **Острые углы**
   - iOS/PWA особенности
   - tricky edge cases в фильтрах/селекторах

4) **Ссылки**
   - `AICODE-LINK:` на тесты/доки/смежные файлы

## 7) Как не разрастаться

- На одну “зону” кода обычно достаточно 1–3 якорей.
- Если `rg -n "AICODE-" <директория>` даёт десятки совпадений — сгруппируй: оставь 1 якорь‑индекс + `AICODE-LINK:`.
- Решённые `AICODE-TODO` удаляй или конвертируй в `AICODE-NOTE`.
- Закрытые `AICODE-ASK` конвертируй в `AICODE-NOTE` с `decision:` и `ref:`.

## 8) Lifecycle (чтобы якоря не устаревали)

- MUST обновить или удалить якоря после изменения поведения.
- `AICODE-TODO` → удалить или конвертировать в `AICODE-NOTE`.
- `AICODE-ASK` → заменить на `AICODE-NOTE` с решением и `ref:`.

## 9) Анти-паттерны (чего нельзя делать)

- Не повторяй очевидное (“increment i”, “sort list”).
- Не пиши эссе или логи — якорь должен быть коротким.
- Не размещай секреты/токены/чувствительные данные.
- Не используй `AICODE-TODO:` как замену трекингу задач (для этого `docs/todo.md`).
- Не оставляй двусмысленность (“maybe”, “probably”), если это не `AICODE-ASK:`.

## 10) Примеры

### NOTE — инвариант + источник истины
```python
# AICODE-NOTE: traversal order is index → numeric → alpha (recursive); ref: docs/hierarchy-analysis.md; risk: TOC/section order regressions
```

### NOTE — ссылка на тесты/спеку
```python
# AICODE-NOTE: image path mapping strips numeric prefixes and targets /images/<slug>/...; ref: tests/test_images.py; risk: broken asset links in bundle.md
```

### TODO — локальный follow-up
```python
# AICODE-TODO: add a unit test for the tagged-PDF fallback branch; scope: pandoc_runner.render; test: tests/test_pandoc_runner.py
```

### ASK — требует решения
```python
# AICODE-ASK: should missing assets fail the pipeline or be replaced by a placeholder by default? impact: pipeline.validate_images
```

### CONTRACT — инвариант поведения с датой
```typescript
// AICODE-CONTRACT: Import replaces the target store fully (no merge); ref: <path>; risk: partial restore corrupts derived state [2025-01-15]
```

### Anti-example (слишком расплывчато)
```python
# AICODE-NOTE: this is tricky, be careful
```

## 11) Как искать якоря

- Все якоря: `rg -n "AICODE-"`.
- Только каноничные префиксы: `rg -n "AICODE-(NOTE|TODO|CONTRACT|TRAP|LINK|ASK):"`.

## 12) Рекомендуемые “якоря‑индексы” для этого репозитория

Эти якоря полезно иметь (если их ещё нет) как стабильные точки входа:
- `AICODE-NOTE: NAV/README-INDEX — README как карта репозитория; ref: README.md`
- `AICODE-NOTE: NAV/ENTRYPOINT — основная точка входа; ref: <path>`
- `AICODE-NOTE: NAV/STORAGE-SCHEMA — схема/миграции хранилища; ref: <path>`
- `AICODE-NOTE: NAV/CORE-FLOW — основной бизнес-поток; ref: <path>`
- `AICODE-NOTE: NAV/TESTS — где проверять ключевые контракты; ref: <path>`
