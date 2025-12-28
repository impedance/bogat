<!-- LEGACY: архивировано из memory-bank/techContext.md; новая схема: README + AICODE + docs/context.md + docs/status.md -->
# Tech Context — YNAB-lite PWA

## Core Stack
- **Framework**: Nuxt 3 (Vue 3 + Vite bundler).
- **Language**: TypeScript preferred; JavaScript acceptable with strict typing via Zod.
- **State Management**: Pinia stores wrapping Dexie queries and derived selectors.
- **Database**: IndexedDB accessed through Dexie.js.
- **Styling**: Tailwind CSS with minimalist utility usage.
- **PWA**: `@vite-pwa/nuxt` for service worker, manifest, and offline caching.
- **Date Utilities**: `date-fns` for formatting, parsing, and localization.
- **IDs**: `nanoid` for client-side entity identifiers.

## Tooling & Commands
- Initialize project via `npx nuxi init ynab-lite`, install dependencies with `pnpm`.
- Enable Nuxt modules: `@vite-pwa/nuxt`, `@nuxtjs/tailwind`.
- Optional TypeScript setup: `pnpm dlx tsc --init` plus `vue-tsc` for type checking.
- Unit tests run with Vitest (`npm run test`), configured in `vitest.config.ts` to use the `threads` pool since the sandbox rejects forked workers.

## Data Handling Standards
- `amountMinor` fields always represent minor units (`number` storing kopecks).
- All timestamps and dates stored as ISO strings; UI can present localized formats.
- Exported JSON payload matches plan specification (`version`, `exportedAt`, `accounts`, `categories`, `transactions`).
- Validation strategy: define entities/types in TypeScript, run all user/input surfaces (forms, actions) through Zod schemas, and validate import/export JSON with versioned Zod definitions before touching Dexie.

## Engineering Practices
- Clean Architecture (Uncle Bob) адаптирован под Nuxt: слои данных (Dexie repositories), домена (Pinia/composables) и UI отделены.
- SOLID применяется выборочно: SRP для composables, Open/Closed через композицию валидаторов/форм, Liskov/Interface Segregation соблюдаем при объявлении DTO.
- Hexagonal/Ports & Adapters: Dexie и потенциальный backend спрятаны за интерфейсами, чтобы легко связать синк или тестовые драйверы.
- Functional Core / Imperative Shell: чистые функции (`useMoney`, selectors) отделены от компонентов, что упрощает тесты.
- CQRS-lite: разделяем команды (actions) и запросы (getters/selectors) для читаемости и упрощения тестов.
- Repository pattern + Command helpers защищают Dexie от прямых обращений и дают точку для логирования/отката.
- Tailwind utility discipline + небольшие base-компоненты: избегаем CSS-спагетти, обеспечиваем переиспользуемые шаблоны.
- Accessibility и PWA guidelines: aria, фокус, доступный ввод сумм; сервис-воркер настроен по рекомендациям Google Web DevRel.

## Testing & Quality Expectations
- **Tier 1 (unit):** `useMoney` helpers, date/format normalizers, and other pure utilities protecting money math edge cases.
- **Tier 2 (store/validators):** Pinia selectors (балансы, фильтры, поиск) плюс Zod-схемы для форм и JSON импорта, проверяющие happy+error paths.
- **Tier 3 (smoke E2E):** один сценарий add → filter/search → export → import, подтверждающий связку Nuxt + Dexie + сервис-воркера.
- Lighthouse PWA audit must pass for installability and offline/fast metrics.

## Platform Constraints
- Target device baseline: iPhone SE 2022 (small viewport, limited CPU/RAM).
- Offline-first assumption: no reliance on network during runtime.
- Storage quotas on iOS require lean assets and awareness of IndexedDB limits.
