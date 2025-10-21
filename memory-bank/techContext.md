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

## Data Handling Standards
- `amountMinor` fields always represent minor units (`number` storing kopecks).
- All timestamps and dates stored as ISO strings; UI can present localized formats.
- Exported JSON payload matches plan specification (`version`, `exportedAt`, `accounts`, `categories`, `transactions`).

## Testing & Quality Expectations
- Unit tests for money utilities (`useMoney`) and balance selectors.
- E2E smoke flow: add transaction → filter/search → export → import.
- Lighthouse PWA audit must pass for installability and offline/fast metrics.

## Platform Constraints
- Target device baseline: iPhone SE 2022 (small viewport, limited CPU/RAM).
- Offline-first assumption: no reliance on network during runtime.
- Storage quotas on iOS require lean assets and awareness of IndexedDB limits.
