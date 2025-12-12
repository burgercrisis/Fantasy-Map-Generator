# Helper Tools Overview

This document describes the helper scripts in the `tools/` directory: what each one does, which files it touches, and when you are likely to run it.

All scripts are intended to be run **from the project root** unless stated otherwise, e.g.

```bash
node tools/<script-name>.js [options]
```

### Section index

- [Language Mixer – Core Maintenance](#language-mixer--core-maintenance)
- [Catalog Shaping (language-mixes.json)](#catalog-shaping-language-mixesjson)
- [Namebase Maintenance](#namebase-maintenance)
- [Mixer Diagnostics & Cleanup](#mixer-diagnostics--cleanup)
- [Regional / Family Updaters](#regional--family-updaters)
- [Race Language Coverage & Palettes](#race-language-coverage--palettes)
- [Softmods (mod bundles)](#softmods-mod-bundles)
- [Experimental Markov helpers](#experimental-markov-helpers)
- [Root-level helper scripts](#root-level-helper-scripts)
- [Quick-Start Sequences](#quick-start-sequences)

---

## Language Mixer – Core Maintenance

### `run-language-mixer-suite.js`

**Purpose**

Runs the core language-mixer maintenance tools and prints a combined summary. This is the "one button" entry point when you’re doing mixer work.

**What it does**

By default it runs, in order:

- `fix-language-mixer-mappings.js`
- `check-language-mixer-coverage.js`
- `check-language-mixer-failures.js`
- optionally `report-language-mixer-name-counts.js`
- `generate-language-mixer.js` (rebuilds the mixer bundles used by the UI)

and prints short summaries of each tool’s stdout.

**Usage**

```bash
node tools/mixer-core/run-language-mixer-suite.js [options]
```

Useful options:

- `--no-fix` – skip `fix-language-mixer-mappings.js`
- `--no-coverage` – skip coverage report
- `--no-failures` – skip failure report
- `--full-output` – show full stdout for each tool instead of first paragraph
- `--name-counts` – also run `report-language-mixer-name-counts.js`
- `--name-counts-sort=FIELD` – forward `--sort=FIELD` to the name-counts reporter

Run this after larger catalog/mapping edits to get a quick health check.

---

### `fix-language-mixer-mappings.js`

**Purpose**

Automatically fills in missing `iso → base indices` mappings for the local Markov mixer (`Names.getMixedByIso`).

**Inputs**

- `config/language-mixes.json` – catalog of languages for the mixer UI
- `config/language-mixer-map.json` – existing ISO → `bases[]` mapping
- `modules/namebases-real.js`, `modules/namebases-fantasy.js`, `modules/namebases-creole.js` – base indices and names

**Outputs**

- **Overwrites** `config/language-mixer-map.json` with a cleaned + extended mapping

**Behavior**

- Normalizes existing map entries, removing `bases` values that no longer correspond to a real namebase index.
- For each catalog language lacking a mapping, attempts to infer a **single** base index via:
  - explicit overrides (`explicitIsoBaseMap`),
  - direct name → base matches,
  - lexifier and family metadata,
  - category and token heuristics.
- Appends new `{iso, bases: [index]}` records when an unambiguous base index is found.
- Prints a list of unresolved languages so you can add manual overrides.

**Typical command**

```bash
node tools/mixer-core/fix-language-mixer-mappings.js
```

Run this after you add or reorganize languages in `language-mixes.json`, or after tweaking lexifiers/families.

---

### `check-language-mixer-coverage.js`

**Purpose**

Compares ISO coverage between the mixer catalog and the mapping so you can see what’s visible vs. what’s mappable.

**Inputs**

- `config/language-mixer-map.json`
- `config/language-mixes.json`

**Outputs**

- Console report only (no files changed)

**Reports**

- ISOs present in the **map** but missing from the **catalog** (mapped but will not appear in the dropdown)
- ISOs present in the **catalog** but missing from the **map** (will appear in UI but have no local Markov mapping)

**Usage**

```bash
node tools/mixer-core/check-language-mixer-coverage.js
```

Run this to understand coverage gaps before/after mapping changes.

---

### `check-language-mixer-failures.js`

**Purpose**

Static analysis for catalog languages that would fail in the local mixer because of mapping problems.

**Inputs**

- `config/language-mixes.json`
- `config/language-mixer-map.json`
- `modules/namebases-real.js`, `modules/namebases-fantasy.js`, `modules/namebases-creole.js`

**Outputs**

- Console report only (no files changed)

**Checks**

- Catalog languages whose ISO is **missing** in `language-mixer-map.json`
- Mappings with an **empty** `bases` array
- Mappings where **all base indices are invalid** (no corresponding namebase)
- Partially invalid base arrays (will work, but messy)
- Mapping entries whose ISO does **not** exist in the catalog
- Suggested skeleton for `explicitIsoBaseMap` to help you fill in manual base indices

**Usage**

```bash
node tools/mixer-core/check-language-mixer-failures.js
```

---

### `report-language-mixer-name-counts.js`

**Purpose**

Shows how many (raw and unique) names each mixer language effectively has available, based on its mapped namebases.

**Inputs**

- `config/language-mixer-map.json`
- `config/language-mixes.json`
- `modules/namebases-real.js`, `modules/namebases-fantasy.js`, `modules/namebases-creole.js`, `modules/namebases-all.js`

**Outputs**

- Console table with, for each language:
  - unique name count
  - raw count
  - number of bases
  - whether it has a mapping
  - ISO, name, region, family, category

**Usage**

```bash
node tools/mixer-core/report-language-mixer-name-counts.js [--include-families] [--sort=FIELD]
```

Common `--sort` fields: `unique`, `raw`, `bases`, `duplicates`, `dupRatio`, `iso`, `name`, `region`, `family`, `category`.

Use this when balancing coverage (e.g. finding languages with very few names or lots of duplicates).

---

### `generate-language-samples.js`

**Purpose**

Ad-hoc mixer generator for inspecting **sample names** by language ISO or by raw base indices. Useful for quickly validating new mappings (e.g. Kx'a click+tone bases) and, with `--analyze-lengths`, for tuning **placename length settings** (`min` / `max`) per base.

**Inputs**

- `config/language-mixer-map.json`
- `config/language-mixes.json`
- `modules/namebases-real.js`, `modules/namebases-fantasy.js`, `modules/namebases-creole.js`, `modules/namebases-all.js`

**Outputs**

- Console samples grouped by base index.
- When `--analyze-lengths` is set, per-base length statistics and **suggested** `min` / `max` values. This script is read-only; it does **not** modify any files.

**Usage**

```bash
# Generate 10 samples per mapped base for a mixer language
node tools/mixer-core/generate-language-samples.js --iso=amkoe --per-base=10 --seed=1

# Generate 40 samples cycling between specific bases
node tools/mixer-core/generate-language-samples.js --base=353,354 --count=40 --seed=42

# Placename / length analysis for a mixer language
node tools/mixer-core/generate-language-samples.js --iso=kx-ao-ae --per-base=100 --analyze-lengths

# Placename / length analysis for raw bases
node tools/mixer-core/generate-language-samples.js --base=353,354 --count=200 --analyze-lengths
```

Key options:

- `--iso=ID` – generate via mixer ISO (e.g. `amkoe`, `ekoka-kung`, `vie-central`), printing a block per mapped base.
- `--base=IDX[,IDX...]` – generate directly from one or more base indices (the `i` values from `namebases-*.js`).
- `--per-base=N` – when using `--iso`, number of names to print **and** (with `--analyze-lengths`) number of samples per base for length stats (default `10`).
- `--count=N` – when using `--base`, total number of names to generate across all bases (default `20`).
- `--seed=INT` – seed for deterministic output.
- `--min=INT`, `--max=INT` – temporary overrides for length during generation (useful for experimenting with placename length ranges without editing namebases).
- `--analyze-lengths` – additionally compute and print per-base length distribution (min, max, mean, quartiles) and **suggested** `min` / `max` values you can copy back into `modules/namebases-*.js` for more realistic placename lengths.

---

### `generate-language-pair-samples.js`

**Purpose**

Stress-tests the Markov mixer itself by generating blended names for every ISO pair (or a capped sample) so you can see which combinations never actually mix segments from both languages.

**Inputs**

- `config/language-mixer-map.json`
- `config/language-mixes.json`
- `modules/namebases-real.js`, `modules/namebases-fantasy.js`, `modules/namebases-creole.js`, `modules/namebases-all.js`

**Outputs**

- Console-only report listing:
  - every pair whose generated samples remained monolingual (per-sample breakdown),
  - an end-of-run summary (catalog counts, pairs evaluated, failure count),
  - and a final list of ISOs that were tested but never produced a mixed-segment name in the run (i.e. they still behave monolingually across all tested partners).

**Usage**

```bash
# Small spot check of 25 randomized ISO pairs, 12 samples each
node tools/mixer-core/generate-language-pair-samples.js --max-pairs=25 --sample-count=12 --seed=123

# Deep dive that enforces longer names and more segments
node tools/mixer-core/generate-language-pair-samples.js --max-pairs=200 --sample-count=25 --min=8 --max=18 --max-segments=5
```

Key options:

- `--max-pairs=N` – stop after checking `N` ISO pairs (full catalog can be millions of combinations).
- `--sample-count=N` – number of names to generate per pair.
- `--min`, `--max`, `--max-segments` – override blended name length/segment constraints to stress different regimes.
- `--seed=INT` – deterministic RNG so repeated runs are comparable; omitting it randomizes each run.
- `--include-families` – also test family-level pseudo entries (default skips `tags: ["family"]`).
- `--verbose` – emit an extra line as soon as a monolingual pair is detected (helpful during tuning).

Run this after large mapping sweeps to surface pairs/ISOs that remain monolingual even though they should be blending, then use the per-ISO “never mixed” list as the backlog for rewiring bases.

---

### `compare-language-generators.js`

**Purpose**

Compares two versions of blended name generation (legacy vs current) for a specific mixer ISO or an explicit list of base indices.

**Inputs**

- `config/language-mixer-map.json` (when `--iso` is used)
- `modules/namebases-real.js`, `modules/namebases-fantasy.js`, `modules/namebases-creole.js`, `modules/namebases-all.js`

**Outputs**

- Console-only report: length stats, uniqueness stats, overlap counts, and sample names for each generator.

**Usage**

```bash
node tools/mixer-core/compare-language-generators.js --iso=amkoe --count=20 --seed=1
node tools/mixer-core/compare-language-generators.js --base=353,354 --count=20 --seed=42
```

---

### `compare-mixer-nextgen-to-app.js`

**Purpose**

Compares three generators side-by-side:

- App generator with `legacyChain: true`
- App generator with `legacyChain: false`
- A helper-only “nextgen” generator implemented in this script

This is useful when evaluating potential generator upgrades against the current in-app behavior.

**Inputs**

- `config/language-mixer-map.json` (when `--iso` is used)
- `modules/names-mixer.js` + its dependencies (loaded in a Node `vm` sandbox)
- Namebases (`modules/namebases-*.js` + `modules/namebases-all.js`)

**Outputs**

- Console-only report: summary stats for each generator and a first-N sample diff.

**Usage**

```bash
node tools/mixer-core/compare-mixer-nextgen-to-app.js --iso=amkoe --count=40 --seed=1
node tools/mixer-core/compare-mixer-nextgen-to-app.js --base=353,354 --count=40 --seed=42 --min=15 --max=50
```

---

### `dedupe-language-mixer-map.js`

**Purpose**

Collapses duplicate ISO entries in `config/language-mixer-map.json` (keeping the last occurrence for each ISO) while enforcing the append-only ISO invariant.

**Inputs / Outputs**

- Reads `config/language-mixer-map.json`.
- Writes the same file after removing earlier duplicates; refuses to write if the pre- / post-run ISO set differs.

**Usage**

```bash
node tools/mixer-core/dedupe-language-mixer-map.js
```

Use this immediately after scripts that may have appended overlapping ISO entries (e.g. manual merges) to guarantee one canonical mapping per ISO without risking deletions.

---

### `report-language-history-totals.js`

**Purpose**

Audits git history to ensure no ISO codes have silently disappeared from `language-mixes.json` or `language-mixer-map.json`. Produces count-only stats so we can confirm append-only behavior over time.

**Inputs / Outputs**

- Reads every commit that touched `config/language-mixes.json` or `config/language-mixer-map.json`.
- Writes `tools/mixer-diagnostics/_language-history-totals.json` with historic vs current ISO totals and loss counts.
- Prints a short summary to stdout (commit count, totals, and differences).

**Usage**

```bash
node tools/mixer-core/report-language-history-totals.js
```

Runs read-only against git history; rerun after major migrations to prove no languages were dropped.

---

### `generate-language-mixer.js`

**Purpose**

Builds the lightweight JS bundles that the browser actually loads for the Language Mixer.

**Inputs**

- `config/language-mixes.json`
- `config/language-mixer-map.json`

**Outputs**

- `config/language-mixes-all.js` – bundled catalog (`window.languageMixerCatalog`)
- `config/language-mixer-map.js` – bundled mapping (`window.languageMixerMap`)

**Usage**

```bash
node tools/mixer-core/generate-language-mixer.js
```

Run this after **any** change to `language-mixes.json` or `language-mixer-map.json` so the UI sees the new data.

---

### `diff-language-families.js`

**Purpose**

Compares `family` values between the JSON catalog and the generated `language-mixes-all.js` bundle.

**Inputs**

- `config/language-mixes.json`
- `config/language-mixes-all.js` (generated bundle)

**Outputs**

- Console report detailing:
  - entries whose `family` is only in `language-mixes-all.js` (or JSON lacks the entry)
  - entries whose `family` is only in JSON
  - entries where `family` differs between JSON and bundle

**Usage**

```bash
node tools/mixer-core/diff-language-families.js
```

Use this after regenerating the bundle if you suspect drift between JSON and what’s shipped.

---

## Catalog Shaping (language-mixes.json)

These tools primarily read and rewrite `config/language-mixes.json` to improve metadata for the mixer UI.

### `add-lexifier.js`

**Purpose**

Infers and fills in `lexifier` for creole/pidgin/mixed languages in the catalog.

**Inputs**

- `config/language-mixes.json`

**Outputs**

- **Overwrites** `config/language-mixes.json` (sorted by `region + name`)

**Behavior**

- Filters to entries tagged as Creole/Pidgin/Mixed (via `category` and `tags`).
- For those with missing `lexifier`, tries to infer it from:
  - explicit mapping by name (`explicitLexifierMap`),
  - `family` field (e.g. "X-based"),
  - heuristics over the language’s name and tags.
- Prints how many candidates were considered, how many got a lexifier, and which still need manual attention.

**Usage**

```bash
node tools/mixer-catalog/add-lexifier.js
```

Run this before `fix-language-mixer-mappings.js` to give it better hints for creoles and mixed lects.

---

### `fix-missing-families.js`

**Purpose**

Backfills missing or generic family metadata using existing categories.

**Inputs / Outputs**

- **Reads & overwrites** `config/language-mixes.json`

**Behavior**

- For each language with missing `family` or `family === "Other"`:
  - If `category` is set and not `"Other"`, sets `family = category`.
  - If `category` is missing, sets both `category` and `family` to `"Unclassified"`.
- Sorts the catalog using the standard `region + name` ordering.

**Usage**

```bash
node tools/mixer-catalog/fix-missing-families.js
```

Use this as a cleanup step when you’ve imported or bulk-edited languages with incomplete family data.

---

### `update-romance.js`

**Purpose**

Normalizes Romance entries conservatively.

**Inputs / Outputs**

- **Reads & overwrites** `config/language-mixes.json`

**Behavior**

- For entries with `category === "Romance"`:
  - If `region` is missing, sets it to `"Europe"`.
  - If `family` is missing, sets it to `"Romance"`.
- Does **not** override explicit regions or family names you’ve already set.
- Re-sorts catalog by `region + name`.

**Usage**

```bash
node tools/mixer-regions/update-romance.js
```

Run this after adding or editing Romance languages to keep metadata consistent.

---

### `fill-family-mixes.js`

**Purpose**

Ensures that languages belonging to selected base families in the mixer map all have catalog entries with sensible categories/regions.

**Inputs**

- `config/language-mixer-map.json`
- `config/language-mixes.json`

**Outputs**

- **Overwrites** `config/language-mixes.json`

**Behavior**

- Uses a set of family configs (e.g. `niger-congo-family`, `afroasiatic-family`, `ber-family`, `eastern-romance-family`, `koreanic-family`) plus dynamically discovered families.
- For each such family ISO:
  - Finds all map entries whose `bases[]` are a subset of the family’s `bases[]`.
  - Ensures corresponding catalog entries exist with `category` and `region` filled in.
  - Marks family-level entries with a `"family"` tag.

**Usage**

```bash
node tools/mixer-catalog/fill-family-mixes.js
```

Use this when you’re trying to densify a whole family in the mixer dropdown.

---

### `fill-sino-tibetan-mixes.js`

**Purpose**

Fills catalog coverage for all Sino–Tibetan entries implied by the mixer map.

**Inputs / Outputs**

- Reads `config/language-mixer-map.json`
- Reads and **overwrites** `config/language-mixes.json`

**Behavior**

- Finds the `"proto-sino-tibetan"` entry in the map and treats its `bases[]` as the Sino–Tibetan base set.
- Any mapping whose `bases[]` are all within this set is treated as Sino–Tibetan.
- For each such ISO:
  - Ensures a catalog entry exists with `category: "Sino-Tibetan"` and a default region.
  - For proto entries, adds `"extinct"` and `"unclassified"` tags.

**Usage**

```bash
node tools/mixer-catalog/fill-sino-tibetan-mixes.js
```

Useful once you’ve defined Sino–Tibetan bases and want the UI catalog to match.

---

### `fill-all-missing-mixes.js`

**Purpose**

Backfills catalog entries for **every** ISO present in the mixer map but missing from the catalog.

**Inputs / Outputs**

- Reads `config/language-mixer-map.json`
- Reads and **overwrites** `config/language-mixes.json`

**Behavior**

- Looks at the ISO set from the map and catalog.
- For every ISO present only in the map:
  - Creates a new catalog entry with a humanized name derived from the ISO.
  - Uses a small `META` table to give nicer names/regions/categories for well-known codes.

**Usage**

```bash
node tools/mixer-catalog/fill-all-missing-mixes.js
```

Run this after you’ve expanded the mixer map when you want basic, auto-generated catalog entries for all mapped ISOs.

Note: `fill-missing-mixes-explicit.js` is a narrower, curated-only variant that uses the same META table but only touches a fixed set of important ISOs.

---

### `fill-missing-mixes-explicit.js`

**Purpose**

Final clean-up pass for a curated list of important ISOs: if they’re in the map but still missing from the catalog, add them with hand-picked metadata.

**Inputs / Outputs**

- Reads `config/language-mixer-map.json`
- Reads and **overwrites** `config/language-mixes.json`

**Behavior**

- Uses the same `META` object as in `fill-all-missing-mixes.js` to describe a specific set of languages.
- Adds catalog entries only when an ISO is **both** in the map and missing from the catalog.

**Usage**

```bash
node tools/mixer-catalog/fill-missing-mixes-explicit.js
```

Run this after `fill-family-mixes.js` (and any other family-specific fillers) **if you choose not to run** `fill-all-missing-mixes.js`, but still want the curated set of important ISOs to be covered with rich metadata.

If you already ran `fill-all-missing-mixes.js`, this script will typically be a no-op because those ISOs will already be present in the catalog.

---

### `_meta-fill-missing-mixes.js` (META table)

**Purpose**

Shared internal `META` table used by `fill-all-missing-mixes.js` and `fill-missing-mixes-explicit.js` to attach nicer names, categories, regions, and tags to important ISOs when backfilling `config/language-mixes.json`.

**Location / usage**

- Lives at `tools/mixer-meta/_meta-fill-missing-mixes.js`.
- Exported as `META` and imported by the two fillers above.
- You typically edit this table when adding or retuning curated ISOs (e.g. making sure big languages like `akkadian`, `lat`, `deu`, `yue`, etc. get good display names and metadata).
- It is *not* intended to be run directly as a script.

---

### `add-african-languages.js`

**Purpose**

Adds a curated set of underrepresented African languages to the mixer catalog and, where possible, wires them into the mapping using existing Niger–Congo / Afroasiatic family bases.

- Internally this script uses an `AFRICA_ROWS` table derived from the long `Language / Family / speakers / status` list in the Wikipedia *[Languages of Africa](https://en.wikipedia.org/wiki/Languages_of_Africa)* article (the same table referenced in §8.1 of `DEVplans/Languages-Status.md`).

When the Wikipedia table changes (e.g. new rows added or family labels updated), `AFRICA_ROWS` should be refreshed against that source so the helper continues to reflect the full list while remaining **append-only** with respect to the catalog and mixer map.

**Inputs / Outputs**

- Reads `config/language-mixes.json` and `config/language-mixer-map.json`
- When run with `--apply`, overwrites those files to append new entries

**Behavior**

- For each language in an internal `AFRICA_ROWS` list:
  - Creates a catalog entry with `region: "Africa"` and inferred `category` / `family`.
  - If possible, copies `bases[]` from existing `niger-congo-family` or `afroasiatic-family` map entries.
- Skips any language that already exists in the catalog.
 - Runs in **dry-run mode by default**, reporting how many catalog/mapping entries it would add without writing any files.

**Usage**

```bash
node tools/mixer-catalog/add-african-languages.js           # dry-run only (no writes)
node tools/mixer-catalog/add-african-languages.js --apply   # append new catalog + map entries
```

Run this when expanding African coverage using the curated list of languages. The recommended workflow is to run the script **without** `--apply` first to inspect the summary, and only then re-run it with `--apply` once you are satisfied with the proposed additions.

---

### `add-trans-new-guinea-mixer.js`

**Purpose**

Expands the Papuan / Trans–New Guinea side of the mixer by adding family nodes and leaf languages, and wiring them to appropriate Papuan namebase clusters.

**Inputs / Outputs**

- Reads & overwrites `config/language-mixes.json`
- Reads & overwrites `config/language-mixer-map.json`

**Behavior**

- Ensures a set of Papuan family/branch nodes (e.g. `papuan-family`, `trans-new-guinea`, `timor-alor-pantar`) exist in the catalog and map.
- Adds many leaf languages under these branches with sensible `region`, `category: "Papuan"`, and `family` values.
- Chooses `bases[]` from several Papuan base clusters (highlands, coastal, etc.) depending on the subgroup.

**Usage**

```bash
node tools/mixer-catalog/add-trans-new-guinea-mixer.js
```

Use this after defining Papuan namebases when you want the Trans–New Guinea hierarchy represented in the mixer.

---

### `fill-mongolic-mixes.js`

**Purpose**

Adds and tunes Mongolic and closely related varieties in both the catalog and mixer map, giving them consistent metadata and appropriate Mongolic base indices.

**Inputs / Outputs**

- Reads & overwrites `config/language-mixes.json`
- Reads & overwrites `config/language-mixer-map.json`

**Behavior**

- Upserts a large set of Mongolic entries (Khalkha, Oirat-Kalmyk, Buryat, Dagur, Yugur, Shirongolic, Baoanic, Santa/Dongxiang, historical Mongolic, etc.).
- For each ISO in a `MONGOLIC_BASES` table, overwrites or creates a mapping entry with the desired `bases[]` (typically combinations of Mongolian, Buryat, Kalmyk, and Chinese indices).
- Re-sorts both catalog and map for stable output.

**Usage**

```bash
node tools/mixer-catalog/fill-mongolic-mixes.js
```

Run this when working on Mongolic coverage so catalog and mappings stay in sync.

---

## Namebase Maintenance

These tools work on the underlying namebases used by the mixer, not the catalog itself.

### `report-namebase-duplicates.js`

**Purpose**

Scans all default namebases and reports internal duplicate place names per base index.

**Inputs**

- `modules/namebases-real.js`
- `modules/namebases-fantasy.js`
- `modules/namebases-creole.js`
- `modules/namebases-all.js` (populates `window.defaultNameBases`)

**Outputs**

- Console report listing bases with:
  - base index and name
  - raw count vs unique count
  - number of duplicates and example duplicate names

**Usage**

```bash
node tools/mixer-namebases/report-namebase-duplicates.js
```

Use this to identify messy bases before deduplication.

---

### `dedupe-namebase-duplicates.js`

**Purpose**

Automatically deduplicates the `b: "..."` name lists for a fixed set of base indices.

**Inputs / Outputs**

- Reads & overwrites:
  - `modules/namebases-real.js`
  - `modules/namebases-fantasy.js`
  - `modules/namebases-creole.js`

**Behavior**

- Uses `targetIndices` (collected from the duplicate report) to choose which bases to touch.
- For each targeted base, splits the `b` list on commas, trims, removes duplicates while preserving first-occurrence order, and writes the cleaned list back.
- Logs which bases changed and by how much.

**Usage**

```bash
node tools/mixer-namebases/dedupe-namebase-duplicates.js
```

Use this after reviewing `report-namebase-duplicates.js` to safely clean specific bases.

---

### `check-namebase-lengths.js`

**Purpose**

Checks whether each base's configured `min` / `max` length range matches how its seed names and generated names actually behave, and flags bases whose real lengths look like outliers.

**Inputs**

- `modules/namebases-real.js`
- `modules/namebases-fantasy.js`
- `modules/namebases-creole.js`
- `modules/namebases-all.js`
- `modules/names-generator.js`

**Outputs**

- Console report for bases whose seed / generated length stats do not line up well with the configured `min` / `max`.

**Behavior**

- Loads `defaultNameBases` and the Markov generator (`Names.getBase`) into a sandbox.
- For each base (or selected bases):
  - Computes seed-based length stats from the raw `b` blob.
  - Generates a configurable number of sample names via `Names.getBase` and computes generated length stats.
  - Compares seed + generated stats against the configured `min` / `max` and reports bases whose ranges look suspicious.

**Usage**

```bash
node tools/mixer-namebases/check-namebase-lengths.js [--base=IDX[,IDX...]] [--count=N] [--seed=INT] [--show-all]
```

Run this after you tune namebase `min` / `max` values or when investigating odd-length behavior in generated names.

---

## Mixer Diagnostics & Cleanup

These helpers report on the health and structure of the mixer catalog and mapping, and a few perform focused clean-up passes.

### `run-language-mixer-health.js`

**Purpose**

Runs a read-only diagnostics suite over the mixer catalog and mapping, aggregating the outputs of several health checks into a single summarized report.

**What it runs**

By default it runs, in order:

- `diff-language-families.js`
- `check-language-mixer-coverage.js`
- `check-language-mixer-failures.js`
- `check-language-mixer-name-duplicates.js`
- `report-language-mixer-duplicates.js`
- `report-language-mixer-base-clusters.js`

It then prints a short summary of each tool’s stdout.

**Usage**

```bash
node tools/mixer-core/run-language-mixer-health.js [options]
```

Options:

- `--no-family-diff`  skip `diff-language-families.js`
- `--no-coverage`  skip `check-language-mixer-coverage.js`
- `--no-failures`  skip `check-language-mixer-failures.js`
- `--no-name-dups`  skip `check-language-mixer-name-duplicates.js`
- `--no-fuzzy-dups`  skip `report-language-mixer-duplicates.js`
- `--no-base-clusters`  skip `report-language-mixer-base-clusters.js`
- `--full-output`  show full stdout from each tool instead of only the first paragraph
- `--base-min-size=N`  forward `--min-size=N` to `report-language-mixer-base-clusters.js`
- `--base-family=VALUE`  forward `--family=VALUE` to `report-language-mixer-base-clusters.js`
- `--base-category=VALUE`  forward `--category=VALUE` to `report-language-mixer-base-clusters.js`
- `--base-region=VALUE`  forward `--region=VALUE` to `report-language-mixer-base-clusters.js`

Use this when you want a quick, read-only health snapshot without running any mutating helpers.

---

### `check-language-mixer-map-duplicate-isos.js`

**Purpose**

Read-only helper that reports duplicate ISO rows inside `config/language-mixer-map.json`.

**Inputs / Outputs**

- Reads `config/language-mixer-map.json`.
- Prints a console report (no files changed).

**Usage**

```bash
node tools/mixer-diagnostics/check-language-mixer-map-duplicate-isos.js
```

---

### `dedupe-language-mixer-map-duplicate-isos.js`

**Purpose**

Removes **exact duplicate rows** in `config/language-mixer-map.json` (same `iso` and same `bases[]`).

This helper is conservative:

- Dry-run by default.
- With `--apply`, it only removes exact duplicates.
- If the same ISO appears with **different** base arrays, it does not modify those rows and instead reports them for manual resolution.

**Inputs / Outputs**

- Reads `config/language-mixer-map.json`.
- With `--apply`, rewrites `config/language-mixer-map.json` (while guarding against ISO loss).

**Usage**

```bash
node tools/mixer-diagnostics/dedupe-language-mixer-map-duplicate-isos.js
node tools/mixer-diagnostics/dedupe-language-mixer-map-duplicate-isos.js --apply
```

---

### `report-language-mixer-iso-diff-vs-head.js`

**Purpose**

Reports ISO set differences between the current working copy of `config/language-mixer-map.json` and `HEAD:config/language-mixer-map.json`.

**Inputs / Outputs**

- Reads current `config/language-mixer-map.json`.
- Reads `HEAD:config/language-mixer-map.json` via `git show`.
- Prints a console summary (no files changed).

**Usage**

```bash
node tools/mixer-diagnostics/report-language-mixer-iso-diff-vs-head.js
```

---

### `merge-language-mixer-from-head.js`

**Purpose**

One-shot helper to merge `HEAD`'s `config/language-mixer-map.json` into the working copy in an append-only way:

- For each ISO present in HEAD but missing in the current file, append the HEAD entry.
- Never deletes or overwrites existing rows.

**Inputs / Outputs**

- Reads current `config/language-mixer-map.json`.
- Reads `HEAD:config/language-mixer-map.json` via `git show`.
- Rewrites current `config/language-mixer-map.json` (append-only).

**Usage**

```bash
node tools/mixer-diagnostics/merge-language-mixer-from-head.js
```

---

### `report-wikipedia-list-coverage.js`

**Purpose**

Reports coverage for a single Wikipedia language list JSON by checking, for each listed language, whether it has entries in `config/language-mixes.json` and `config/language-mixer-map.json`.

**Inputs / Outputs**

- Input JSON may be either:
  - an array of `{ name, iso?, skip? }` items, or
  - an object `{ title, source, items }` where `items` is that array.
- Reads (without writing):
  - `config/language-mixes.json`
  - `config/language-mixer-map.json`
- Prints a console summary plus per-item detail for missing / unmatched / ambiguous entries.

**Behavior**

- For each item:
  - If `skip: true`, marks it as `skipped` (not counted toward coverage).
  - Otherwise resolves `iso` (from `item.iso` or by matching `name` against the catalog).
  - Classifies status as `full`, `missing-catalog`, `missing-map`, `missing-both`, `unmatched`, or `ambiguous`.
- Aggregates counts and prints a coverage summary plus grouped per-category lists of problem items for all non-`full` statuses (`missing-catalog`, `missing-map`, `missing-both`, `unmatched`, `ambiguous`).
- Computes and prints a `Nonunique Bases` line, counting how many **considered** list items map to ISOs that do **not** have a globally unique `bases[]` set in the mixer map (family-macro catalog entries tagged with `"family"` are excluded from this uniqueness check).

**Usage**

```bash
node tools/mixer-core/report-wikipedia-list-coverage.js path/to/list.json
```

Use this when iterating on a specific Wikipedia list JSON and you want a quick read-only view of what is wired vs missing before updating any devplans.

---

### `update-wikipedia-list-coverage-in-devplan.js`

**Purpose**

Computes coverage for a Wikipedia list JSON (using the same logic as `report-wikipedia-list-coverage.js`) and automatically refreshes the corresponding `Snapshot from last run` block in `DEVplans/Languages-Status.md` for that list.

**Inputs / Outputs**

- Arguments:
  - `<list-json-rel-path>` – relative path to the list JSON under the project root.
  - `[DEVPLAN_REL]` – optional devplan Markdown path (defaults to `DEVplans/Languages-Status.md`).
- Reads (without writing):
  - the list JSON (array or `{ title, source, items }`).
  - `config/language-mixes.json`
  - `config/language-mixer-map.json`
- Writes:
  - updates the snapshot lines under the `- **JSON file:**` entry matching the list path in the target devplan.

**Behavior**

- Resolves list items exactly as `report-wikipedia-list-coverage.js` does, including `skip: true` handling.
- Locates the `- **JSON file:** \`...\`` line in the devplan and the following `- **Snapshot from last run (all list items):` block.
- Rewrites the per-status counts (`fully wired`, `missing catalog`, `missing map`, `missing both`, `unmatched`, `ambiguous`) based on the current run, and, when present, refreshes the `Nonunique Bases` line using the same logic as `report-wikipedia-list-coverage.js`.

**Usage**

```bash
node tools/mixer-core/update-wikipedia-list-coverage-in-devplan.js \
  tools/mixer-meta/wikipedia-languages-of-africa-full.json
```

Run this **instead of manually editing coverage snapshots** whenever you change a list JSON or after wiring more languages; it keeps `Languages-Status.md` in sync with the actual mixer catalog/map.

**Global policy for Wikipedia list JSONs**

- For each Wikipedia **language list article**, there should be **one canonical full-list JSON** (e.g. `*-full.json`) that contains **every language row from the article**, subject to these exceptions:
  - **Sign languages** are tracked but excluded from coverage by marking them with `"skip": true`.
  - **Truly unreconstructible extinct languages** (no speakers and not meaningfully studied) may be omitted; extinct languages that are still studied or partly reconstructible **are in scope** and should be included.
- Historical `*-seed` / `*-subset` JSONs are deprecated and removed; helpers and coverage snapshots operate only on the canonical full-list JSONs.
- Once a language exists in the mixer catalog or map, these helpers must **never remove it**; coverage work is additive and driven by wiring missing languages, not by deleting them.
- In this project, a list item is not considered **fully wired** until it has a catalog entry, a mixer-map entry, and a **globally unique `bases[]` array**. Shared `bases[]` arrays are treated as uniqueness debt unless the sharing is linguistically defensible as the *same language* via a true alias, or the row is explicitly excluded from coverage via `skip: true`. The `Nonunique Bases` metric surfaced by these helpers is a per-list snapshot of how many in-scope items still lack globally unique `bases[]` signatures.

Use this helper as the final step in a Wikipedia list workflow: first sync the JSON to the live article, then wire missing languages in catalog/map, and finally re-run this script to refresh the devplan snapshot.

---

### `report-wikipedia-list-base-uniqueness.js`

**Purpose**

Summarizes base-set uniqueness and remaining shared-base debt for a single Wikipedia language list JSON, using the global mixer map.

**Inputs / Outputs**

- Input JSON format matches `report-wikipedia-list-coverage.js`:
  - an array of `{ name, iso?, skip? }`, or
  - an object `{ title, source, items }` with that array under `items`.
- Reads (without writing):
  - `config/language-mixes.json`
  - `config/language-mixer-map.json`
- Prints a console summary including:
  - wiring status counts (full / missing-catalog / missing-map / missing-both / unmatched / ambiguous),
  - a **global base-index snapshot**:
    - `Nonunique Bases (non-skipped items): N` – how many list items **do not** have any base index that is globally unique to their ISO in the mixer map (family-macro catalog entries tagged with `"family"` are excluded from the uniqueness check),
  - and, for full items only, base-set uniqueness:
    - `unique bases: X`
    - `clustered bases: Y`
  - plus an optional per-language dump of clustered full items.

**Behavior**

- Resolves list items exactly as `report-wikipedia-list-coverage.js` does, including `skip: true` handling.
- For **all non-skipped items**, computes `Nonunique Bases` as:
  - total non-skipped list items minus those whose ISO has at least one base index that is used **only** by that ISO in `language-mixer-map.json` (with family-macro catalog entries ignored).
- For items with status `full`, groups mixer-map entries by normalized `bases[]` set to distinguish:
  - languages whose `bases[]` set is globally unique, and
  - languages still sitting in shared base-set clusters.

**Usage**

```bash
node tools/mixer-core/report-wikipedia-list-base-uniqueness.js path/to/list.json
```

Use this alongside `report-wikipedia-list-coverage.js` when you want a per-list view of how many languages are still sharing bases globally (`Nonunique Bases`) and which fully wired items remain in shared `bases[]` clusters.

---

### `report-wikipedia-list-mixer-bases.js`

**Purpose**

For each resolved Wikipedia list item, prints its ISO, its `bases[]` signature in the mixer map, and the size/membership of the global base-set cluster it belongs to.

This is useful for quickly spotting where a list’s “fully wired” items are still sitting in large global base clusters.

**Inputs / Outputs**

- Reads (without writing):
  - list JSON (`tools/mixer-meta/*.json`)
  - `config/language-mixes.json`
  - `config/language-mixer-map.json`
- Console-only TSV output.

**Usage**

```bash
node tools/mixer-core/report-wikipedia-list-mixer-bases.js tools/mixer-meta/wikipedia-languages-of-africa-full.json
```

---

### `check-official-languages-unique-bases.js`

**Purpose**

Quick uniqueness audit for the institutional languages list (`wikipedia-list-official-languages-by-institution-full.json`): reports which of those languages still share the same sorted `bases[]` set with other ISOs in the global mixer map.

**Inputs / Outputs**

- Reads (without writing):
  - `tools/mixer-meta/wikipedia-list-official-languages-by-institution-full.json`
  - `config/language-mixes.json`
  - `config/language-mixer-map.json`
- Console report only.

**Usage**

```bash
node tools/mixer-meta/check-official-languages-unique-bases.js
```

---

### `generate-wikipedia-languages-of-africa-full.js`

**Purpose**

Regenerates `tools/mixer-meta/wikipedia-languages-of-africa-full.json` from the `AFRICA_ROWS` table embedded in `tools/mixer-catalog/add-african-languages.js`.

This is primarily for keeping the list JSON in sync with the internal curated table.

**Inputs / Outputs**

- Reads `tools/mixer-catalog/add-african-languages.js` (imports `AFRICA_ROWS`).
- Writes `tools/mixer-meta/wikipedia-languages-of-africa-full.json`.

**Usage**

```bash
node tools/mixer-meta/generate-wikipedia-languages-of-africa-full.js
```

---

### `run-wikipedia-list-helpers.js`

**Purpose**

Runs the Wikipedia list helpers across **all** JSONs registered in the §8 "Wikipedia language list coverage registry" of `DEVplans/Languages-Status.md` (or an alternate devplan you specify).

**Inputs / Outputs**

- Reads:
  - `DEVplans/Languages-Status.md` (or another devplan if you pass it) to discover all `- **JSON file:** \`...json\`` entries under the Wikipedia registry.
  - For each discovered JSON:
    - the list JSON itself,
    - `config/language-mixes.json`,
    - `config/language-mixer-map.json`.
- Writes:
  - When enabled, calls `update-wikipedia-list-coverage-in-devplan.js` to refresh the per-list `Snapshot from last run` block in the devplan for each JSON.
- Prints:
  - A list of all discovered JSON paths (optionally filtered),
  - For each JSON, the stdout from:
    - `update-wikipedia-list-coverage-in-devplan.js` (if not disabled),
    - `report-wikipedia-list-base-uniqueness.js` (if not disabled), including the per-list `Nonunique Bases` line.

**Behavior**

- Parses the target devplan for all lines of the form:
  - `- **JSON file:** \`tools/mixer-meta/whatever.json\``
- Optionally filters this set via `--filter=SUBSTR` on the JSON path.
- For each matching JSON that actually exists on disk, runs (unless disabled):
  - `update-wikipedia-list-coverage-in-devplan.js <json> <DEVPLAN_REL>` – refreshes the snapshot block for that list,
  - `report-wikipedia-list-base-uniqueness.js <json>` – prints wiring counts, base-set uniqueness, and the global `Nonunique Bases (non-skipped items)` snapshot for the list.

**Usage**

```bash
node tools/mixer-core/run-wikipedia-list-helpers.js [DEVPLAN_REL] [options]

# Typical: run for all lists in the main devplan
node tools/mixer-core/run-wikipedia-list-helpers.js

# Preview which JSONs would be touched, without running helpers
node tools/mixer-core/run-wikipedia-list-helpers.js --list-only

# Restrict to JSONs whose path contains "europe" or "north-america"
node tools/mixer-core/run-wikipedia-list-helpers.js --filter=europe
node tools/mixer-core/run-wikipedia-list-helpers.js --filter=north-america
```

Options:

- `DEVPLAN_REL` – optional first argument; defaults to `DEVplans/Languages-Status.md`.
- `--list-only` – only list discovered JSON paths and exit; do **not** run any helpers.
- `--no-devplan` – skip `update-wikipedia-list-coverage-in-devplan.js` (no devplan writes; only base-uniqueness reports).
- `--no-base-uniqueness` – skip `report-wikipedia-list-base-uniqueness.js` (devplan snapshots only).
- `--filter=SUBSTR` – only process JSON paths that contain the given substring.

Use this orchestrator when you want to refresh **all** Wikipedia list snapshots and/or base-uniqueness summaries in one pass, instead of running the helpers manually per JSON.

---

### `check-language-mixer-name-duplicates.js`

**Purpose**

Reports **exact** duplicate language names in `config/language-mixes.json` (byte-for-byte identical `name` strings after trimming).

**Inputs**

- `config/language-mixes.json`

**Outputs**

- Console report listing each duplicated name and the corresponding catalog entries (ISO, region, family, category, tags).

**Usage**

```bash
node tools/mixer-diagnostics/check-language-mixer-name-duplicates.js
```

Use this when you want a strict view of name collisions, complementary to the normalized-name clusters below.

---

### `report-language-mixer-duplicates.js`

**Purpose**

Finds potentially non-unique languages in the catalog by:

- Detecting duplicate ISO codes.
- Grouping entries that normalize to the same language name (after stripping generic suffixes and parentheses), while skipping groups that are clearly pure family macros.

**Inputs**

- `config/language-mixes.json`

**Outputs**

- Console report with duplicate ISOs and normalized-name clusters, indicating which entries are higher-level families vs. concrete languages.

**Usage**

```bash
node tools/mixer-diagnostics/report-language-mixer-duplicates.js
```

Use this when refactoring or de-duplicating the catalog; it provides a broader, fuzzier picture than the exact-name checker.

---

### `report-language-mixer-base-clusters.js`

**Purpose**

Shows clusters of catalog languages that share **identical** `bases[]` sets in `config/language-mixer-map.json`.

**Inputs**

- `config/language-mixer-map.json`
- `config/language-mixes.json`

**Outputs**

- Console report listing, for each base-set cluster above a configurable size, the shared `bases[]` and all member languages (ISO, name, region, family, category, tags).

**Usage**

```bash
node tools/mixer-diagnostics/report-language-mixer-base-clusters.js [--min-size=N] [--family=...] [--category=...] [--region=...]
```

Useful for spotting over-dense mappings (many languages all reusing the same base set) or opportunities to split clusters.

---

### `report-lost-language-mappings.js`

**Purpose**

Detects languages that existed in the previous revision (`HEAD~1`) of either the catalog or the map but are missing in the current working copy, then captures their metadata/bases into a snapshot for follow-up remediation.

**Inputs / Outputs**

- Reads `config/language-mixes.json` and `config/language-mixer-map.json` from both `HEAD~1` and the working tree.
- Writes `tools/mixer-diagnostics/_lost-languages-from-declustering.json`, containing per-ISO before/after metadata and base arrays.
- Prints summary counts (lost from map, catalog, both, etc.) to stdout.

**Usage**

```bash
node tools/mixer-diagnostics/report-lost-language-mappings.js
```

Run immediately after a large declustering/surgery commit to verify no languages vanished; the generated JSON feeds the restore helper below.

---

### `restore-lost-language-mappings.js`

**Purpose**

Replays the snapshot generated by the previous helper, re-inserting any ISOs that vanished from `language-mixer-map.json` while leaving existing entries untouched (idempotent append-only restore).

**Inputs / Outputs**

- Reads `tools/mixer-diagnostics/_lost-languages-from-declustering.json`.
- Reads / overwrites `config/language-mixer-map.json`, appending `{iso, basesBefore}` for any ISO absent from the current map.
- Emits counts of restored vs skipped entries.

**Usage**

```bash
node tools/mixer-diagnostics/restore-lost-language-mappings.js
```

Use this after inspecting the lost-language snapshot to reapply any accidentally removed mappings before proceeding with further rewires.

---

### `select-language-mixer-base-batch.js`

**Purpose**

Flattens all languages that share identical `bases[]` sets into a single ordered "issue list" and selects a worker-specific batch, so multiple people or runs can split the work of giving each language a unique base set.

**Inputs**

- `config/language-mixer-map.json`
- `config/language-mixes.json`

**Outputs**

- Console summary of cluster sizes and total "issue" languages.
- A per-worker batch listing:
  - global index
  - ISO and name
  - region, family, category, tags
  - shared `bases[]` set

**Behavior**

- Groups catalog languages by normalized base-set key (sorted unique `bases[]`).
- Keeps only clusters whose size is at least `--min-size` (default `2`).
- Applies optional filters on family, category, and region, and can skip entire base sets via `--skip-base-sets`.
- Flattens the remaining clusters into a deterministic list and slices out the requested worker batch.

**Usage**

```bash
node tools/mixer-diagnostics/select-language-mixer-base-batch.js \
  [--include-families] [--min-size=N] [--family=VAL] [--category=VAL] [--region=VAL] \
  [--worker=N] [--batch-size=N] [--skip-base-sets="9;140;18,23"]
```

Use this together with `report-language-mixer-base-clusters.js` when you are systematically de-duplicating base-set clusters across many languages.

---

### `select-language-mixer-batch.js`

**Purpose**

Similar to the base-batch helper, but instead of grouping by base-set, it flattens every catalog language (after filters) into a deterministic order so `/language-uniqueness` workers can pull numbered batches of individual languages for rewiring or QA.

**Inputs**

- `config/language-mixer-map.json`
- `config/language-mixes.json`

**Outputs**

- Console summary with total languages considered, duplicate-base counts (if `--min-size` > 1), and the requested batch range.
- Detailed per-entry lines containing 1-based index, ISO, name, region, family, category, tags, bases, and cluster metadata.

**Usage**

```bash
node tools/mixer-diagnostics/select-language-mixer-batch.js \
  [--include-families] [--min-size=N] \
  [--family=VAL] [--category=VAL] [--region=VAL] \
  [--batch=N] [--batch-size=N]
```

Use this when coordinating `/language-uniqueness` or `/decluster-language-bases` workflows: assign each worker a `--batch` number and point them at the corresponding slice of languages/output rows to process.

---

### `check-language-mixer-map-inconsistencies.js`

**Purpose**

Runs a sanity sweep over the mixer catalog and mapping to surface coverage mismatches, orphaned entries, and suspicious base usage. Recent versions also highlight bases with invalid weights or other anomalies so they can be fixed upstream.

**Inputs**

- `config/language-mixes.json`
- `config/language-mixer-map.json`
- `modules/namebases-real.js`, `modules/namebases-fantasy.js`, `modules/namebases-creole.js`, `modules/namebases-all.js`

**Outputs**

- Console report including:
  - Catalog languages (after filters) with no mapping or with empty `bases[]`.
  - Map entries that have no corresponding catalog mix under the current filters.
  - For each base index in scope, a summary of which families/regions/ISOs use it, flagging bases shared across multiple unrelated groups.
  - A per-base warning block for unusual conditions (e.g., invalid weights, unrecognized base indices, or bases referenced far outside their home family).

**Usage**

```bash
node tools/check-language-mixer-map-inconsistencies.js \
  [--family=NAME] [--category=NAME] [--region=NAME] [--limit=N] \
  [--base=IDX[,IDX...]] [--show-all-bases]
```

Run this when you want to investigate suspicious base reuse, coverage mismatches, or invalid weight issues for a particular family/region, or before large declustering passes to understand which bases look risky.

---

### `profile-language-mixes.js`

**Purpose**

Profiles mixer languages (by ISO) to compare their catalog metadata, mapped bases, seed statistics, and script profile. Recent revisions also call out lexifier/region/family mismatches between catalog and map entries and flag duplicate catalog names so they can be cleaned up.

**Inputs**

- `config/language-mixes.json`
- `config/language-mixer-map.json`
- `modules/namebases-real.js`, `modules/namebases-fantasy.js`, `modules/namebases-creole.js`, `modules/namebases-all.js`

**Outputs**

- Console report with, for each matching ISO:
  - region, family, category, lexifier
  - mapped base indices + names, and per-base configured `min/max`
  - aggregated seed-length stats across all mapped bases, plus script/character analysis
  - warnings when catalog metadata disagrees with the mix (e.g., lexifier drift) or when the ISO shares its display name with other catalog entries

**Usage**

```bash
node tools/profile-language-mixes.js \
  [--iso=ID] [--family=NAME] [--category=NAME] [--region=NAME] [--limit=N]
```

Use this when tuning min/max settings, checking lexifier accuracy, or building `/language-uniqueness` backlogs (the duplicate-name callouts help surface naming collisions that still need work).

---

### `check-special-families.js`

**Purpose**

Summarizes coverage, metadata quality, and base-uniqueness debt for a handful of special catalog groupings (Hmong–Mien/Yao, isolates/unclassified, Paleosiberian/Arctic fringe, Uralic branches). Can be narrowed to a single group if you only want to inspect one family.

**Inputs**

- `config/language-mixes.json`
- (optional) `config/language-mixer-map.json` for base-uniqueness stats

**Outputs**

- Per-group counts showing how many entries are missing `region`, `family`, or `category`
- For each group, a sample list plus a base-uniqueness summary (how many members still share `bases[]`)
- Combined totals across all groups

**Usage**

```bash
node tools/mixer-diagnostics/check-special-families.js [--family=GROUP_ID]
```

Use `--family=hmong_mien|isolates_unclassified|paleosiberian_arctic|uralic_cluster` to focus on a single block; otherwise all groups are reported. Run this before/after regional updaters to see which special families still need metadata or base work.

---

### `clean-language-mixer-map.js`

**Purpose**

Diagnostic tool to spot mapping entries whose ISO no longer exists in `language-mixes.json` (“orphaned” rows). Under the project’s append-only policy it now runs strictly in dry-run mode: it refuses to rewrite the map and instead points you at `report-lost-language-mappings.js` / `restore-lost-language-mappings.js` if remediation is required.

**Inputs / Outputs**

- Reads `config/language-mixes.json` and `config/language-mixer-map.json`
- Always prints counts and up to 50 sample orphaned entries; never rewrites files

**Behavior**

- Builds the catalog ISO set and compares it to the map
- Prints totals before/after and how many rows would be dropped
- Even when invoked with `--apply`, it simply reminds you that rewriting is disabled (guarding against accidental deletions)
**Usage**

```bash
node tools/mixer-diagnostics/clean-language-mixer-map.js        # dry run, report only
node tools/mixer-diagnostics/clean-language-mixer-map.js --apply # rewrite map to drop orphaned rows
```

Under the current no-deletion invariant for languages, you should generally use the **dry run** mode as a diagnostic to understand map/catalog mismatches. If you ever choose to run with `--apply`, treat it as an explicit, high-scrutiny refactor step and immediately regenerate bundles with `generate-language-mixer.js` and re-run coverage/uniqueness diagnostics.

---

### `retune-african-mappings.js`

**Purpose**

Reassigns African languages that still share the generic Niger–Congo / Afroasiatic base mixes to more specific single-base indices (Bambara, Yoruba, Somali, etc.), based on token heuristics. Runs in dry-run mode by default and only writes when `--apply` is provided.

**Inputs / Outputs**

- Reads `config/language-mixes.json` and `config/language-mixer-map.json`
- Without `--apply`, prints which ISOs would be retuned and exits
- With `--apply`, rewrites `config/language-mixer-map.json` after enforcing the “no ISO loss” guard (it refuses to write if the ISO set would shrink)

**Usage**

```bash
node tools/mixer-diagnostics/retune-african-mappings.js [--apply] [--backup=REL_PATH]
```

Flags:

- `--apply` – actually write the updated map (dry-run otherwise)
- `--backup=REL_PATH` – optional path to save the pre-change map for manual diffing

Run this after bulk-importing African catalog entries so the generic family mappings get split into realistic per-language bases, and only commit the changes once you’ve reviewed the dry-run output.

---

### `fix-language-mixer-mappings.head.js`

**Purpose / status**

Historical/experimental variant of `fix-language-mixer-mappings.js` kept for reference. It is **not** used by `run-language-mixer-suite.js` and is generally not part of the normal workflow.

Prefer `fix-language-mixer-mappings.js` unless you have a specific reason to inspect or compare this older variant.

---

## Regional / Family Updaters

These helpers normalize `category`, `family`, and `region` metadata for specific macrofamilies in `config/language-mixes.json`. All of them read & overwrite that file and re-sort entries by `region + name`.

### `update-language-tags.js`

**Purpose**

Adds consistent semantic tags (e.g. `family`, `dialect`, `proto`, `historical`, `judeo`) based on the language's name and ISO.

**Behavior**

- Marks obvious family/group entries with `"family"`.
- Tags dialect collections with `"dialect"`.
- Tags proto / historical varieties with `"proto"` and/or `"historical"`.
- Tags Judaeo-/Judeo- varieties with `"judeo"`.

**Usage**

```bash
node tools/mixer-regions/update-language-tags.js
```

Run this after adding or renaming macro entries so their tags stay consistent.

---

### `update-afroasiatic.js`

**Purpose**

Normalizes Afroasiatic entries.

**Behavior**

- Targets entries where `category === "Afroasiatic"` or `family === "Afroasiatic"` when `category` is missing.
- Ensures `category: "Afroasiatic"`, `family: "Afroasiatic"` (when family is missing/"Other"/"Unclassified"), and `region: "Afroasiatic region"` when missing.

**Usage**

```bash
node tools/mixer-regions/update-afroasiatic.js
```

---

### `update-austroasiatic.js`

**Purpose**

Normalizes Austroasiatic and related subfamilies (Aslian, Munda, Bahnaric, Katuic, Nicobarese, Pearic, Khmeric, Khmuic, Pakanic, Khasic).

**Behavior**

- Targets entries whose category is "Austroasiatic" or whose family is one of those Austroasiatic subfamilies.
- Ensures `category: "Austroasiatic"`, `family: "Austroasiatic"` (when missing/"Other"/"Unclassified"), and `region: "Asia"` when missing.

**Usage**

```bash
node tools/mixer-regions/update-austroasiatic.js
```

---

### `update-austronesian.js`

**Purpose**

Normalizes Austronesian entries.

**Behavior**

- Targets entries where `category === "Austronesian"` or `family === "Austronesian"` when `category` is missing.
- Ensures `category: "Austronesian"`, `family: "Austronesian"` (when missing/"Other"/"Unclassified"), and, if `region` is missing, sets it to `"Pacific"`.

**Usage**

```bash
node tools/mixer-regions/update-austronesian.js
```

---

### `update-dravidian.js`

**Purpose**

Normalizes Dravidian entries.

**Behavior**

- Targets entries where `category === "Dravidian"` or `family === "Dravidian"` when `category` is missing.
- Ensures `category: "Dravidian"`, `family: "Dravidian"` (when missing/"Other"/"Unclassified"), and `region: "Asia"` when missing.

**Usage**

```bash
node tools/mixer-regions/update-dravidian.js
```

---

### `update-hmong-mien.js`

**Purpose**

Normalizes Hmong–Mien entries.

**Behavior**

- Targets entries where `category === "Hmong-Mien"` or `family === "Hmong-Mien"` when `category` is missing.
- Ensures `category: "Hmong-Mien"`, `family: "Hmong-Mien"` (when missing/"Other"/"Unclassified"), and `region: "East Asia"` when missing.

**Usage**

```bash
node tools/mixer-regions/update-hmong-mien.js
```

---

### `update-indo-aryan.js`

**Purpose**

Normalizes Indo-Aryan entries.

**Behavior**

- Targets entries where `category === "Indo-Aryan"` or `family` contains "Indo-Aryan" when `category` is missing.
- Ensures `category: "Indo-Aryan"`, `family: "Indo-Aryan"` (when missing/"Other"/"Unclassified"), and `region: "Asia"` when missing.

**Usage**

```bash
node tools/mixer-regions/update-indo-aryan.js
```

---

### `update-kartvelian.js`

**Purpose**

Normalizes Kartvelian (South Caucasian) entries.

**Behavior**

- Targets entries where `category === "Kartvelian"` or `family === "Kartvelian"` when `category` is missing.
- Ensures `category: "Kartvelian"`, `family: "Kartvelian"` (when missing/"Other"/"Unclassified"), and `region: "Caucasus"` when missing.

**Usage**

```bash
node tools/mixer-regions/update-kartvelian.js
```

---

### `update-niger-congo.js`

**Purpose**

Normalizes Niger–Congo entries.

**Behavior**

- Targets entries where `category === "Niger-Congo"` or `family === "Niger-Congo"` when `category` is missing.
- Ensures `category: "Niger-Congo"`, `family: "Niger-Congo"` (when missing/"Other"/"Unclassified"), and `region: "Africa"` when missing.

**Usage**

```bash
node tools/mixer-regions/update-niger-congo.js
```

---

### `update-turkic.js`

**Purpose**

Normalizes Turkic entries.

**Behavior**

- Targets entries where `category === "Turkic"` or `family` contains "Turkic" when `category` is missing.
- Ensures `category: "Turkic"`, `family: "Turkic"` (when missing/"Other"/"Unclassified"), and `region: "Asia"` when missing.

**Usage**

```bash
node tools/mixer-regions/update-turkic.js
```

---

### `update-uralic.js`

**Purpose**

Normalizes Uralic entries (including Finnic, Sami, Samoyedic, Ugric, etc.).

**Behavior**

- Targets entries where `category === "Uralic"` or `family` mentions Uralic-related branches (Finnic, Sami/Saami, Khanty, Mansi, Nenets, Nganasan, Selkup, Enets, Mari, Mordvin, Komi, Udmurt, Karelian, Veps, Votic, Livonian, Hungarian, etc.) when `category` is missing.
- Ensures `category: "Uralic"`, `family: "Uralic"` (when missing/"Other"/"Unclassified"), and `region: "Eurasia"` when missing.

**Usage**

```bash
node tools/mixer-regions/update-uralic.js
```

---

## Race Language Coverage & Palettes

These read-only helpers inspect how fantasy race language profiles interact with the mixer catalog.

### `run-race-language-suite.js`

**Purpose**

Runs a small suite of race-related language diagnostics and prints summarized outputs from multiple helpers.

**What it runs**

By default it runs, in order:

- `check-race-language-profiles.js`
- `report-per-race-language-coverage.js`
- `report-race-language-coverage.js`
- `report-race-language-palettes.js`

**Usage**

```bash
node tools/mixer-races/run-race-language-suite.js [options]
```

Options:

- `--no-profiles`  skip `check-race-language-profiles.js`
- `--no-per`  skip `report-per-race-language-coverage.js`
- `--no-coverage`  skip `report-race-language-coverage.js`
- `--no-palettes`  skip `report-race-language-palettes.js`
- `--full-output`  show full stdout from each tool instead of only the first paragraph

Use this when tuning raceLanguageProfiles or race palettes and you want a single command to run the core race diagnostics.

---

### `check-race-language-profiles.js`

**Purpose**

Lints `raceLanguageProfiles` in `modules/races.js` to enforce two invariants:

- No race uses wildcard `"*"` in `categories` or `families`.
- No two races share an identical combination of `categories` and `families`.

If any problems are found, the script prints details and exits with a non-zero status (suitable for CI).

**Inputs**

- `modules/races.js` (parses the `raceLanguageProfiles` object literal directly).

**Outputs**

- Console summary of how many races have profiles, how many use wildcards, and how many duplicate profiles exist.
- Detailed lists of offending races for each invariant.

**Usage**

```bash
node tools/mixer-races/check-race-language-profiles.js
```

Run this after editing `raceLanguageProfiles` to ensure each race has a distinct, explicit subset of the mixer catalog.

---

### `report-per-race-language-coverage.js`

**Purpose**

For each fantasy race, reports how many catalog languages it can reach via its `raceLanguageProfiles` (categories/families) and what percentage of the real (non-macro) catalog that represents.

**Inputs**

- `config/language-mixes.json`
- `modules/races.js` (parses the `raceLanguageProfiles` object literal)

**Outputs**

- Total count of real catalog entries (excluding family macros).
- Per-race language counts and percentages, warning if any race effectively has 100% coverage.

**Usage**

```bash
node tools/mixer-races/report-per-race-language-coverage.js
```

---

### `report-race-language-coverage.js`

**Purpose**

Shows which catalog languages are **eligible** for at least one race profile vs. those that are **never** selected by any race, and whether the unused languages already have mappings.

**Inputs**

- `config/language-mixes.json`
- `config/language-mixer-map.json` (optional; used to flag mapped vs unmapped)
- `modules/races.js`

**Outputs**

- Counts of catalog languages covered vs. uncovered by race profiles.
- Detailed list of uncovered languages (ISO, name, region, family, category, mapped?).

**Usage**

```bash
node tools/mixer-races/report-race-language-coverage.js
```

Run this when designing new races or adjusting profiles so you can target currently-unused languages.

---

### `report-race-language-palettes.js`

**Purpose**

Summarizes how broad each race's language palette is (how many ISOs, how many regions/categories/families it spans).

**Inputs**

- `config/language-mixes.json`
- `modules/races.js`

**Outputs**

- For each race: ISO count plus distinct region, category, and family counts; ranked by ISO count.

**Usage**

```bash
node tools/mixer-races/report-race-language-palettes.js
```

Run this to compare how narrow or broad different races' language palettes are.

---

### `list-race-languages.js`

**Purpose**

Lists the actual mixer catalog languages (ISOs) each race can draw from under `raceLanguageProfiles`, using the same matching logic as `getRaceLanguageIsoWeights`.

**Inputs**

- `config/language-mixes.json`
- `modules/races.js` (parses `raceLanguageProfiles`).

**Outputs**

- For each race:
  - Summary line with total ISO count and distinct region/category/family counts.
  - Detailed table: `iso | name | region | family | category | weight`.

**Usage**

```bash
node tools/mixer-races/list-race-languages.js [--race=Name]
```

Run this when you want to inspect the exact palette for a specific race (or all races) and see which regions/families it actually pulls from.

---

### `report-wikipedia-list-race-coverage.js`

**Purpose**

For each item in a Wikipedia list JSON, reports how many fantasy races can reach that language under `raceLanguageProfiles` (and which races).

This is useful when you’re tuning race palettes and want to ensure that “important” lists of languages are actually reachable by at least one race.

**Inputs / Outputs**

- Reads (without writing):
  - the list JSON
  - `config/language-mixes.json`
  - `modules/races.js` (extracts `raceLanguageProfiles`)
- Console-only TSV output.

**Usage**

```bash
node tools/mixer-races/report-wikipedia-list-race-coverage.js tools/mixer-meta/wikipedia-languages-of-africa-full.json
```

---

## Softmods (mod bundles)

These helpers are for **sandboxing modded content** (races/languages) without changing core files. They load bundles from `mods/<modId>/` using `mods/mods.json` (or an explicit mod list).

### `softmod-race-loader.js`

**Purpose**

Loads and merges `races*.js` bundles from enabled mods under `mods/<modId>/`, producing merged `fantasyRaceBases`, `raceLanguageProfiles`, race sets, and expansionism overrides.

This module is intended to be imported by test/sandbox scripts rather than run directly.

### `softmod-language-loader.js`

**Purpose**

Loads and merges `languages*.js` bundles from enabled mods under `mods/<modId>/`, producing merged language catalog entries, mixer-map entries, and any `postMixedLanguages` additions.

This module is intended to be imported by test/sandbox scripts rather than run directly.

### `test-softmods-races.js`

**Purpose**

Sandbox preview runner that loads a fixed set of mods (currently `arcana-unearthed` and `blue-rose`), merges their race data into core, and prints a summary of new races, set changes, and coverage gaps.

**Usage**

```bash
node tools/softmods/test-softmods-races.js
```

### `test-softmods-languages.js`

**Purpose**

Sandbox preview runner that loads a fixed set of mods (currently `arcana-unearthed` and `blue-rose`), merges their language data into core, and prints a summary of new language ISOs and mapping coverage.

**Usage**

```bash
node tools/softmods/test-softmods-languages.js
```

---

## Experimental Markov helpers

These helpers are **standalone Node scripts** for exploring compound / blended Markov behavior. They do **not** affect the in-browser generator or any bundles; they only print to stdout.

### `experiment-compound-markov.js`

**Purpose**

Single-base experiment for **compound vs plain** Markov generation, driven by base length statistics.

**Inputs**

- `modules/namebases-real.js`
- `modules/namebases-fantasy.js`
- `modules/namebases-creole.js`
- `modules/namebases-all.js` (via `window.defaultNameBases`)

**Outputs**

- Console-only sample names and per-base length summary (min / max / mean / quartiles).

**Usage**

```bash
node tools/mixer-experiments/experiment-compound-markov.js --base=353,354 --count=40 --min=10 --max=30 --mode=auto --seed=1
```

Key options:

- `--base=IDX[,IDX...]` – one or more base indices to test.
- `--count=N` – how many names to generate per base (default `20`).
- `--min=INT`, `--max=INT` – target length band; when this is much larger than the base’s natural length, compound mode will tend to kick in.
- `--mode=plain|compound|auto` – force plain, force compound, or let the helper decide.
- `--seed=INT` – deterministic RNG seed.

### `experiment-compound-markov-v2.js`

**Purpose**

Refined compound helper that uses **better length statistics** and a more conservative auto/compound decision. Intended as the main playground for long-form place names from one or more bases.

**Inputs / behavior**

- Loads `window.defaultNameBases` from the same four namebase modules as above.
- Builds a Markov chain per requested base and computes per-base length stats.
- When `--mode=auto`, only compounds when the requested `--min` is clearly above the base’s natural range.

**Usage**

```bash
node tools/mixer-experiments/experiment-compound-markov-v2.js --base=353,354 --count=40 --min=15 --max=50 --mode=auto --seed=1
```

Options mirror the v1 helper:

- `--base=IDX[,IDX...]`
- `--count=N`
- `--min=INT`, `--max=INT`
- `--mode=plain|compound|auto` (default `auto`)
- `--seed=INT`

### `experiment-compound-markov-blend.js`

**Purpose**

Blended compound helper: lets a **single name** contain segments from **multiple bases** (e.g. Kx’a + Germanic in one string), with boundary smoothing and optional spaces/hyphens for romanized segments.

**Inputs**

- Same namebase modules as the other experiment helpers.

**Outputs**

- Console-only output. Each line is tagged with the base indices that actually contributed to that name (e.g. `[353+354+0]`).

**Usage**

```bash
node tools/mixer-experiments/experiment-compound-markov-blend.js --base=353,354,0,1,6 --count=40 --min=15 --max=50 --seed=1
```

Core options:

- `--iso=ID` (required) – primary mixer ISO to pull bases/segments from.
- `--secondary-iso=ID` – optional ISO to blend alongside the primary (defaults to same as `--iso`).
- `--count=N` – number of blended names to generate (default `40`).
- `--min`, `--max` – override blended name length band.
- `--seed=INT` – deterministic RNG seed.

Use this when you want to preview the next-gen blended generator without touching the in-browser `Names.getMixedByIso` yet; results are written to stdout only.

---

### `experiment-compound-markov-mix.js` and `experiment-compound-markov-mix2.js`

**Purpose / status**

Earlier scratch variants exploring similar ideas (multi-segment names, length-aware compounding, etc.). They are not wired into any pnpm scripts or orchestrators and can be treated as low-level experiments.

If you want a clean starting point today, prefer:

- `experiment-compound-markov-v2.js` for **single-base compound** tuning.
- `experiment-compound-markov-blend.js` for **multi-base blended** tuning.

---

### `markov-full-upgrade-tester.js`

**Purpose**

Standalone playground for a "full-upgrade" Markov generator that can blend segments from multiple bases into a single long-form name, while:

- Respecting requested length bands more often than not.
- Avoiding overly repetitive click+root patterns.
- Using base-level length statistics to choose reasonable segment sizes.

**Inputs**

- `modules/namebases-real.js`
- `modules/namebases-fantasy.js`
- `modules/namebases-creole.js`
- `modules/namebases-all.js`

**Outputs**

- Console-only output:
  - A block of blended sample names, each tagged with the base indices that contributed segments (e.g. `[353+354+0]`).
  - Summary statistics over generated name lengths (min, max, mean, quartiles).

**Usage**

```bash
node tools/mixer-experiments/markov-full-upgrade-tester.js \
  --base=IDX[,IDX...] [--count=N] [--min=INT] [--max=INT] [--segments=INT] [--seed=INT]
```

Use this when experimenting with new long-form, multi-base name behavior before wiring anything into the in-browser generator.

---

## Root-level helper scripts

These helpers live at the project root (not under `tools/`). They are typically one-off utilities.

### `fix-bases.js`

**Purpose**

One-off normalizer for `config/language-mixer-map.json` that rewrites multi-line `bases` arrays to remove duplicates (preserving first occurrence order as encountered in the file).

**Inputs / Outputs**

- Reads and rewrites `config/language-mixer-map.json`.

**Usage**

```bash
node fix-bases.js
```

### `run_python_server.bat` / `run_python_server.sh`

**Purpose**

Convenience wrappers to start a local Python dev server for the project.

### `run_php_server.bat`

**Purpose**

Convenience wrapper to start a local PHP dev server for the project.

---

## Quick-Start Sequences

### Adding or expanding languages for the mixer

1. Edit `config/language-mixes.json` and/or `config/language-mixer-map.json` (and possibly namebases).
2. Run catalog shapers as needed, e.g.:
   - `node tools/mixer-catalog/add-lexifier.js`
   - `node tools/mixer-catalog/fix-missing-families.js`
   - `node tools/mixer-regions/update-romance.js` (or future regional scripts)
3. Run mapping + coverage tools:
   - `node tools/mixer-core/fix-language-mixer-mappings.js`
   - `node tools/mixer-catalog/fill-family-mixes.js`
   - `node tools/mixer-catalog/fill-sino-tibetan-mixes.js`
   - (optional) family/region-specific passes such as:
     - `node tools/mixer-catalog/fill-mongolic-mixes.js`
     - `node tools/mixer-catalog/add-african-languages.js`
     - `node tools/mixer-catalog/add-trans-new-guinea-mixer.js`
   - then choose **one** of:
     - `node tools/mixer-catalog/fill-all-missing-mixes.js` – backfill every mapped ISO with at least basic metadata.
     - `node tools/mixer-catalog/fill-missing-mixes-explicit.js` – only add the curated set of important ISOs using hand-picked metadata.
4. Sanity check:
   - `node tools/mixer-core/check-language-mixer-coverage.js`
   - `node tools/mixer-core/check-language-mixer-failures.js`
   - `node tools/mixer-core/report-language-mixer-name-counts.js --sort=unique`
   - `node tools/mixer-core/run-language-mixer-health.js` (read-only diagnostics)
5. Regenerate bundles:
   - `node tools/mixer-core/generate-language-mixer.js`

Or, for a condensed pass:

```bash
node tools/mixer-core/run-language-mixer-suite.js --name-counts --name-counts-sort=unique
```

For a **read-only diagnostics-only** pass (no writes to config files):

```bash
pnpm run mixer:health
# or:
# node tools/mixer-core/run-language-mixer-health.js
```

### Playbook: Common Mixer & Race Workflows

- **Mixer – full maintenance (mutating)**  
  Use the orchestrator directly or via npm/pnpm:
  - `node tools/mixer-core/run-language-mixer-suite.js --name-counts --name-counts-sort=unique`
  - `pnpm run generate:language-mixer`
  - `pnpm run mixer:full`

- **Mixer – read-only health checks**  
  Quickly inspect families, coverage, failures, and base clusters without writing files:
  - `pnpm run mixer:health`

- **Mixer – targeted checks & cleanup**  
  When focusing on one concern:
  - Coverage drift only: `pnpm run mixer:coverage`
  - Family drift only: `pnpm run diff:families`
  - Name duplicates only: `pnpm run mixer:namedups`
  - Failures only: `pnpm run mixer:failures`
  - Clean orphaned mappings: `pnpm run mixer:clean-map`

- **Races – coverage & palettes**  
  For a full snapshot of race language behavior:
  - `pnpm run mixer:race-suite`
  For individual reports:
  - Coverage summary: `pnpm run mixer:race-coverage`
  - Per-race counts: `pnpm run mixer:race-per-coverage`

### Mixer & Race QA Checklist (before commit / release)

- **If you changed mixer catalog, mapping, or mixer helpers**  
  - Run `pnpm run mixer:health` and address any reported issues (family drift, coverage gaps, mapping failures, suspicious duplicates, over-dense base clusters).
  - Rebuild bundles if mixer data changed: `pnpm run generate:language-mixer`.

- **If you changed races or raceLanguageProfiles**  
  - Run `pnpm run mixer:race-suite` and fix any reported profile or coverage issues before committing.
  - Optionally rerun `pnpm run mixer:race-suite` before tagging a release or world-building milestone that touches races.
