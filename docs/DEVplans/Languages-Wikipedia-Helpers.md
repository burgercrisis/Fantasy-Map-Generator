---
description: Wikipedia helper JSONs for language mixer coverage
---

# Goal

Support the languages-wiki rules by wiring structured helper JSONs for major Wikipedia language lists and classifications into the language mixer tooling. Each helper file:

- Provides a stable snapshot of a Wikipedia list or classification.
- Uses a shared schema `{ title, source, items[] }` with `name`, optional `iso`, and optional `skip`/`note`.
- Feeds `tools/mixer-core/report-wikipedia-list-coverage.js` to highlight gaps in `language-mixes.json` and `language-mixer-map.json`.

# Implemented helper files

## Oceanic / Malayo-Polynesian (Blust 1999)

- `tools/mixer-meta/wikipedia-oceanic-languages-blust-1999.json`
- `tools/mixer-meta/wikipedia-malayo-polynesian-subgroups-blust-1999.json`

## Formosan

- `tools/mixer-meta/wikipedia-formosan-languages-blust-1999.json`
- `tools/mixer-meta/wikipedia-formosan-languages-li-2008.json`
- `tools/mixer-meta/wikipedia-formosan-languages-sagart-2004-2021.json`

## Australian

- `tools/mixer-meta/wikipedia-australian-languages-living-2019.json`
- `tools/mixer-meta/wikipedia-australian-creoles.json`
- `tools/mixer-meta/wikipedia-australian-families-and-isolates.json`
- `tools/mixer-meta/wikipedia-australian-languages-bowern-2011.json`

## Papuan

- `tools/mixer-meta/wikipedia-papuan-families-wurm-1975.json`
- `tools/mixer-meta/wikipedia-papuan-families-foley-2003.json`
- `tools/mixer-meta/wikipedia-papuan-families-ross-2005.json`
- `tools/mixer-meta/wikipedia-papuan-families-wichmann-2013.json`
- `tools/mixer-meta/wikipedia-papuan-families-palmer-2018.json`
- `tools/mixer-meta/wikipedia-papuan-families-glottolog-4.0.json`
- `tools/mixer-meta/wikipedia-papuan-families-usher-suter-2024.json`

# Usage pattern

- Run coverage for any helper:
  - `node tools/mixer-core/report-wikipedia-list-coverage.js tools/mixer-meta/<file>.json`
- The script already supports:
  - Lists as raw arrays **or** `{ title, source, items }`.
  - `skip: true` to exclude proto/higher-level entries from coverage.
  - Explicit `iso` to override name matching.

# Open decisions / remaining work

## 1. ISO mapping & skip flags

- Annotate `iso` for items where there is a clear 1:1 mixer language (e.g. major Oceanic languages, Kriol, Fijian, etc.).
- Add `skip: true` systematically for:
  - Proto/reconstructed nodes (e.g. `Proto-Formosan`).
  - High-level family/group entries where we do not expect a mixer language (e.g. `Pama-Nyungan`, `Trans-New Guinea`) and only want them for diagnostics.

## 2. Coverage runs and tracking gaps

For each helper file (or per family block):

- Run `report-wikipedia-list-coverage.js` against the helper.
- Extract three kinds of TODOs:
  - **missing-catalog**: add new entries to `language-mixes.json`.
  - **missing-map**: wire existing catalog languages into `language-mixer-map.json` bases.
  - **unmatched**: decide whether to add a new language vs. mark the helper item `skip: true`.
- Record large clusters of missing languages here for future mixer expansion work.

## 3. Future helpers and refinements

- Consider helper files for any additional Wikipedia lists that become important (e.g. more regional groupings, script-based lists, or typology lists).
- If needed, extend the coverage script to:
  - Accept a mode flag (e.g. families-only vs languages) to tune how strictly unmatched items are treated.
  - Output machine-readable JSON for downstream tooling.

# Recommended next steps

1. Pick a block (Oceanic/MP, Australian, or Papuan) and annotate `iso` + `skip` for its helper files.
2. Run coverage for that block and log major gaps here as concrete follow-up tasks.
3. Repeat for remaining blocks until high-coverage is achieved across all Wikipedia-derived helpers.
