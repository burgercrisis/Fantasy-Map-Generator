# Language Mixer Rules – Compliance Backlog

_Back to devplan overview: [Changes vs Azgaar overview](Changes-vs-Azgaar-master.md)_

This devplan tracks work needed to keep the repo (docs, tooling, and runtime/UI) aligned with the authoritative rule set in `DEVplans/Language-Mixer-Rules.md`.

## Status snapshot (2025-12-13)

- Family macros (`tags: ["family"]`) are treated as organization-only:
  - expected to be skipped by the mixer UI and by “failure” checks
  - not required to have mappings
- Suite-critical tooling updated to respect this posture:
  - `tools/mixer-core/check-language-mixer-coverage.js` no longer counts family-tagged catalog entries as “missing map”
  - `tools/mixer-core/fix-language-mixer-mappings.js` skips family-tagged catalog entries when auto-filling mappings
- Safety tightening:
  - `tools/mixer-core/fix-language-mixer-mappings.js` will not create new map-only entries from `explicitIsoBasesMap` unless the ISO exists in the catalog

## Workstreams

### A) Documentation alignment

- Ensure docs consistently describe:
  - append-only registries
  - family macros are organization-only
  - uniqueness metrics definitions (`Nonunique Bases` vs base-set uniqueness)

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

