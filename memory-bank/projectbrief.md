# Project Brief — YNAB-lite PWA

**Version:** 1.0 (plan dated 2025-10-21)

## Mission
Deliver an offline-capable personal finance Progressive Web App that mirrors core “You Need A Budget” workflows while staying lightweight and privacy-friendly. The MVP must run smoothly on iPhone SE 2022 Safari and modern desktop browsers without requiring any backend services.

## MVP Outcomes
- Track incomes and expenses across multiple local accounts.
- Display per-account balances plus an overall balance in real time.
- Support default and user-defined categories for spending/earning.
- Offer filters (date, category, account) and free-text search over notes.
- Provide JSON export/import so users can back up and restore data.
- Install as a PWA and work entirely offline.

## Constraints & Principles
- Local-first architecture: IndexedDB is the system of record at launch.
- Monetary values stored as integers in minor units (kopecks) to avoid float issues.
- Minimal, fast UI based on Tailwind utility classes, tailored to small screens.
- All calculations derived at query time—no duplicated aggregate fields.
- Future enhancements (sync, reports, budgets) are explicitly out of MVP scope.

## Success Criteria
- All user scenarios in the development plan’s section 2 are implemented and testable offline.
- Lighthouse PWA pass (installable + offline OK) and warm-start TTI < 2.5s on iPhone SE 2022.
- JSON backup round-trips without data loss.
- Memory Bank reflects current architecture, decisions, and progress so new sessions can resume seamlessly.
