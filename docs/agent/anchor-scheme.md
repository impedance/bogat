# Схема AICODE-якорей (универсальная, переносимая между репозиториями)

Цель: сделать так, чтобы большая часть контекста жила **рядом с кодом** и находилась через `rg -n "AICODE-"`.

Нормативные правила (разрешённые префиксы, даты, формат первой строки, lifecycle) см. `docs/agent/ai-anchors.md`.
При конфликте требований приоритет у `docs/agent/ai-anchors.md`.

---

## Принцип: “префикс фиксированный, тема внутри текста”

Мы **не** кодируем тему в префиксе (нельзя вводить `AICODE-STATUS:` и т.п.).
Вместо этого используем “namespace” внутри текста первой строки:

```ts
// AICODE-NOTE: NAV/REPO-LAYOUT — краткая карта ключевых путей; ref: README.md; risk: агент будет блуждать
// AICODE-NOTE: STATUS/FOCUS — текущий фокус и next steps; ref: docs/status.md
// AICODE-NOTE: DECISION/ADR-0001 — почему выбрали AICODE+README вместо Memory Bank; ref: docs/decisions/ADR-0001-anchor-navigation.md
```

### Namespace внутри текста (после `:`)
- `NAV/<slug>` — навигационные якоря (точки входа, ключевые места).
- `CONTRACT/<slug>` — поведенческие инварианты (используй с `AICODE-CONTRACT:`).
- `TRAP/<slug>` — острые углы/регрессии (используй с `AICODE-TRAP:`).
- `DECISION/<id>` — архитектурные решения (ADR).
- `STATUS/<slug>` — краткий “операционный” статус (используй только в `docs/status.md`, не в прод‑коде).
- `TEST/<slug>` — как проверить/где тесты на правило.

Стилизация slug:
- `kebab-case` или `SCREAMING_SNAKE` — важно только одно: стабильность и уникальность.
- Лучше коротко и “поисково”: `NAV/DEXIE-SCHEMA`, `CONTRACT/BACKUP-IMPORT-REPLACES-DB`.

### Маппинг “тип знания” → AICODE-префикс

- Контракт/инвариант: `AICODE-CONTRACT: CONTRACT/<slug> — ... [YYYY-MM-DD]`
- Ловушка/регрессия/опасный край: `AICODE-TRAP: TRAP/<slug> — ... [YYYY-MM-DD]`
- Причина/рационал: `AICODE-WHY: <topic> — ... [YYYY-MM-DD]`
- Факт домена/ограничение: `AICODE-FACT: <topic> — ... [YYYY-MM-DD]`
- Навигационная подсказка/локальная заметка: `AICODE-NOTE: NAV/<slug> — ...`
- Склейка мест/доков/тестов: `AICODE-LINK: ...`
- Очередь локальной работы: `AICODE-TODO: ...` (удалять/конвертировать после выполнения)

---

## Где ставить якоря (приоритеты)

1) **Entry points**
   - Точки входа приложения (main/server/bootstrap/config)
   - Инициализация хранилища/миграции/схема
   - Слой доступа к данным (repositories/adapters/clients)
   - Состояние/селекторы/агрегации (stores/selectors)
   - Критические компоненты UI/handlers (если есть)

2) **Инварианты данных**
   - money в minor units
   - правила импорта/экспорта snapshot
   - индексы и версия Dexie

3) **Острые углы**
   - iOS/PWA особенности
   - tricky edge cases в фильтрах/селекторах

4) **Ссылки**
   - `AICODE-LINK:` на тесты/доки/смежные файлы (особенно полезно при переездах).

---

## Как держать якоря “неразрастающимися”

- На одну “зону” кода обычно достаточно 1–3 якорей.
- Если `rg -n "AICODE-" <директория>` даёт десятки совпадений — сгруппируй: оставь 1 якорь‑индекс + `AICODE-LINK:`.
- Решённые `AICODE-TODO` удаляй или конвертируй в `AICODE-NOTE`.
- Закрытые вопросы `AICODE-QUESTION` конвертируй в `AICODE-NOTE` с `decision:` и `ref:`.

---

## Рекомендуемые “якоря‑индексы” для этого репо

Эти якоря удобно иметь (если их ещё нет) как устойчивые точки входа для `rg` (адаптируй под репозиторий):
- `AICODE-NOTE: NAV/README-INDEX — README как карта репозитория; ref: README.md`
- `AICODE-NOTE: NAV/ENTRYPOINT — основная точка входа; ref: <path>`
- `AICODE-NOTE: NAV/STORAGE-SCHEMA — схема/миграции хранилища; ref: <path>`
- `AICODE-NOTE: NAV/CORE-FLOW — основной бизнес-поток; ref: <path>`
- `AICODE-NOTE: NAV/TESTS — где проверять ключевые контракты; ref: <path>`
