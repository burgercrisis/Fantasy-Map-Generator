# Helper Tools Overview

This document describes the helper scripts in the `tools/` directory: what each one does, which files it touches, and when you are likely to run it.

All scripts are intended to be run **from the project root** unless stated otherwise, e.g.

```bash
node tools/<script-name>.js [options]
```

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
node tools/run-language-mixer-suite.js [options]
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
node tools/fix-language-mixer-mappings.js
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
node tools/check-language-mixer-coverage.js
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
node tools/check-language-mixer-failures.js
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
node tools/report-language-mixer-name-counts.js [--include-families] [--sort=FIELD]
```

Common `--sort` fields: `unique`, `raw`, `bases`, `duplicates`, `dupRatio`, `iso`, `name`, `region`, `family`, `category`.

Use this when balancing coverage (e.g. finding languages with very few names or lots of duplicates).

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
node tools/generate-language-mixer.js
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
node tools/diff-language-families.js
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
node tools/add-lexifier.js
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
node tools/fix-missing-families.js
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
node tools/update-romance.js
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
node tools/fill-family-mixes.js
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
node tools/fill-sino-tibetan-mixes.js
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
node tools/fill-all-missing-mixes.js
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
node tools/fill-missing-mixes-explicit.js
```

Run this after `fill-family-mixes.js` (and any other family-specific fillers) **if you choose not to run** `fill-all-missing-mixes.js`, but still want the curated set of important ISOs to be covered with rich metadata.

If you already ran `fill-all-missing-mixes.js`, this script will typically be a no-op because those ISOs will already be present in the catalog.

---

### `add-african-languages.js`

**Purpose**

Adds a curated set of underrepresented African languages to the mixer catalog and, where possible, wires them into the mapping using existing Niger–Congo / Afroasiatic family bases.

**Inputs / Outputs**

- Reads & overwrites `config/language-mixes.json`
- Reads & overwrites `config/language-mixer-map.json`

**Behavior**

- For each language in an internal `AFRICA_ROWS` list:
  - Creates a catalog entry with `region: "Africa"` and inferred `category` / `family`.
  - If possible, copies `bases[]` from existing `niger-congo-family` or `afroasiatic-family` map entries.
- Skips any language that already exists in the catalog.

**Usage**

```bash
node tools/add-african-languages.js
```

Run this when expanding African coverage using the curated list of languages.

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
node tools/add-trans-new-guinea-mixer.js
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
node tools/fill-mongolic-mixes.js
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
node tools/report-namebase-duplicates.js
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
node tools/dedupe-namebase-duplicates.js
```

Use this after reviewing `report-namebase-duplicates.js` to safely clean specific bases.

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

It then prints a short summary of each tools stdout.

**Usage**

```bash
node tools/run-language-mixer-health.js [options]
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

### `check-language-mixer-name-duplicates.js`

**Purpose**

Reports **exact** duplicate language names in `config/language-mixes.json` (byte-for-byte identical `name` strings after trimming).

**Inputs**

- `config/language-mixes.json`

**Outputs**

- Console report listing each duplicated name and the corresponding catalog entries (ISO, region, family, category, tags).

**Usage**

```bash
node tools/check-language-mixer-name-duplicates.js
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
node tools/report-language-mixer-duplicates.js
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
node tools/report-language-mixer-base-clusters.js [--min-size=N] [--family=...] [--category=...] [--region=...]
```

Useful for spotting over-dense mappings (many languages all reusing the same base set) or opportunities to split clusters.

---

### `check-special-families.js`

**Purpose**

Summarizes coverage and metadata quality for several special language groups in the catalog:

- Hmong–Mien / Yao
- Isolates / unclassified
- Paleosiberian / Arctic fringe families
- Uralic and related branches

**Inputs**

- `config/language-mixes.json`

**Outputs**

- Per-group counts and how many entries are missing `region`, `family`, or `category`, plus small samples.
- A combined summary across all groups.

**Usage**

```bash
node tools/check-special-families.js
```

Run this before or after regional updaters when you want to see which special families still need metadata attention.

---

### `clean-language-mixer-map.js`

**Purpose**

Removes mapping entries whose ISO does **not** exist in the catalog, keeping `config/language-mixer-map.json` aligned with `config/language-mixes.json`.

**Inputs / Outputs**

- Reads & overwrites `config/language-mixer-map.json`
- Reads `config/language-mixes.json`

**Behavior**

- Builds the set of catalog ISOs, then filters the mapping to only those.
- Prints how many entries were kept vs. dropped and shows a sample of dropped entries.

**Usage**

```bash
node tools/clean-language-mixer-map.js
```

Run this after larger catalog refactors to prevent orphaned mapping entries, then regenerate bundles with `generate-language-mixer.js`.

---

### `retune-african-mappings.js`

**Purpose**

Refines African language mappings that still point at generic Niger–Congo / Afroasiatic family bases, replacing them with more specific African base indices where possible.

**Inputs / Outputs**

- Reads & overwrites `config/language-mixer-map.json`
- Reads `config/language-mixes.json`

**Behavior**

- Detects map entries whose `bases[]` exactly match certain generic African family base sets.
- Uses token heuristics over the language's name/family/category (Bambara, Hausa, Yoruba, etc.) to choose a more specific base index.
- Updates `bases[]` to that specific index and prints a list of retuned mappings.

**Usage**

```bash
node tools/retune-african-mappings.js
```

Use this after broad African family expansions to clean up overly generic mappings.

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
node tools/update-language-tags.js
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
node tools/update-afroasiatic.js
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
node tools/update-austroasiatic.js
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
node tools/update-austronesian.js
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
node tools/update-dravidian.js
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
node tools/update-hmong-mien.js
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
node tools/update-indo-aryan.js
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
node tools/update-kartvelian.js
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
node tools/update-niger-congo.js
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
node tools/update-turkic.js
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
node tools/update-uralic.js
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
node tools/run-race-language-suite.js [options]
```

Options:

- `--no-profiles`  skip `check-race-language-profiles.js`
- `--no-per`  skip `report-per-race-language-coverage.js`
- `--no-coverage`  skip `report-race-language-coverage.js`
- `--no-palettes`  skip `report-race-language-palettes.js`
- `--full-output`  show full stdout from each tool instead of only the first paragraph

Use this when tuning raceLanguageProfiles or race palettes and you want a single command to run the core race diagnostics.

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
node tools/report-per-race-language-coverage.js
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
node tools/report-race-language-coverage.js
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
node tools/report-race-language-palettes.js
```

Run this to compare how narrow or broad different races' language palettes are.

---

## Quick-Start Sequences

### Adding or expanding languages for the mixer

1. Edit `config/language-mixes.json` and/or `config/language-mixer-map.json` (and possibly namebases).
2. Run catalog shapers as needed, e.g.:
   - `node tools/add-lexifier.js`
   - `node tools/fix-missing-families.js`
   - `node tools/update-romance.js` (or future regional scripts)
3. Run mapping + coverage tools:
   - `node tools/fix-language-mixer-mappings.js`
   - `node tools/fill-family-mixes.js`
   - `node tools/fill-sino-tibetan-mixes.js`
   - (optional) family/region-specific passes such as:
     - `node tools/fill-mongolic-mixes.js`
     - `node tools/add-african-languages.js`
     - `node tools/add-trans-new-guinea-mixer.js`
   - then choose **one** of:
     - `node tools/fill-all-missing-mixes.js` – backfill every mapped ISO with at least basic metadata.
     - `node tools/fill-missing-mixes-explicit.js` – only add the curated set of important ISOs using hand-picked metadata.
4. Sanity check:
   - `node tools/check-language-mixer-coverage.js`
   - `node tools/check-language-mixer-failures.js`
   - `node tools/report-language-mixer-name-counts.js --sort=unique`
   - `node tools/run-language-mixer-health.js` (read-only diagnostics)
5. Regenerate bundles:
   - `node tools/generate-language-mixer.js`

Or, for a condensed pass:

```bash
node tools/run-language-mixer-suite.js --name-counts --name-counts-sort=unique
```

For a **read-only diagnostics-only** pass (no writes to config files):

```bash
pnpm run mixer:health
# or:
# node tools/run-language-mixer-health.js
```

### Playbook: Common Mixer & Race Workflows

- **Mixer – full maintenance (mutating)**  
  Use the orchestrator directly or via npm/pnpm:
  - `node tools/run-language-mixer-suite.js --name-counts --name-counts-sort=unique`
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
