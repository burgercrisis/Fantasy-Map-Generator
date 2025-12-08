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

### `check-language-mixer-failures.js` / `check-markov-mixer-failures.js`

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
# or (legacy alias)
node tools/check-markov-mixer-failures.js
```

Prefer `check-language-mixer-failures.js`; `check-markov-mixer-failures.js` is a near-duplicate kept for backwards compatibility.

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

Run this after you’ve expanded the mixer map and want basic, auto-generated catalog entries for all mapped ISOs.

---

### `fill-missing-mixes-explicit.js`

**Purpose**

Final clean-up pass for a curated list of important ISOs: if they’re in the map but still missing from the catalog, add them with hand-picked metadata.

**Inputs / Outputs**

- Reads `config/language-mixer-map.json`
- Reads and **overwrites** `config/language-mixes.json`

**Behavior**

- Uses a `META` object (same shape as in `fill-all-missing-mixes.js`) to describe a specific set of languages.
- Adds catalog entries only when an ISO is **both** in the map and missing from the catalog.

**Usage**

```bash
node tools/fill-missing-mixes-explicit.js
```

Run this after `fill-family-mixes`/`fill-all-missing-mixes` to ensure a few stubborn, high-priority entries are covered nicely.

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

## Regional / Family Updaters (Stubs & Future Work)

These scripts are reserved for more specialized normalization or expansion passes. Some are currently empty stubs, included here for completeness.

### `update-hmong-mien.js`

- **Current state:** empty stub (no implementation yet).
- **Intended role:** future helper to normalize/expand Hmong–Mien and related entries in `language-mixes.json`.

### `update-isolates.js`

- **Current state:** empty stub.
- **Intended role:** future helper for language isolates (e.g. Basque, etc.), potentially harmonizing categories/regions.

### `update-paleosiberian.js`

- **Current state:** empty stub.
- **Intended role:** future helper for Paleosiberian / Paleo-Siberian groupings in the catalog.

### `update-uralic.js`

- **Current state:** empty stub.
- **Intended role:** future normalization and expansion for Uralic families and branches.

When these gain implementations they should be documented here in the same style as `update-romance.js`.

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
   - `node tools/fill-all-missing-mixes.js`
   - `node tools/fill-missing-mixes-explicit.js`
4. Sanity check:
   - `node tools/check-language-mixer-coverage.js`
   - `node tools/check-language-mixer-failures.js`
   - `node tools/report-language-mixer-name-counts.js --sort=unique`
5. Regenerate bundles:
   - `node tools/generate-language-mixer.js`

Or, for a condensed pass:

```bash
node tools/run-language-mixer-suite.js --name-counts --name-counts-sort=unique
```
