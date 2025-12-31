# Wikipedia1 Indigenous Americas

## Status-only log

- 2025-12-16 20:38 PST (2025-12-17T04:38:03.405Z): Option C pass complete (no edits to `modules/namebases-real.js` or `DEVplans/Languages-Status.md`).
  - Changes:
    - Added `tools/mixer-deltas/2025-12-17-wikipedia1-indigenous-americas-missing-both-setbases.json` with `setBases` wiring for ISOs: mbn, arh, mav, hto, bmr, trn, mbr, ppi, pav, rey, xsu, poi, tqb, slj, tpx, tno, tsi, psm, mtp, wlv.
    - Ran `pnpm exec -- node tools/mixer-core/apply-mixer-deltas.js --check --no-lock` (OK) and `pnpm exec -- node tools/mixer-core/apply-mixer-deltas.js --no-lock` (OK), regenerating mixer artifacts.
  - Verification:
    - `pnpm exec -- node tools/mixer-core/report-wikipedia-list-coverage.js tools/mixer-meta/wikipedia-indigenous-languages-of-the-americas.json --no-devplan`
      - fully wired: 221/221 considered (100%)
      - missing catalog: 0
      - missing map: 0
      - missing both: 0
      - unmatched name: 0
      - Nonunique Bases: 170 (unchanged by this pass)
