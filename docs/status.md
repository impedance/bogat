# Статус проекта (коротко)

<!-- AICODE-NOTE: STATUS/FOCUS — “живой” текущий фокус и next steps вместо длинного дневника; ref: README.md; risk: агент будет делать не то -->
<!-- AICODE-NOTE: STATUS/ENTRY — начни чтение с README, затем ищи якоря: rg -n "AICODE-" -->

## Сейчас в фокусе
- Stage 5: тесты/полировка/a11y, smoke add→filter→export→import, ручной iOS install/offline.

## Следующие шаги (top 5)
1) Покрыть unit‑тестами `components/MoneyInput.vue` и ключевые сторы/репозитории.
2) Смоук add→filter→export→import (Vitest/Playwright/ручной прогон) и фиксация результатов.
3) Пустые состояния и базовая a11y (фокус, aria, клавиатура).
4) Ручная проверка iOS (iPhone SE): install/offline + AddToHomeBanner + SW.
5) Локальная проверка “контрактов” (AICODE) перед рефакторингами.

## Известные риски
- Регрессии в расчётах балансов/фильтров при оптимизациях UI/сторов.
- “Тихие” поломки backup/import при изменениях схем/версий Dexie.

## Как быстро сориентироваться (поиск)
- Все якоря: `rg -n "AICODE-"`
- Только контракты/ловушки: `rg -n "AICODE-(CONTRACT|TRAP|WHY|FACT|HISTORY):"`
- Импорт/экспорт: `rg -n "backup|snapshot|import|export" app docs pages components stores`

