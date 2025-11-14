# План разработки: YNAB‑lite PWA (iPhone SE 2022 + Web)

**Версия:** 1.0 • **Дата:** 2025-10-21
**Стиль:** Tailwind (минимализм) • **Подход:** Local‑first (без бэкенда на старте) • **Язык:** JS/TS (рекомендуется TS)

---

## 1) Цели MVP
- Вести **доходы/расходы**.
- Видеть **остаток денег**: по счёту и общий.
- **Категории** (базовые + пользовательские).
- **Фильтры** по дате/категории/счёту, **поиск**.
- **Экспорт/импорт** данных в JSON.
- Работает **офлайн** как PWA на iPhone SE 2022 (и в браузере).

**Вне MVP (на потом):** синхронизация между устройствами, авторизация, бюджеты «каждый рубль занят», планировщик, напоминания, отчёты/графики, мультивалюта.

---

## 2) Ключевые пользовательские сценарии
1. **Добавить расход/доход**: выбрать счёт, сумму, категорию, дату, заметку → сохранить.
2. **Посмотреть остаток**: открыть «Дашборд» → общий баланс и балансы счетов.
3. **Найти операции**: фильтры по периоду/категории/счёту + поиск по заметке.
4. **Настроить категории**: включить дефолтные, добавить свои.
5. **Бэкап/восстановление**: выгрузить JSON, импортировать JSON.

---

## 3) Технический стек (MVP)
- **Framework:** Nuxt 3 (Vue 3 + Vite).
- **Стили:** Tailwind CSS (минимальные утилити‑классы).
- **State:** Pinia.
- **Локальная БД:** IndexedDB через **Dexie.js**.
- **PWA:** `@vite-pwa/nuxt` (Service Worker, манифест, офлайн‑кеш).
- **Дата/время:** `date-fns` (легко и локализуемо).
- **Валидации:** трёхуровневая стратегия — модели описываем в TypeScript, каждая пользовательская форма/экшен проходит Zod-схему перед записью, а JSON экспорт/импорт валидируется строгой Zod-схемой с проверкой `version`.
- **Формат денег:** целые «минорные» единицы (копейки).

> **Почему так:** одна кодовая база для iPhone SE и веб; офлайн‑устойчивость; быстрый старт; минимум зависимостей.

---

## 4) Архитектура (Local‑first)
- Все данные хранятся **локально** (IndexedDB). Никакого сервера в MVP.
- **Экспорт/импорт JSON** — способ переносить данные/делать бэкапы.
- Расчёты балансов — **деривативные селекторы** (не дублируем суммы).
- Денежные значения — **целые числа в копейках** (избегаем ошибок float).

**На будущее (синк):**
- Добавить лёгкий бэкенд (Supabase или Cloudflare Workers + D1).
- Эндпоинт `/sync` с LWW‑стратегией (last‑write‑wins по `updatedAt`).

---

## 5) Модель данных (минимум)

```ts
// money в «копейках» (integer)
type MoneyMinor = number; // напр. 1999 = 19.99 ₽

// Счёт (карта, наличные, банк)
interface Account { 
  id: string;
  name: string;
  type: 'cash' | 'card' | 'bank';
  currency: 'RUB';          // MVP — одна валюта
  createdAt: string;        // ISO
  archived?: boolean;
}

// Категория
interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  isDefault?: boolean;
  archived?: boolean;
}

// Транзакция
interface Transaction {
  id: string;
  accountId: string;
  type: 'income' | 'expense';
  amountMinor: MoneyMinor;  // всегда целые минорные единицы
  categoryId: string;
  note?: string;
  date: string;             // ISO (локальная дата операции)
  createdAt: string;        // ISO
  updatedAt: string;        // ISO
}
```

**Индексы (Dexie):** по `accountId`, `date`, `categoryId`, `type`.

---

## 6) Экспорт/импорт JSON (спецификация)

```json
{
  "version": 1,
  "exportedAt": "2025-10-21T00:00:00.000Z",
  "accounts": [ { "id": "acc_...", "name": "Кошелёк", "type": "cash", "currency": "RUB", "createdAt": "..." } ],
  "categories": [ { "id": "cat_food", "name": "Еда", "type": "expense", "isDefault": true } ],
  "transactions": [ { "id": "txn_...", "accountId": "acc_...", "type": "expense", "amountMinor": 15900, "categoryId": "cat_food", "note": "обед", "date": "2025-10-21", "createdAt": "...", "updatedAt": "..." } ]
}
```

**Правила импорта:**  
- `version` поддерживается для миграций.  
- По умолчанию **добавляем как новые** (без авто‑слияния).  
- (Опция позже) «умное слияние» по `id` с подтверждением конфликтов.

---

## 7) Экраны и UX (iPhone SE 2022)
1. **Дашборд**: общий баланс, список счетов (balance badge), «+» (новая транзакция).
2. **Транзакции**: список, фильтры (период/счёт/категория), поиск по заметке.
3. **Новая/Редактировать**: тип (доход/расход), сумма, счёт, категория, дата, заметка.
4. **Категории**: дефолтные + пользовательские (добавить/архивировать).
5. **Настройки**: экспорт/импорт, валюта (RUB), сброс демо‑данных.

**Навигация:** нижний таб‑бар (4–5 вкладок). **Размеры:** крупные тапы (44px), без перегруза.  
**Ввод суммы:** цифровая клавиатура, маска с 2 знаками.  
**Пустые состояния:** дружелюбные подсказки + быстрые действия.

---

## 8) Состояние и бизнес‑правила
- Pinia‑сторы: `accounts`, `categories`, `transactions`, `ui`.
- Селекторы: баланс по счёту, общий баланс, суммы по категориям/периоду.
- Валидации при сохранении: сумма > 0, валидные связи account/category.
- Редактирование/удаление транзакции — пересчитывает производные селекторы.
- Архивация категории/счёта не ломает историю (только скрывает из форм).

---

## 9) Структура проекта (Nuxt 3 + Tailwind)

```
/app
  /components
    AccountCard.vue
    TransactionItem.vue
    MoneyInput.vue
    EmptyState.vue
  /composables
    useMoney.ts        # форматирование/парсинг
    useFilters.ts
  /db
    dexie.ts           # схема БД, индексы, миграции
    seed.ts
  /pages
    index.vue          # Дашборд
    accounts.vue
    categories.vue
    transactions.vue
    settings.vue
    transactions/new.vue
    transactions/[id].vue
  /stores
    accounts.ts
    categories.ts
    transactions.ts
    ui.ts
  /utils
    dates.ts
    ids.ts             # nanoid
  /public
    icon.png
  /pwa
    manifest.webmanifest
    sw.ts
  tailwind.config.ts
  nuxt.config.ts
```

---

## 10) План работ (Roadmap)

### Этап 0 — Скелет (0.5–1 дн.) ✅
- [x] Nuxt 3 инициализация, Tailwind, Pinia.
- [x] `@vite-pwa/nuxt`, манифест, базовый SW.
- [x] Заготовки страниц и навигации.

### Этап 1 — Данные и CRUD (1–3 дн.)
- [ ] Dexie: таблицы `accounts`, `categories`, `transactions` + индексы.
- [ ] CRUD аккаунтов и категорий; дефолтные категории (seed).
- [ ] Селекторы балансов.

### Этап 2 — Транзакции и расчёты (2–4 дн.)
- [ ] Форма «Новая/Редактировать» с валидациями.
- [ ] Лента операций, фильтры, поиск.
- [ ] Маска MoneyInput, быстрые суммы.

**Browser MVP (текущий фокус):** Этапы 0–2. После их завершения приложение уже полностью работает в браузере (CRUD, фильтры, поиск) и может использоваться без офлайн-установки.

### Этап 3 — PWA и офлайн (1 дн.)
- [ ] Кэш ассетов/роутов, офлайн‑тест на iPhone SE.
- [ ] «Добавить на Домой» (iOS инструкции).

### Этап 4 — Бэкап (0.5–1 дн.)
- [ ] Экспорт JSON (версионированный).
- [ ] Импорт JSON (валидации, предпросмотр, подтверждение).

### Этап 5 — Полировка (1–2 дн.)
- [ ] Пустые состояния, мелкие анимации.
- [ ] Улучшение доступности (A11y).

> **Итого MVP:** 1–2 недели спокойной сборки одним разработчиком. Переход к Этапам 3–5 планируется после завершения Browser MVP.

---

## 11) Команды установки/настройки (под JS/TS)

```bash
# 1) Проект
npx nuxi init ynab-lite
cd ynab-lite
pnpm i

# 2) Пакеты
pnpm add pinia dexie date-fns nanoid zod
pnpm add -D @vite-pwa/nuxt @nuxtjs/tailwind typescript vue-tsc

# 3) Включить модули в nuxt.config.ts
# modules: ['@vite-pwa/nuxt', '@nuxtjs/tailwind']

# 4) Инициализировать TS (опционально)
pnpm dlx tsc --init
```

**Tailwind:** базовая типографика, без кастомных тем.  
**PWA:** иконки 512/192 px, `display: standalone`, `start_url: "/"`.

---

## 12) Критерии готовности (DoD)
- Все сценарии из §2 выполняются офлайн.
- База не «ломается» при редактировании/удалении.
- Экспорт/импорт JSON отрабатывает без потерь.
- Lighthouse PWA: **Installable** + офлайн OK.
- TTI на iPhone SE < 2.5 c при тёплом старте (ориентир).

---

## 13) Тестирование
- **Слой 1 (unit):** `useMoney`, нормализация дат/ввода, любые чистые helper'ы, которые затрагивают деньги/фильтры.
- **Слой 2 (store/validators):** Pinia селекторы для балансов/поиска плюс Zod-схемы форм/JSON импорта (happy + error cases) — главное место для регрессии.
- **Слой 3 (smoke E2E):** один сценарий добавить→отфильтровать→экспорт→импорт, прогоняемый on-demand/перед релизом, чтобы покрыть Nuxt+Dexie+PWA связку.
- Smoke на iPhone SE (Safari): холодный/тёплый старт, офлайн.

---

## 14) Деплой
- **Статический хостинг:** Cloudflare Pages / Netlify / Vercel.
- Требуется HTTPS‑origin для PWA.
- Версионируем схему (миграции Dexie) при релизах.

---

## 15) Следующие фазы (после MVP)
- **Синхронизация**: Supabase (Postgres + Auth) или Cloudflare Workers + D1.
- **Auth:** Magic link / Passkeys.
- **Бюджеты** (YNAB‑логика распределения средств).
- **Планировщик** и «запланированные транзакции».
- **Отчёты**: по категориям/месяцам, кэшируемые агрегации.
- **Мультивалюта** и курсы (локальные кэши).

---

## 16) Риски и решения
- **Потеря данных пользователем:** регулярный **экспорт JSON** (подсказки в UI).
- **iOS PWA ограничения:** протестировать storage quota; избегать больших бинарников.
- **Миграции Dexie:** сохранять `version` экспорта, писать миграции idempotent.
- **Формат денег:** только целые «minor units», Money helpers обязательны.

---

## 17) Набор дефолтных категорий (пример)
**Расходы:** Еда, Транспорт, Жильё, Коммунальные, Связь, Одежда, Здоровье, Развлечения, Путешествия, Образование, Подарки, Прочее.  
**Доходы:** Зарплата, Фриланс, Проценты, Подарки, Прочее.

---

## 18) Полезные утилиты (эскизы)

```ts
// useMoney.ts
export function toMinor(input: string): number {
  // "19,99" | "19.99" -> 1999
  const normalized = input.replace(',', '.').trim();
  const [int, frac=''] = normalized.split('.');
  const frac2 = (frac + '00').slice(0, 2);
  return Number(int) * 100 + Number(frac2);
}
export function fromMinor(minor: number): string {
  const sign = minor < 0 ? '-' : '';
  const abs = Math.abs(minor);
  const rub = Math.floor(abs / 100);
  const kop = String(abs % 100).padStart(2, '0');
  return `${sign}${rub}.${kop}`;
}
```

```ts
// dexie.ts (эскиз)
import Dexie, { Table } from 'dexie';

export interface DBSchema extends Dexie {
  accounts: Table<Account, string>;
  categories: Table<Category, string>;
  transactions: Table<Transaction, string>;
}

export const db = new Dexie('ynab_lite') as DBSchema;

db.version(1).stores({
  accounts: 'id, name, type, createdAt',
  categories: 'id, name, type',
  transactions: 'id, accountId, categoryId, type, date'
});
```
---

**Готово к старту.** С этого плана можно сразу инициализировать репозиторий и приступить к сборке MVP.
