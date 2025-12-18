# NO_UNIQ_BASE2 Continuation

Status-only updates only.

## 2025-12-18 NO_UNIQ_BASE2 claim stalled (burumakok/buruwai/buyang/buyeo-korean/bwi)

- **batchId**: `2025-12-18T11:43:56.479Z-worker1`
- **status**: `stalled`
- **reservedRange**: `7975–8024`
- **ISO->base mapping (intended dedicated pins)**:
  - burumakok->7975
  - buruwai->7976
  - buyang->7977
  - buyeo-korean->7978
  - bwi->7979

- **Files changed**:
  - `tools/mixer-deltas/2025-12-18-worker1-mixed-burumakok.json` (new; dedicatedPins)
  - `modules/namebases-real.js` (appended base defs i:7975–7979)
  - `tools/mixer-diagnostics/_no_uniq_base_claims.json` (claim created, notes updated, then stalled)

- **Verification run**:
  - `pnpm run mixer:guardrails` OK
  - `pnpm run mixer:check-deltas` OK
  - seed-uniqueness (targeted) still reports `NO_UNIQ_BASE` for all 5 because artifacts have not been regenerated:
    - `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --only-failures "--only-isos=burumakok,buruwai,buyang,buyeo-korean,bwi" --limit=300`
      => `No globally-unique base index: 5`

- **BLOCKER**:
  - Cannot run `pnpm run mixer:apply-deltas` to materialize the new dedicatedPins because artifact files are hub-locked by workstreamId `49759a01-43fe-4b8c-9e17-cb5a0222e885`:
    - `file:config/language-mixer-map.json`
    - `file:config/language-mixer-map.js`
    - `file:config/language-mixes-all.js`
    - `file:tools/mixer-deltas/_compiled-dedicated-pins.json`

