# Product Context — YNAB-lite PWA

## Target Users
- Individuals who prefer manual budgeting with full data ownership.
- Users needing a lightweight alternative to YNAB that works offline on iPhone SE 2022.
- Privacy-conscious users unwilling to sync sensitive finance data to external services.

## Core Jobs-To-Be-Done
1. Capture an income or expense quickly, choosing account, category, amount, date, and optional note.
2. Glance at the dashboard to understand overall and per-account balances.
3. Filter or search past transactions to verify spending patterns or recall a specific purchase.
4. Configure categories by toggling built-in options and creating personal ones.
5. Back up or migrate data by exporting/importing a JSON snapshot.

## Experience Goals
- Instant launch and minimal UI friction on small screens.
- Clear separation of income vs expense flows.
- Confidence that no data will be lost when offline or after reinstall (thanks to JSON backups).
- Predictable interactions with straightforward, localized formatting (RUB currency, date-fns locale-ready).

## Deferred Capabilities (Post-MVP)
- Cloud synchronization and multi-device merge logic.
- Authentication, shared budgets, advanced reporting, reminders.
- Multi-currency support and long-term planning features.
