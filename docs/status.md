# Project status (short)

<!-- AICODE-NOTE: STATUS/FOCUS - living current focus and next steps instead of a long diary; ref: README.md; risk: agent works on the wrong thing -->
<!-- AICODE-NOTE: STATUS/ENTRY - start reading with README, then search anchors: rg -n "AICODE-" -->

## Current focus
- Stage 5: tests/polish/a11y, smoke add->filter->export->import, manual iOS install/offline.

## Next steps (top 5)
1) Add unit tests for `components/MoneyInput.vue` and key stores/repositories.
2) Smoke add->filter->export->import (Vitest/Playwright/manual) and record results.
3) Empty states and baseline a11y (focus, aria, keyboard).
4) Manual iOS check (iPhone SE): install/offline + AddToHomeBanner + SW.
5) Local contract checks (AICODE) before refactors.

## Known risks
- Regressions in balance/filter calculations during UI/store optimization.
- Silent backup/import breakage when schema/version changes in Dexie.

## Fast orientation (search)
- All anchors: `rg -n "AICODE-"`
- Only contracts/traps: `rg -n "AICODE-(CONTRACT|TRAP):"`
- Import/export: `rg -n "backup|snapshot|import|export" app docs pages components stores`
