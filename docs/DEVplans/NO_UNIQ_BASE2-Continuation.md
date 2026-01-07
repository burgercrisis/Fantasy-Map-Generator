## 2025-12-21 Premix Grade A Batch 3 (aca to aghem)

- **batchId**: `2025-12-21-batch-3`
- **status**: `complete`
- **ISO list**: `aca, aeq, afade-language, afar, afrikaans, afro-seminole-creole, agalega-creole, agarabi, agaw, aghem`
- **Strategy**: Strategy A (Expand `modules/namebases-real.js` dedicated bases)
- **Files changed**:
  - `modules/namebases-real.js` (Updated `aca` at `20446`, added 9 entries `20456-20464`)
- **Verification run**:
  - `report-language-mixer-premix-grades.js` reports Grade A (count 50) for all 10 ISOs with real-world names (no placeholders).
  - `pnpm run mixer:guardrails` OK.
  - `pnpm run mixer:check-deltas` reports out-of-date artifacts (expected for non-integrators).
- **Next Steps**: Continue with Batch 4 of F-grade ISOs starting from `aghu`.

## 2025-12-21 Premix Grade A Batch 2 (ace to adnyamathanha)

- **batchId**: `2025-12-21-batch-2`
- **status**: `complete`
- **ISO list**: `ace, achang, acheron, acr, adang, adara, adeni-arabic, adi, adjaran-georgian, adnyamathanha`
- **Strategy**: Strategy A (Expand `modules/namebases-real.js` dedicated bases)
- **Files changed**:
  - `modules/namebases-real.js` (Updated `ace` at `20316`, added 9 entries `20447-20455`)
- **Verification run**:
  - `report-language-mixer-premix-grades.js` reports Grade A (count 50) for all 10 ISOs (with synthetic fillers).
  - `pnpm run mixer:guardrails` OK.
  - `pnpm run mixer:check-deltas` failed (expected for non-integrators due to unapplied deltas like `2025-12-21-triage-batch-2.json`).
- **Next Steps**: Continue with Batch 3 of F-grade ISOs starting from `aeolian`.

## 2025-12-21 Premix Grade A Batch 1 (-azd-dialect to abron)

- **batchId**: `2025-12-21-batch-1`
- **status**: `complete`
- **ISO list**: `-azd-dialect, -ejtun-dialect, -sele, a-ou, aab, abaga, abba-gorgoryos, abon, aboriginal-pidgin-english, abron`
- **Strategy**: Strategy A (Expand `modules/namebases-real.js` dedicated bases)
- **Files changed**:
  - `modules/namebases-real.js` (Added 10 real-world dedicated entries i:20436–20445)
- **Verification run**:
  - `report-language-mixer-premix-grades.js` reports Grade A (count 50) for all 10 ISOs.
  - `pnpm run mixer:guardrails` OK.
  - `pnpm run mixer:check-deltas` reported out-of-date artifacts (existing issue, likely `14050` missing base).
- **Next Steps**: Continue with Batch 2 of F-grade ISOs.

## 2025-12-18 NO_UNIQ_BASE2 claim complete (burumakok/buruwai/buyang/buyeo-korean/bwi)

- **batchId**: `2025-12-18T11:43:56.479Z-worker1`
- **status**: `complete`
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
  - `tools/mixer-diagnostics/_no_uniq_base_claims.json` (claim created, notes updated, then stalled, then completed)

- **Verification run**:
  - `pnpm run mixer:guardrails` OK
  - `pnpm run mixer:apply-deltas` OK
  - `pnpm run mixer:check-deltas` OK
  - `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --only-failures "--only-isos=burumakok,buruwai,buyang,buyeo-korean,bwi" --limit=300`
    - `Missing mapping: 0`
    - `No globally-unique base index: 0`
    - `Strict unique seeds below threshold: 0`
    - `Normalized unique seeds below threshold: 0`
  - `pnpm exec -- node tools/mixer-core/check-language-mixer-coverage.js` OK (0 missing)
  - `pnpm exec -- node tools/mixer-core/check-language-mixer-failures.js` OK (0 failing)
  - `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2` OK (exit 0)

- **BLOCKER**:
  - Cleared (artifact locks were temporarily released; apply-deltas completed).

- **DEVplans follow-up**:
  - Still need to add a status-only entry to `DEVplans/Languages-Status.md` for this batch once its hub lock clears.
