# Helper Tools Overview

This document provides brief explanations of all helper scripts in the `tools/` directory.

## Core Mixer Maintenance (mixer-core/)

| Script | Purpose |
|--------|---------|
| `run-language-mixer-suite.js` | Orchestrates core mixer maintenance: fixes mappings, checks coverage, checks failures, runs name-counts, regenerates bundles |
| `fix-language-mixer-mappings.js` | Auto-fills missing ISO→base mappings by inferring from namebase matches, lexifiers, families, and token heuristics |
| `check-language-mixer-coverage.js` | Compares catalog vs map to show which ISOs are visible in UI vs mappable |
| `check-language-mixer-failures.js` | Static analysis for languages that would fail in mixer (missing mapping, empty/invalid bases) |
| `generate-language-mixer.js` | Builds browser bundles (`language-mixes-all.js`, `language-mixer-map.js`) from JSON configs |
| `apply-mixer-deltas.js` | Applies delta JSON files from `tools/mixer-deltas/` to update the mixer map |
| `generate-language-samples.js` | Generates sample names for mixer languages or raw bases; with `--analyze-lengths` suggests min/max values |
| `generate-language-pair-samples.js` | Stress-tests blended name generation across ISO pairs to find monolingual combinations |
| `compare-language-generators.js` | Compares two generator versions (legacy vs current) for a language |
| `compare-mixer-nextgen-to-app.js` | Compares app generators (legacy vs current) against a helper-only nextgen implementation |
| `dedupe-language-mixer-map.js` | Collapses duplicate ISO entries, keeping the last occurrence |
| `report-language-history-totals.js` | Audits git history to verify no ISO codes disappeared from configs |
| `diff-language-families.js` | Compares family values between JSON catalog and generated bundle |
| `normalize-language-names.js` | Replaces placeholder/abbreviated language names with proper full names |
| `run-wikipedia-list-helpers.js` | Orchestrator that runs coverage and uniqueness helpers for all Wikipedia list JSONs |
| `report-wikipedia-list-coverage.js` | Reports wiring status (full/missing-catalog/missing-map) for a Wikipedia list JSON |
| `update-wikipedia-list-coverage-in-devplan.js` | Refreshes coverage snapshots in `DEVplans/Languages-Status.md` |
| `report-wikipedia-list-base-uniqueness.js` | Reports base-set uniqueness and nonunique bases for a Wikipedia list |
| `report-wikipedia-list-mixer-bases.js` | Prints ISO, bases, and cluster membership for each resolved list item |

## Catalog Shaping (mixer-catalog/)

| Script | Purpose |
|--------|---------|
| `add-lexifier.js` | Infers and fills in `lexifier` for creole/pidgin/mixed languages |
| `fix-missing-families.js` | Backfills missing family metadata from categories |
| `update-romance.js` | Normalizes Romance entries (default region="Europe", family="Romance") |
| `fill-family-mixes.js` | Ensures family languages have catalog entries with category/region |
| `fill-sino-tibetan-mixes.js` | Fills catalog coverage for Sino–Tibetan entries |
| `fill-all-missing-mixes.js` | Backfills catalog entries for all unmapped ISOs |
| `fill-missing-mixes-explicit.js` | Backfills curated important ISOs with hand-picked metadata |
| `add-african-languages.js` | Adds curated African languages to catalog and wiring |
| `add-trans-new-guinea-mixer.js` | Adds Trans–New Guinea family/branch nodes and leaf languages |
| `fill-mongolic-mixes.js` | Adds/tunes Mongolic varieties in catalog and map |

## Namebase Operations (mixer-namebases/)

| Script | Purpose |
|--------|---------|
| `report-namebase-duplicates.js` | Reports internal duplicate names per base index |
| `dedupe-namebase-duplicates.js` | Removes duplicate names from base name lists |
| `check-namebase-lengths.js` | Validates configured min/max ranges against generated name lengths |
| `verify-language-comprehensive.js` | Comprehensive language verification in namebases |
| `verify-language-geographic-simple.js` | Simple geographic verification |
| `verify-language-geographic-authenticity.js` | Verifies geographic authenticity of names |
| `verify-language-authenticity.js` | General authenticity verification |
| `verify-continent-languages.js` | Verifies continent language assignments |
| `comprehensive-continent-verification.js` | Full continent verification |
| `remove-invalid-entries.js` | Removes invalid entries from namebases |
| `fix-nahuatl-names.js` | Fixes Nahuatl names in namebases |
| `fix-indigenous-names.js` | Fixes Indigenous language names |
| `analyze-primus-languages.js` | Analyzes Primus language data |
| `generate-manual-research-list.js` | Generates list of names requiring manual research |
| `research-language-replacements.js` | Researches replacement names |

## Diagnostics & Cleanup (mixer-diagnostics/)

| Script | Purpose |
|--------|---------|
| `run-language-mixer-health.js` | Runs read-only diagnostics suite (coverage, failures, duplicates, clusters) |
| `no-uniq-base-claim.js` | Claims NO_UNIQ_BASE work batches, reserves base index ranges |
| `print-no-uniq-base-claim-template.js` | Prints next safe reserved range and notes template |
| `claims-dashboard.js` | Unified view of active claims (NO_UNIQ_BASE, DECLUSTER, WIKI) |
| `wiki-claim.js` | Claims Wikipedia multi-agent work |
| `list-no-uniq-base-candidates.js` | Lists catalog ISOs failing NO_UNIQ_BASE check |
| `check-language-mixer-map-duplicate-isos.js` | Reports duplicate ISO rows in map |
| `dedupe-language-mixer-map-duplicate-isos.js` | Removes exact duplicate ISO rows |
| `report-language-mixer-iso-diff-vs-head.js` | Reports ISO differences vs HEAD |
| `merge-language-mixer-from-head.js` | Merges HEAD's map entries into working copy |
| `check-language-mixer-name-duplicates.js` | Reports exact duplicate language names |
| `report-language-mixer-duplicates.js` | Finds duplicate ISOs and normalized-name clusters |
| `report-language-mixer-base-clusters.js` | Shows clusters of languages sharing identical bases |
| `report-lost-language-mappings.js` | Detects lost languages after declustering |
| `restore-lost-language-mappings.js` | Restores lost language mappings from snapshot |
| `select-language-mixer-batch.js` | Selects batches of languages for workers |
| `select-language-mixer-base-batch.js` | Selects batches of base-sharing languages for declustering |
| `check-language-mixer-map-inconsistencies.js` | Checks for coverage mismatches, orphaned entries, suspicious base usage |
| `profile-language-mixes.js` | Profiles mixer languages (metadata, bases, stats) |
| `check-special-families.js` | Summarizes coverage for special families (Hmong-Mien, isolates, etc.) |
| `clean-language-mixer-map.js` | Spots orphaned map entries (ISO missing from catalog) |
| `retune-african-mappings.js` | Reassigns African languages to specific bases from generic family mixes |
| `decluster-claim.js` | Claims DECLUSTER work batches |
| `fix_claims.js` | Fixes claim file issues |
| `fix-wiki-list-keys.js` | Fixes Wikipedia list keys |

## Race Language Coverage (mixer-races/)

| Script | Purpose |
|--------|---------|
| `run-race-language-suite.js` | Orchestrates race language suite |
| `report-race-language-coverage.js` | Reports how well race profiles cover the catalog |
| `report-per-race-language-coverage.js` | Per-race coverage breakdown |
| `report-race-language-palettes.js` | Reports race language palettes |
| `report-wikipedia-list-race-coverage.js` | Reports race coverage for Wikipedia lists |
| `list-race-languages.js` | Lists all race-eligible languages |
| `check-race-language-profiles.js` | Checks race language profile validity |
| `debug-coverage.js` | Debug coverage issues |

## Regional Updates (mixer-regions/)

| Script | Purpose |
|--------|---------|
| `update-uralic.js` | Updates Uralic languages (region, category, family) |
| `update-turkic.js` | Updates Turkic languages |
| `update-niger-congo.js` | Updates Niger–Congo languages |
| `update-language-tags.js` | Updates language tags |
| `update-kartvelian.js` | Updates Kartvelian languages |
| `update-indo-aryan.js` | Updates Indo-Aryan languages |
| `update-hmong-mien.js` | Updates Hmong-Mien languages |
| `update-dravidian.js` | Updates Dravidian languages |
| `update-austronesian.js` | Updates Austronesian languages |
| `update-austroasiatic.js` | Updates Austroasiatic languages |
| `update-afroasiatic.js` | Updates Afroasiatic languages |

## Metadata (mixer-meta/)

| Script | Purpose |
|--------|---------|
| `generate-wikipedia-languages-of-africa-full.js` | Regenerates Africa list JSON from AFRICA_ROWS table |
| `check-official-languages-unique-bases.js` | Checks unique bases for official languages list |
| `_meta-fill-missing-mixes.js` | Shared META table for curated ISO backfills |

## Usage

Run scripts from project root:

```bash
node tools/mixer-core/check-language-mixer-coverage.js
```

With pnpm (includes `--` before script arguments):

```bash
pnpm exec -- node tools/mixer-core/check-language-mixer-coverage.js
```

Many scripts support `--help` for options:

```bash
node tools/mixer-core/generate-language-samples.js --help
```
