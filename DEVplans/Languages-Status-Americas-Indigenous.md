# Americas Indigenous (Wikipedia list) — Status-only ledger

## 2025-12-18

- Batch: `con, fun, ito, lec, cag` (Cofán, Fulniô, Itonama, Leco, Nivaclé)
- Change:
  - Updated `tools/mixer-deltas/2025-12-18-wikipedia1-americas-indigenous-uniqueness-bases422-batch1-dedicatedpins.json` to pin these ISOs to dedicated base indices `7700–7704`.
- Verification evidence (all exit code 0):
  - `pnpm run mixer:apply-deltas`
  - `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --only-failures --only-isos=con,fun,ito,lec,cag --limit=300` (0 failures)
  - `pnpm exec -- node tools/mixer-core/check-language-mixer-failures.js` (0 failures)
  - `pnpm exec -- node tools/mixer-core/check-language-mixer-coverage.js` (map-only 0; catalog-only 0)
  - `pnpm exec -- node tools/mixer-diagnostics/check-language-mixer-map-duplicate-isos.js` (0 duplicates)
  - `pnpm exec -- node tools/check-language-mixer-map-inconsistencies.js` (exit 0; informational output)

Notes:
- `DEVplans/Languages-Status.md` was locked at time of update, so this file is a temporary status-only ledger.
