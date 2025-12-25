# UI Tests

## Overview

This directory contains visual snapshot and smoke tests for the YNAB-lite PWA UI. Tests verify rendering consistency across viewports and core functionality workflows.

## Scope

### Screens Covered
- Dashboard (balances, account overview)
- Accounts (account list, create/edit)
- Categories (category list, create/edit, toggle status)
- Transactions (list, filters, search, form)
- Settings (export/import block)

### Test Types
- **Visual snapshots:** Verify layout and styling on mobile/desktop viewports
- **Empty states:** Verify UI when no data is present
- **Smoke tests:** Full workflows (import → navigate → filter → export)

## Viewports

Snapshot tests run on two viewports by default:

- **Mobile:** 375×667 (iPhone SE 2022, 2x device scale factor)
- **Desktop:** 1280×800 (standard desktop, 1x device scale factor)

## Fixtures

Two fixture datasets are available:

- `tests/fixtures/backup-min.json` — Minimal dataset: 2 accounts, 5–6 categories, 6 transactions
- `tests/fixtures/backup-dense.json` — Dense dataset: 3 accounts, 8 categories, 20+ transactions

## Running Tests

### Run all UI tests
```bash
npm run test:ui
```

### Run specific test file
```bash
npm run test:ui -- accounts.spec.ts
```

### Update baseline snapshots (after intentional UI changes)
```bash
npm run test:ui:update
```

### Run in debug mode (Playwright Inspector)
```bash
npx playwright test tests/ui --debug
```

### View HTML test report
```bash
npx playwright show-report
```

## Snapshot Management

### When to Update Baselines

Update baseline snapshots when:
1. **Intentional UI changes:** Redesign, layout refactor, styling update
2. **Font or rendering differences:** New system, updated browser, DevTools settings

**Never** update baselines to hide failing tests. Investigate the cause first.

### How to Update Baselines

1. Review the failing snapshots in the test report
2. Verify the changes are intentional
3. Update baselines:
   ```bash
   npm run test:ui:update
   ```
4. Review the diff in `tests/ui/__snapshots__/`
5. Commit both the test file and updated snapshots

### Snapshot File Structure

Snapshots are stored in `tests/ui/__snapshots__/`:
- `accounts.spec.ts-snapshots/` — Account page snapshots
- `categories.spec.ts-snapshots/` — Categories page snapshots
- `settings.spec.ts-snapshots/` — Settings page snapshots
- `empty-states.spec.ts-snapshots/` — Empty state snapshots

## Best Practices

### Before Running Tests
1. Ensure the app builds: `npm run build`
2. Start dev server or tests will start one: `npm run test:ui` (auto-starts)
3. All animations are disabled in Playwright config (`animations: 'disabled'`)

### Writing New Tests
- Use `loadFixture(page, 'min' | 'dense')` to populate data
- Use `navigateToPage(page, route)` to navigate
- Wait for content: `page.waitForSelector('[data-testid="..."]')`
- Always wait for network idle: `page.waitForLoadState('networkidle')`
- Test both mobile (375×667) and desktop (1280×800) viewports

### Debugging Failed Tests
1. Check the HTML report: `npx playwright show-report`
2. Look at the diff between expected and actual
3. Verify component `data-testid` attributes are present
4. Check browser console for errors: use `page.on('console', msg => console.log(msg))`

## Architecture

### Fixtures (`tests/ui/fixtures.ts`)
- `loadFixture(page, 'min' | 'dense')` — Load test data via file input
- `navigateToPage(page, route)` — Navigate to a page and wait for load
- `VIEWPORTS` — Viewport definitions (mobile/desktop)

### Test Files
- `accounts.spec.ts` — Account page snapshots (4 tests)
- `categories.spec.ts` — Categories page snapshots (4 tests)
- `settings.spec.ts` — Settings page snapshots (4 tests)
- `empty-states.spec.ts` — Empty state snapshots (6 tests)

## Continuous Integration

Tests run in CI on every commit:
- Headless Chromium (via Playwright)
- Locale: ru-RU, Timezone: Europe/Moscow
- Screenshot: only-on-failure
- Trace: retain-on-failure

If tests fail in CI:
1. Download the artifact report
2. Review snapshots and video traces
3. Fix the issue locally and push

## Known Limitations

- Tests require file input to load fixtures (browser sandbox limitation)
- Snapshots are platform/font-dependent; re-baseline if moving CI environments
- Empty state tests assume clean IndexedDB (no pre-loaded data)

## Future Enhancements

- [ ] Smoke test: add transaction → filter → export → import workflow
- [ ] Accessibility tests (a11y, contrast, ARIA)
- [ ] Performance metrics (Lighthouse, Core Web Vitals)
- [ ] Device-specific tests (iOS Safari PWA install)
