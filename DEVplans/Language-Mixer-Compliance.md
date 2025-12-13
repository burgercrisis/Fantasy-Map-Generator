# Language Mixer Rules – Compliance Backlog

_Back to devplan overview: [Changes vs Azgaar overview](Changes-vs-Azgaar-master.md)_

This devplan tracks work needed to keep the repo (docs, tooling, and runtime/UI) aligned with the authoritative rule set in `DEVplans/Language-Mixer-Rules.md`.

## Status snapshot (2025-12-13)

- Family macros (`tags: ["family"]`) are organizational entries:
  - they are expected to be skipped by the mixer UI and by “failure” checks
  - they are still required to have mappings (per `DEVplans/Language-Mixer-Rules.md`)
- Suite-critical tooling should remain compatible with this posture:
  - family-tagged catalog entries may be excluded from some failure/coverage tallies for UI parity, but mappings must still exist
- Safety tightening:
  - `tools/mixer-core/fix-language-mixer-mappings.js` will not create new map-only entries from `explicitIsoBasesMap` unless the ISO exists in the catalog

- Seed-uniqueness thresholds (explicit goal; not a hard gate):
  - We are tracking a long-term goal that each non-family mixer language has at least one globally-unique base index, and that dedicated base contains ISO-unique seed tokens.
  - Target thresholds (tracked as debt, not enforced as a suite “hard gate”): strict unique seeds `>= 1` and normalized unique seeds `>= 10`.
  - Report current compliance with:
    - `pnpm exec node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --only-failures`

## Workstreams

### A) Documentation alignment

- Ensure docs consistently describe:
  - append-only registries
  - family macros are organization-only but still mapped
  - uniqueness metrics definitions (`Nonunique Bases` vs base-set uniqueness)
  - seed-uniqueness thresholds are tracked goals (not a hard gate)

### B) Tooling alignment (writers + suite)

- For each script that writes:
  - `config/language-mixes.json`
  - `config/language-mixer-map.json`

confirm:

- it enforces append-only (refuse to write if any existing ISO would disappear)
- it does not generate mappings for family-tagged catalog entries by default
- it does not create duplicate ISO rows
- it does not introduce invalid base indices

### C) Runtime/UI alignment

- Confirm UI consistently hides family-tagged entries from mixing surfaces.
- Confirm runtime does not depend on deleting/renaming ISO keys.

## Next audit targets

- `tools/mixer-core/check-language-mixer-coverage.js`:
  - verify that “family-tagged catalog ISOs missing from map” output is correct/desired
- `tools/mixer-core/fix-language-mixer-mappings.js`:
  - audit `explicitIsoBaseMap` for any family macro keys (allowed, but should remain unreachable due to family-skip)
- `tools/mixer-core/run-language-mixer-suite.js`:
  - verify suite outputs remain stable and do not treat family macros as failures

