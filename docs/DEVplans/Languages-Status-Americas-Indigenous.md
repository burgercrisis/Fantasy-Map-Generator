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

- Batch: `comanche, hopi, shoshoni, dih` (Comanche, Hopi, Shoshoni, Kumeyaay)
- Change:
  - Added `tools/mixer-deltas/2025-12-18-wikipedia1-americas-indigenous-uniqueness-batch3-comanche-hopi-shoshoni-dih-dedicatedpins.json` to pin these ISOs to dedicated base indices `7835–7838`.
  - Appended dedicated base defs `i:7835–7838` to `modules/namebases-real.js`.
- Verification evidence (all exit code 0):
  - `pnpm run mixer:apply-deltas`
  - `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --only-failures --only-isos=comanche,hopi,shoshoni,dih --limit=300` (0 failures)
  - `pnpm exec -- node tools/mixer-core/check-language-mixer-failures.js` (0 failures)
  - `pnpm exec -- node tools/mixer-core/check-language-mixer-coverage.js` (map-only 0; catalog-only 0)
  - `pnpm exec -- node tools/mixer-diagnostics/check-language-mixer-map-duplicate-isos.js` (0 duplicates)
  - `pnpm exec -- node tools/check-language-mixer-map-inconsistencies.js` (exit 0; informational output)

Notes (unblocker):
- `pnpm run mixer:apply-deltas` was initially blocked by non-unique dedicatedPins: `wushi` pinned to base `2426` while `cameroonian-pidgin` also used base `2426` via `tools/mixer-deltas/2025-12-18-decluster-307-west-african-english-creole.json`. Fixed by repinning `wushi` to `7839` in `tools/mixer-deltas/2025-12-15-worker39-africa-112-113-batch5.json` and appending `i:7839` to `modules/namebases-real.js`.

- Batch: `enl, kanamari, moc, noa` (Enlhet, Kanamari, Mocoví, Wounaan)
- Change:
  - Added `tools/mixer-deltas/2025-12-18-wikipedia1-americas-indigenous-uniqueness-bases422-batch2-dedicatedpins.json` to pin these ISOs to dedicated base indices `7940–7943`.
  - Appended dedicated base defs `i:7940–7943` to `modules/namebases-real.js`.
- Verification evidence (all exit code 0):
  - `pnpm run mixer:apply-deltas`
  - `pnpm run mixer:check-deltas`
  - `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --only-failures --only-isos=enl,kanamari,moc,noa --limit=300` (0 failures)
  - `pnpm exec -- node tools/mixer-core/check-language-mixer-failures.js` (0 failures)
  - `pnpm exec -- node tools/mixer-core/check-language-mixer-coverage.js` (map-only 0; catalog-only 0)
  - `pnpm exec -- node tools/mixer-diagnostics/check-language-mixer-map-duplicate-isos.js` (0 duplicates)
  - `pnpm exec -- node tools/check-language-mixer-map-inconsistencies.js` (exit 0; informational output)

- Batch: `mapudungun, ona, yag` (Mapudungun, Ona, Yahgan)
- Change:
  - Added `tools/mixer-deltas/2025-12-18-wikipedia1-americas-indigenous-uniqueness-bases178-batch1-dedicatedpins.json` to pin these ISOs to dedicated base indices `7944–7946`.
  - Appended dedicated base defs `i:7944–7946` to `modules/namebases-real.js`.
- Verification evidence (all exit code 0):
  - `pnpm run mixer:apply-deltas`
  - `pnpm run mixer:check-deltas`
  - `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --only-failures --only-isos=mapudungun,ona,yag --limit=300` (0 failures)
  - `pnpm exec -- node tools/mixer-core/check-language-mixer-failures.js` (0 failures)
  - `pnpm exec -- node tools/mixer-core/check-language-mixer-coverage.js` (map-only 0; catalog-only 0)
  - `pnpm exec -- node tools/mixer-diagnostics/check-language-mixer-map-duplicate-isos.js` (0 duplicates)
  - `pnpm exec -- node tools/check-language-mixer-map-inconsistencies.js` (exit 0; informational output)

- Batch: `kalaallisut, caw, cbb, cbd, cbv, chf, chol, cora, cui, cul` (Kalaallisut, Kallawaya, Cabiyari, Carijona, Kakwa (Cacua), Chontal Maya, Ch'ol, Cora, Cuiba, Kulina)
- Change:
  - Added `tools/mixer-deltas/2025-12-18-wikipedia1-americas-indigenous-uniqueness-nonunique-bases-batch5-dedicatedpins.json` to pin these ISOs to dedicated base indices `8050–8059`.
  - Appended dedicated base defs `i:8050–8059` to `modules/namebases-real.js`.
- Verification evidence (all exit code 0):
  - `pnpm run mixer:apply-deltas`
  - `pnpm run mixer:check-deltas`
  - `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --only-failures --only-isos=kalaallisut,caw,cbb,cbd,cbv,chf,chol,cora,cui,cul --limit=300` (0 failures)
  - `pnpm exec -- node tools/mixer-core/check-language-mixer-failures.js` (0 failures)
  - `pnpm exec -- node tools/mixer-core/check-language-mixer-coverage.js` (map-only 0; catalog-only 0)
  - `pnpm exec -- node tools/mixer-diagnostics/check-language-mixer-map-duplicate-isos.js` (0 duplicates)
  - `pnpm exec -- node tools/check-language-mixer-map-inconsistencies.js` (exit 0; informational output)

- Batch: `macushi, waiwai, yukpa` (Macushi, Waiwai, Yukpa)
- Change:
  - Added `tools/mixer-deltas/2025-12-18-wikipedia1-americas-indigenous-cariban-batch1-8605-8607-dedicatedpins.json` to pin these ISOs to dedicated base indices `8605–8607`.
  - Appended dedicated base defs `i:8605–8607` to `modules/namebases-real.js`.
- Verification evidence (all exit code 0):
  - `node --check modules/namebases-real.js`
  - `pnpm run mixer:apply-deltas`
  - `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --only-failures '--only-isos=macushi,waiwai,yukpa' --limit=300` (0 failures)
  - `pnpm exec -- node tools/mixer-core/check-language-mixer-failures.js` (0 failures)
  - `pnpm exec -- node tools/mixer-core/check-language-mixer-coverage.js` (map-only 0; catalog-only 0)
  - `pnpm exec -- node tools/mixer-diagnostics/check-language-mixer-map-duplicate-isos.js` (0 duplicates)
  - `pnpm exec -- node tools/check-language-mixer-map-inconsistencies.js` (exit 0; informational output)
  - `pnpm exec -- node tools/mixer-core/report-wikipedia-list-nonunique-bases.js tools/mixer-meta/wikipedia-indigenous-languages-of-the-americas.json`
