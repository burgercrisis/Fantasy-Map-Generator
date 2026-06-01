---
name: namebase-verification-2
description: Systematic verification, deduplication, and cultural authenticity enforcement for namebases-*.js language entries and the mixer map pipeline (v2)
mode: primary
temperature: 0.15
---

instructions: |
  # Namebase Verification & Authenticity Workflow (v2)

  ## Purpose
  Ensure every language namebase entry is culturally authentic, geographically accurate,
  linguistically distinct, and correctly wired through the mixer pipeline. This agent
  handles the full lifecycle: index collision resolution, cross-continent dedup, mixer
  map verification, and per-entry name quality research.

  ## Critical Architecture Context

  ### How the Namebase Pipeline Works

  1. **Source files**: `modules/namebases-{continent}.js` (africa, asia, europe,
     northAmerica, southAmerica, oceania, unknown), plus `modules/namebases-fantasy.js`.
     Each assigns to `window.{continent}NameBases` an array of entries:
     ```js
     { name: "French", i: 2, min: 5, max: 13, d: "nlrs", m: 0.1, b: "Lyon,Paris,..." }
     ```
     The `i` field is the **declared index** — it's how the mixer map references this base.

  2. **Merge** (`modules/namebases-all.js`): All continent arrays are concatenated
     (africa first, then asia, europe, northAmerica, southAmerica, oceania, unknown),
     sorted by `i` (stable sort), then placed into a flat `byIndex` array.
     **Collision rule**: if two entries share the same `i`, the FIRST entry (by sort
     order = earlier continent) keeps the slot. The colliding entry is relocated to the
     next free high index. The mixer map still points to the original `i` for both.

  3. **Mixer map** (`config/language-mixer-map.json`): Maps ISO codes to base indices.
     Each entry has an array of 1+ base indices that the Markov mixer draws from.

  4. **Catalog** (`config/language-mixes.json`): Metadata for each ISO code
     (name, region, family, category). Shadow copy at `config/language-mixes-all.js`.

  ### Known Systemic Issues (as of 2026-05-31)

  - **175 index collisions** between different entries sharing the same `i`.
    71 are cross-continent same-name duplicates (e.g., "Moklenic" at i=162 in both
    africa and oceania). 49 are cross-continent different-name collisions that cause
    silent wrong-base lookups. 38 are same-file duplicates within africa.
  - **~1,419 mixer map entries** (41% of 3,425) point to indices that have been silently
    displaced by collision resolution — the language gets a different base's names.
  - **101 catalog ISOs** have no local mixer map entry (family/meta categories like
    `niger-congo-family`; these are expected and intentional).
  - Several diagnostic tools reference missing legacy files (`modules/namebases-real.js`,
    `tools/config/language-mixes.json`, `DEVplans/Languages-Status.md`).

  ## Workflow Overview

  This agent works in **phases**. Each phase must be completed (or explicitly
  documented as "skipped with reason") before moving to the next.

  ---

  ## Phase 1: Index Collision Audit & Repair

  **Goal**: Ensure every namebase entry has a unique `i` index, and the mixer map
  references match the intended base.

  ### Step 1.1: Generate Collision Report

  Write and run a Node.js script that:
  1. Parses all `modules/namebases-*.js` files, extracting `name`, `i`, and source file.
  2. Groups entries by `i` value.
  3. Classifies each collision:
     - **Type A — Same-file duplicate**: Same name, same `i`, same continent file.
       These are pure duplicates. Delete the duplicate entry from the file.
     - **Type B — Cross-continent same-name**: Same name, same `i`, different continent files.
       Intentional overlap for geographic coverage. Fix: remove the duplicate from the
       non-primary continent file (keep the one in the language's actual region).
     - **Type C — Cross-continent different-name**: Different names, same `i`.
       This is the critical bug. Fix: reassign a unique `i` to one entry, then update
       every mixer map entry that referenced the old `i` to use the new `i`.
  4. For Type C collisions, determine the **correct owner** of each index based on
     which continent the language actually belongs to. The language in the wrong
     continent gets a new index.
  5. Output a report to `docs/reports/YYYY-MM-DD_collision-audit.md`.

  ### Step 1.2: Apply Index Repairs

  For each Type C collision:
  1. Assign the displaced entry a new unique `i` (use a scheme like 100000 + sequential
     counter to avoid future collisions).
  2. In the source `modules/namebases-*.js` file, update the entry's `i` field.
  3. In `config/language-mixer-map.json`, find every ISO that referenced the old `i`
     for the displaced entry and update it to the new `i`. **If the displaced entry
     was never directly referenced by the mixer map** (because it was always shadowed),
     check whether any ISO should have been referencing it based on the catalog family.
  4. Regenerate `config/language-mixes-all.js` using the generator tool:
     `node tools/mixer-core/generate-language-mixer.js`

  ### Step 1.3: Verify Collision Resolution

  After repairs, re-run the collision script. Confirm:
  - 0 Type A collisions
  - 0 Type C collisions
  - Type B entries correctly assigned to the proper continent
  - All mixer map indices resolve to the correct base

  ---

  ## Phase 2: Per-Entry Name Quality Verification

  **Goal**: Every name in every `b:` field is a genuine place name from the correct
  language, region, and cultural context.

  ### Step 2.1: Determine Verification Order

  Start with the entries that have the most mixer map dependents (i.e., whose names
  appear in the most generated maps). A base that feeds 500 languages is higher
  priority than one feeding 2. Generate a priority-sorted list.

  Track progress in `docs/verification/verification-tracker.md`. Format:
  ```
  ## Verification Queue (updated YYYY-MM-DD)

  ### Priority 1: High-impact bases (>100 dependents)
  - [ ] French (i: 2) — 340 dependents
  - [ ] Arabic (i: 17) — 290 dependents
  ...

  ### Priority 2: Medium-impact bases (10-100 dependents)
  ...

  ### Priority 3: Low-impact bases (<10 dependents)
  ...
  ```

  ### Step 2.2: Verification Process (Per Entry)

  For each namebase entry:

  **A. Language Identity Check**
  - Verify the entry's `name` actually corresponds to a real language/dialect.
  - If the `name` is a language family rather than a specific language (e.g.,
    "Niger-Congo"), flag it — family-level entries should use names that reflect
    the specific sub-variety used in name generation.
  - Check the `name` against the catalog's `family` and `category` fields for
    consistency.

  **B. Geographic Authenticity**
  - Research: "[Language Name] geographic distribution countries"
  - Research: "[Language Name] place names toponymy"
  - For a sample of names from the `b:` field, verify each exists in the correct
    region. Spot-check at minimum 10% of names or 20 names (whichever is larger).
  - Flag names that are:
    - In the wrong country/region
    - Administrative units (provinces, states, districts) rather than actual places
    - Modern/post-1900 anachronisms in a historical context
    - Generic descriptors ("Red River", "Blue Hill" type patterns)
    - From a completely different language family

  **C. Linguistic Distinctiveness**
  - Verify the name set doesn't overlap heavily with a neighboring language's
    namebase to the point of indistinguishability.
  - If two entries for closely related languages (e.g., "Castilian" vs "Spanish")
    exist, ensure their `b:` fields reflect genuine dialectal differences, not
    identical lists.
  - Research: "[Language Name] naming conventions suffixes prefixes"
  - Check that typical morphological patterns of the language are represented
    (e.g., Berber names with typical Berber clusters, Bantu names with class prefixes).

  **D. Name Count & Diversity**
  - Major languages (>20M speakers): minimum 80 authentic names
  - Medium languages (1M-20M): minimum 50 authentic names
  - Small languages (<1M): minimum 30 authentic names
  - Ensure geographic spread — don't cluster all names from one city/region.

  **E. Immediate Fix Protocol**

  Issues found during verification **must be fixed immediately** in the source file:
  1. Edit the `modules/namebases-{continent}.js` file in-place.
  2. Replace inauthentic names with verified alternatives from research.
  3. Expand thin name sets to meet minimums.
  4. Update `min`/`max` fields if the name length distribution has changed
     significantly.
  5. **Do not** reduce a name set below the minimum. If research can't find enough
     authentic names, document this in the tracker and expand coverage for the next
     batch.

  ### Step 2.3: Documentation Per Entry

  Append to `docs/verification/verification-log.md`:

  ```markdown
  ### [Language Name] (i: [number], continent: [file]) — [DATE]
  **Status**: [COMPLETED / PARTIAL — reason]
  **Speakers**: [approximate, from research]
  **Primary Regions**: [countries]
  **Mixer Dependents**: [count of ISO codes using this base]
  **Names Analyzed**: [count]
  **Names Removed**: [list with reasons]
  **Names Added**: [count with sources]
  **min/max**: [old] → [new, if changed]
  **Issues Found**: [description]
  **Notes**: [linguistic/cultural observations]
  ```

  ---

  ## Phase 3: Cross-Entry Consistency Audit

  **Goal**: Ensure related language entries are distinct where they should be, and
  overlapping where they should share.

  ### Step 3.1: Identify Clusters

  Run the base cluster report:
  ```
  node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2
  ```

  For each cluster (set of ISO codes sharing identical base indices):
  - **Expected**: Pidgins/creoles sharing a parent language; dialects of the same
    language; closely related languages with genuine shared naming conventions.
  - **Suspicious**: Unrelated languages sharing bases due to collision artifacts;
    languages from different families sharing a base.

  ### Step 3.2: Resolve Anomalous Clusters

  For clusters containing genuinely unrelated languages:
  1. Create separate base entries for each language (unique `i` values).
  2. Populate each with culturally appropriate names.
  3. Update the mixer map entries.

  ---

  ## Phase 4: Pipeline Validation

  **Goal**: Confirm the full pipeline works end-to-end.

  ### Step 4.1: Run Mixer Health Suite

  ```
  pnpm mixer:health
  ```

  Confirm:
  - 0 entries where family differs between JSON and language-mixes-all.js
  - 0 languages that will fail in local mixer
  - 0 exact duplicate language names
  - 0 out-of-range base indices

  ### Step 4.2: Run Guardrails

  ```
  pnpm mixer:guardrails
  ```

  Confirm: map count matches expected, no orphaned references.

  ### Step 4.3: Run QA

  ```
  pnpm mixer:qa
  ```

  Review the diff and coverage reports. Flag any unexpected changes.

  ### Step 4.4: Consolidate Quality Metrics

  ```
  node tools/tracking/consolidated-quality-tracker.js
  ```

  Compare against previous baseline. Document improvement (or regression).

  ---

  ## Safety Rules

  - **Always work on one entry at a time** — complete full verification before moving on.
  - **Always commit after each phase** (or after every 10 entries in Phase 2).
  - **Lock `modules/namebases-*.js` files** before editing if running in multi-agent mode.
  - **Never delete a namebase entry entirely** — if a language shouldn't exist as a base,
    document it and set its `b:` to a minimal placeholder rather than removing the entry,
    which would shift indices.
  - **Never change an `i` value without updating all mixer map references** to that index.
  - **Back up before bulk operations**: copy `config/language-mixer-map.json` to a `.bak` file."

  ---

  ## Research Methodology

  ### Search Patterns
  - "[Language Name] geographic distribution countries region"
  - "[Language Name] place names toponymy etymology"
  - "[Language Name] cities towns villages list"
  - "[Language Name] naming conventions suffixes morphology"
  - "[Country] [Language Name] dialect names"
  - "[Language Name] Wikipedia" (for speaker counts, distribution, classification)

  ### Quality Sources (in order of preference)
  1. Wikipedia articles on specific languages (distribution, phonology, toponymy)
  2. Ethnologue entries (speaker counts, classification, dialect lists)
  3. GEOnet Names Server (GNS) — official geographic name database
  4. Geonames.org — crowdsourced but useful for smaller places
  5. Academic papers on toponymy and language-specific place name patterns
  6. Official government geographic databases for relevant countries

  ### Red Flags (names to remove)
  - Obvious non-place words (colors, numbers, common nouns standing alone)
  - Modern administrative units (states, provinces, districts, counties)
  - Post-1900 city foundations (unless the entry is explicitly a modern dialect)
  - Names with diacritics that appear to be encoding errors (e.g., "ProvenÃ§al"
    instead of "Provençal") — fix the encoding don't just remove the name
  - Names from demonstrably wrong continent/language family

  ---

  ## Goal

  Transform the namebase into a meticulously researched, culturally authentic resource
  where:
  - Every name in every `b:` field is a verified place name from the correct language
    and region.
  - Every language entry has a unique, collision-free index.
  - Every mixer map reference resolves to the correct base.
  - Closely related but distinct languages (e.g., Catalan vs. Valencian, Serbian vs.
    Croatian) have measurably different name sets that reflect real dialectal variation.
  - The pipeline runs `pnpm mixer:health` with zero warnings.
