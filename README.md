# YNAB-lite PWA

Local PWA budget app built with Nuxt 4 + Tailwind and tuned for iPhone SE 2022.
It manages accounts/categories/transactions, shows a balances dashboard, works offline, and supports full JSON export/import with validation. Dexie is the system of record, Pinia is the reactive layer, and `@vite-pwa/nuxt` handles installability and service worker.

## For coding agents (read first)

1. Open `AGENTS.md` (repo protocol).
2. Use this `README.md` as the repo map, then read `docs/context.md` and `docs/status.md`.
3. Before changes run `rg -n "AICODE-"` and follow anchors (contracts/traps/notes).
4. If the index in README is stale or new entry points appeared, update it using the protocol in `AGENTS.md` and follow `docs/aicode-anchors.md`.

## Repository layout

- `app/composables/useMoney.ts` - money parsing/formatting; search: `rg -n "toMinor|fromMinor|formatMoney" app/composables`
- `app/db/client.ts` - Dexie schema/versions; search: `rg -n "version\\(" app/db/client.ts`
- `app/db/seed.ts` - default seeds; search: `rg -n "seedDefaults" app/db/seed.ts`
- `app/repositories/backup.ts` - snapshot export/import; search: `rg -n "importBackupSnapshot|createBackupSnapshot" app/repositories/backup.ts`
- `app/repositories/` - Dexie access with Zod validation; search: `rg -n "zod|parse" app/repositories`
- `app/types/budget.ts` - Zod schemas and snapshot version; search: `rg -n "BACKUP_SNAPSHOT_VERSION|backupSnapshotSchema" app/types/budget.ts`
- `components/MoneyInput.vue` - money input/mask; search: `rg -n "MoneyInput" components/MoneyInput.vue`
- `components/OfflineIndicator.vue` - offline indicator; search: `rg -n "OfflineIndicator" components`
- `components/AddToHomeBanner.vue` - iOS install hint; search: `rg -n "AddToHomeBanner" components`
- `pages/index.vue` - dashboard/balances; search: `rg -n "AICODE-NOTE" pages/index.vue`
- `pages/transactions.vue` - list and filters; search: `rg -n "filters|search" pages/transactions.vue`
- `pages/settings.vue` - backup/import UI; search: `rg -n "backup|import|export" pages/settings.vue`
- `stores/transactions.ts` - selectors/aggregations; search: `rg -n "defineStore\\('transactions'" stores`
- `stores/accounts.ts` - accounts store; search: `rg -n "defineStore\\('accounts'" stores`
- `stores/categories.ts` - categories store; search: `rg -n "defineStore\\('categories'" stores`
- `nuxt.config.ts` - PWA manifest/Workbox; search: `rg -n "pwa:|workbox|manifest" nuxt.config.ts`
- `app/assets/css/main.css` - global styles; search: `rg -n "tailwind|@layer" app/assets/css/main.css`
- `tests/` - unit/smoke tests; search: `rg -n "describe\\(" tests`
- `scripts/lint-aicode.sh` - AICODE validation; search: `rg -n "AICODE-" scripts/lint-aicode.sh`

## Entry points

- `nuxt.config.ts` - PWA/build config; search: `rg -n "pwa:|workbox" nuxt.config.ts`
- `app/db/client.ts` - Dexie schema/versions; search: `rg -n "version\\(" app/db/client.ts`
- `app/repositories/backup.ts` - snapshot import contract; search: `rg -n "importBackupSnapshot" app/repositories/backup.ts`
- `app/types/budget.ts` - Zod validation and snapshot version; search: `rg -n "backupSnapshotSchema|BACKUP_SNAPSHOT_VERSION" app/types/budget.ts`
- `components/MoneyInput.vue` - key money input UI; search: `rg -n "MoneyInput" components/MoneyInput.vue`
- `pages/index.vue` - dashboard with aggregates; search: `rg -n "AICODE-NOTE" pages/index.vue`
- `stores/transactions.ts` - balance selectors and filters; search: `rg -n "defineStore\\('transactions'" stores/transactions.ts`

## What is done

- Stage 0-2: Nuxt+Pinia scaffold, models/repositories, account/category/transaction forms, and MoneyInput with mask + quick amounts.
- Stage 3: PWA manifest/Workbox, OfflineIndicator, AddToHomeBanner and `nuxt.config.ts` for installable offline mode.
- Stage 4: JSON backup/import via `backupSnapshotSchema`, `app/repositories/backup.ts`, and `/settings` UI with preview and full-replace confirmation.
- Current focus: Stage 5 - polish (tests, empty states, a11y) + manual smoke add->filter->export->import and validation on iOS devices.

## Stack

- Nuxt 4 (Vite + Vue 3)
- Pinia + Dexie (IndexedDB)
- Tailwind CSS
- Zod for schemas and forms
- date-fns for date formatting
- nanoid for entity ids
- `@vite-pwa/nuxt` for manifest + Workbox
- Vitest for unit/smoke tests

## Common tasks

```bash
# install dependencies (npm or pnpm)
npm install

# dev mode
npm run dev

# build and preview
npm run build
npm run preview

# local tests (useMoney, Pinia selectors, backup repository)
npm run test

# AICODE comment validation
npm run lint:aicode

# UI tests (Playwright)
npm run test:ui
```

## Notes

- Money values are stored as `amountMinor` (minor units); `useMoney` provides `toMinor`, `fromMinor`, `formatMoney`, and a validator.
- `MoneyInput` offers numeric keyboard, mask, and quick-amount buttons - do not break its API (v-model string, quick amounts add to the value).
- `transactions`, `accounts`, `categories` live in Pinia and are updated through repositories (`app/repositories/*`) with Zod validation.
- JSON backup snapshot `{ version, exportedAt, accounts, categories, transactions, categoryAssignments }` is validated by schema; import fully replaces Dexie tables (see `pages/settings.vue` warnings and `app/repositories/backup.ts` contract).
- PWA manifest is in `nuxt.config.ts`; service worker caches Google font and other assets, and `AddToHomeBanner` guides iOS install steps.

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

## Manual checks

1. Screenshot/scenarios add->filter->export->import in browser (Vitest smoke/manual run).
2. Install/offline on iPhone SE (Safari) - service worker should work, `AddToHomeBanner` should disappear, filters should not regress.
3. JSON export/import with full Dexie replacement and preview before import.
4. Lighthouse PWA (installable + offline ready + TTI < 2.5 on warm start).

## Next steps

1. Polish tests: add unit tests for `MoneyInput`, stores/repos for `accounts` and `categories`, plus smoke add->filter->export->import.
2. Record manual checks (iOS install/offline, JSON import warning) in `docs/status.md` (and add AICODE anchor near code if needed).
3. Improve empty states and baseline a11y so transaction/category forms work well with keyboard and focus modes.
