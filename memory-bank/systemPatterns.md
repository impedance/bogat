# System Patterns — YNAB-lite PWA

## Architecture Overview
- **Local-first**: IndexedDB (via Dexie.js) is the authoritative store. All business logic runs client-side.
- **Nuxt 3 SPA/PWA**: Nuxt handles routing, hydration, and service worker integration.
- **State Layer**: Pinia stores wrap Dexie queries, exposing derived selectors for balances and summaries.
- **Data Flow**: Forms write to Dexie; views subscribe to Pinia getters that compute totals on demand.
- **PWA Layer**: `@vite-pwa/nuxt` configures service worker caching of static assets and critical routes.

## Data Modeling Patterns
- Money values stored as integers (`amountMinor`) representing kopecks to prevent floating-point drift.
- Entities (`Account`, `Category`, `Transaction`) include ISO timestamps (`createdAt`, `updatedAt`) to prep for future sync.
- Dexie indexes on `accountId`, `categoryId`, `type`, and `date` to support filters and reporting.
- Export/import schema versioned; imports default to additive behavior with manual conflict resolution in UX.

## UI/UX Patterns
- Tailwind utility classes for layout; keep components minimal and responsive to iPhone SE constraints.
- Dashboard displays aggregate totals derived from selectors—not stored.
- Forms validate with Zod/TS types and provide inline feedback.
- Empty states and onboarding prompts reinforce backup reminders and offline capabilities.

## Future Evolutions (Not in MVP but planned)
- Optional backend sync using last-write-wins per `updatedAt` timestamp.
- Additional tables for budgets, scheduled transactions, and reports once MVP stabilizes.
