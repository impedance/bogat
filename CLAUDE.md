# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

YNAB-lite is an offline-first Progressive Web App (PWA) for personal finance management, built on Nuxt 3 + Vue 3, Pinia, Dexie (IndexedDB), and Tailwind CSS. It targets iPhone SE 2022 Safari and modern desktop browsers, prioritizing speed and privacy with no backend dependency.

**Core Stack:**
- Nuxt 4 (Vite + Vue 3)
- Pinia + Dexie (IndexedDB)
- Tailwind CSS (minimal, utility-first)
- Zod for schema validation
- date-fns for date formatting
- nanoid for ID generation
- @vite-pwa/nuxt for PWA manifest and Workbox service worker
- Vitest for unit and smoke tests

## Development Commands

```bash
# Install dependencies
npm install

# Development server (hot reload)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run tests (unit + smoke)
npm run test

# Always run tests after any code changes

# Validate AICODE anchor comments
npm run lint:aicode
```

## Architecture & Key Patterns

### Local-First Design
- All data stored in IndexedDB via Dexie (no backend)
- Pinia stores (`accounts`, `categories`, `transactions`) mirror Dexie tables
- Repositories (`app/repositories/*`) abstract Dexie access and handle validation
- Exports/imports use JSON with version field for future migration support

### Money Handling
- **Critical invariant:** all monetary values stored as `amountMinor` (integer kopecks) to avoid float arithmetic errors
- `useMoney.ts` composable provides:
  - `toMinor(string)` — parse "19,99" or "19.99" → 1999
  - `fromMinor(number)` — format 1999 → "19.99"
  - `formatMoney(number)` — localized RUB display
  - Zod validator for money fields
- MoneyInput component (`components/MoneyInput.vue`):
  - Exposes numeric keyboard with mask and quick-amount buttons
  - API: v-model (string), emits addQuickAmount on button clicks
  - **Breaking change risk:** this component's interface is load-bearing; test carefully

### State Management
- **Pinia stores** in `stores/`:
  - `accounts.ts`, `categories.ts`, `transactions.ts` — entity state + selectors
  - Selectors compute derived data (balances, aggregations) at query time, never stored
- **Repositories** in `app/repositories/`:
  - `accounts.ts`, `categories.ts`, `transactions.ts`, `backup.ts`
  - Each wraps Dexie table operations, applies Zod validation before write
  - Backup repository handles JSON export/import contracts with full data replacement

### Validation Strategy (Three-Level)
1. **TypeScript types** — define structure
2. **Zod schemas** — validate user input (forms) and internal operations before store updates
3. **JSON backup** — strict Zod schema with `version` field for round-trip integrity

### AICODE Anchor Comments
- Project uses `AICODE-NOTE:`, `AICODE-TODO:`, `AICODE-ASK:` comments for inline memory
- Search for existing anchors: `npm run lint:aicode` or `rg "AICODE-"`
- Read `docs/aicode-anchors.md` for anchor rules, scheme, and lifecycle management
- Update or delete anchors after completing tasks to keep documentation fresh

## Project Structure

```
/app
  /components          # Vue components (MoneyInput, OfflineIndicator, AddToHomeBanner)
  /composables         # useMoney.ts (money formatting/parsing), useFilters.ts
  /db
    client.ts         # Dexie schema, migration hooks
    seed.ts           # Demo data
  /repositories        # Dexie access layer with Zod validation
  /types
    budget.ts         # TypeScript interfaces (Account, Category, Transaction, etc.)
  app.vue             # Root component with layout

/pages                # Nuxt auto-routed pages
  index.vue           # Dashboard (balances)
  accounts.vue        # Account management
  categories.vue      # Category toggle/create
  settings.vue        # Export/import UI
  transactions.vue    # Transaction list, filters, search

/stores               # Pinia stores (reactive layer)
  accounts.ts, categories.ts, transactions.ts

/layouts              # Nuxt layout (bottom tab bar)
  default.vue

/components           # Global Vue components (not page-specific)
  MoneyInput.vue
  OfflineIndicator.vue
  AddToHomeBanner.vue

/public               # Static assets (PWA icons, favicon)
/tests                # Vitest unit + smoke tests
/docs                 # Development plans, comparisons, architecture notes

nuxt.config.ts        # Nuxt + PWA manifest + Workbox config
tailwind.config.ts    # Tailwind extensions (surface/accent colors)
vitest.config.ts      # Test runner config
tsconfig.json         # TypeScript config
package.json          # Dependencies and scripts
```

## Key Files & Their Roles

| File | Purpose | Notes |
| --- | --- | --- |
| `app/types/budget.ts` | TypeScript entity interfaces | Source of truth for Account, Category, Transaction shape |
| `app/composables/useMoney.ts` | Money formatting helpers | Never skip validation or formatting |
| `app/repositories/backup.ts` | JSON export/import contract | Defines schema, handles full Dexie replacement |
| `components/MoneyInput.vue` | Reusable money input UI | v-model = string; quick amounts emit event (do not break) |
| `stores/transactions.ts` | Transaction store + balance selectors | Compute balances on-demand, never store sums |
| `nuxt.config.ts` | PWA manifest + service worker config | Icons, shortcuts, offline caching strategies |
| `docs/ynab-lite-pwa-plan.md` | Full development plan | Stage 0–4 done, Stage 5 (tests/polish/a11y) in progress |

## Current Status (Stage 5)

**Progress:** ~90% complete. Stages 0–4 delivered; Stage 5 (polish, tests, accessibility) ongoing.

**What works:**
- Scaffold, CRUD for accounts/categories/transactions
- Dashboard with real-time balance display
- Transaction filtering + search
- PWA manifest, offline shell, service worker
- JSON export/import with validation
- Tailwind UI, responsive iPhone SE layout
- AddToHomeBanner (iOS install hint)

**Active focus:**
- Unit test coverage (MoneyInput, store/repo, validation schemas)
- Smoke test: add → filter → export → import workflow
- Empty states and keyboard/a11y polish
- Manual iOS PWA testing (iPhone SE, install/offline)

**Known gaps:**
- `MoneyInput` unit test missing
- `accounts`/`categories` store and repo coverage limited
- Smoke add→filter→export→import not yet fully automated
- Device-level iOS install/offline validation pending

## Important Constraints & Invariants

1. **Money is always `amountMinor` (integers).** No float arithmetic. Respect `toMinor`/`fromMinor` strictly.
2. **Pinia selectors compute balances on-demand.** Never store pre-calculated sums in Dexie.
3. **MoneyInput API is stable.** Changes to its v-model or event interface will break dependent forms.
4. **JSON export must validate round-trip.** Always use the backup schema for import.
5. **Service worker caching is offline-first.** Workbox config in `nuxt.config.ts` gates which assets cache.
6. **Dexie indexes are critical for performance.** Adding/removing indexes requires migration logic.

## Testing Strategy

- **Layer 1 (Unit):** `useMoney`, date normalization, helper functions, Zod schemas
- **Layer 2 (Store & Repo):** Pinia selectors (balance calculation), repository validation
- **Layer 3 (Smoke/E2E):** Single workflow: add transaction → filter → export → import
- **Device smoke:** Manual iOS PWA install/offline test on iPhone SE (Safari)

## Agent docs (navigation-first)

- `AGENTS.md` — правила работы агента в репо и boot-sequence.
- `README.md` — навигационный индекс (пути + entry points + search cookbook).
- `docs/context.md` — короткий “скелет контекста” (миссия/стек/паттерны/инварианты).
- `docs/status.md` — живой статус (фокус/next steps/риски).
- `docs/decisions/*` — ADR (“почему так”).
- `docs/aicode-anchors.md` — правила и схема AICODE-якорей.

## Common Patterns & Decisions

- **Dates stored as ISO strings** (YYYY-MM-DD for transactions, ISO 8601 for timestamps)
- **Category/Account filtering:** defaults are built-in, user ones are created on-demand
- **Backup import strategy:** replaces entire Dexie store (no merge), shows preview + warning
- **UI localization:** Tailwind utility classes, date-fns locale support (RUB currency)
- **Offline indicator:** real-time navigator.onLine check via `OfflineIndicator.vue`

## Running Individual Tests

```bash
# Run all tests
npm run test

# Run specific test file (requires test config adjustment)
npm run test -- tests/useMoney.test.ts

# Watch mode (for development)
# Not currently configured; edit vitest.config.ts to enable if needed
```

## Deployment

- **Static host:** Cloudflare Pages, Netlify, or Vercel
- **Requires HTTPS** for PWA installability
- **No backend or database** setup needed
- **Service worker** auto-updated via Workbox `autoUpdate` registration

## Quick Onboarding Checklist

1. Read `AGENTS.md` and `README.md` (repo map + workflow)
2. Read `docs/context.md` and `docs/status.md`
3. Check `AICODE-` anchors: `rg "AICODE-"` (contracts/traps/notes)
4. Understand `app/types/budget.ts` — the entity model
5. Test locally: `npm run dev`, open http://localhost:3000
6. Review `components/MoneyInput.vue` if working on money input
7. Review `app/repositories/backup.ts` if working on export/import

---

**Last updated:** 2025-12-25
**Repository:** https://github.com/anthropics/claude-code (or local)
**Agent docs:** navigation-first (README + AICODE + status/decisions)
