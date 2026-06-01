---
name: namebase-verification
description: Systematic verification, deduplication, and cultural authenticity enforcement for namebases-*.js language entries and the mixer map pipeline
mode: primary
temperature: 0.15
---

instructions: |
  # Namebase Verification & Authenticity Workflow

  ## Purpose
  Ensure every language namebase entry is culturally authentic, geographically accurate,
  linguistically distinct, and correctly wired through the mixer pipeline. The agent handles
  the full lifecycle: index collision detection and repair, cross-continent deduplication,
  mixer map verification, and per-entry name quality research.

  ## Architecture Understanding

  ### The Namebase Pipeline

  1. **Source files**: `modules/namebases-{continent}.js` (africa, asia, europe,
     northAmerica, southAmerica, oceania, unknown), plus `modules/namebases-fantasy.js`.
     Each assigns to `window.{continent}NameBases` an array of entries:
     ```js
     { name: "French", i: 2, min: 5, max: 13, d: "nlrs", m: 0.1, b: "Lyon,Paris,..." }
     ```
     The `i` field is the **declared index** — the mixer map references this number to
     look up this specific namebase entry at runtime.

  2. **Merge** (`modules/namebases-all.js`): All continent arrays are concatenated
     (africa → asia → europe → northAmerica → southAmerica → oceania → unknown),
     sorted by `i` (stable sort preserves continent order for ties), then placed into a
     flat `byIndex` array. When two entries share the same `i`, the FIRST entry (by
     sort order) keeps the slot. The colliding entry is silently relocated to the next
     free high index. The mixer map still points to the original `i` — meaning the
     displaced language gets the wrong base's names at runtime without any error.

  3. **Mixer map** (`config/language-mixer-map.json`): Maps ISO codes to arrays of base
     indices. The Markov chain draws names from all listed bases for a given language.

  4. **Catalog** (`config/language-mixes.json`): Metadata per ISO code
     (name, region, family, category). Shadow copy at `config/language-mixes-all.js`.

  ### Why This Matters for Your Work

  **Index integrity is sacred.** Changing an `i` value in a namebase file without updating
  every mixer map reference to that index will silently break those languages — they'll
  get wrong names or no names at all. Always check both directions: if you touch an `i`,
  grep the mixer map for it.

  **First-come-first-served sorting means continent load order matters.** Earlier
  continents in the merge (africa, asya) win index ties over later ones (southAmerica,
  unknown). When investigating wrong-name complaints, check whether a same-named entry
  exists in an earlier continent file that might be shadowing the correct one.

  **The mixer map is not auto-generated.** It's hand-curated. Each ISO's base list was
  chosen to give that language the right "flavor" — a Romance language gets Romance bases,
  a Niger-Congo language gets Niger-Congo bases. When verifying, check that each ISO's
  base assignments make linguistic sense for that language's family and region.

  ---

  ## Workflow Phases

  Work through these phases in order. Each must be completed (or explicitly documented
  as "skipped with reason") before moving to the next.

  ---

  ## Phase 1: Index Collision Audit & Repair

  **Goal**: No two entries share the same `i` index. Every mixer map reference resolves
  to the intended base.

  ### Step 1.1: Generate Collision Report

  Write and run a Node.js script that:
  1. Parses all `modules/namebases-*.js` files, extracting `name`, `i`, and source file.
  2. Groups entries by `i` value.
  3. For each group with >1 entry, classify:
     - **Same-file duplicate**: Same name, same `i`, same continent file → harmless
       waste, delete the duplicate.
     - **Cross-continent same-name**: Same name, same `i`, different continents → the
       language is duplicated for geographic coverage. Keep the entry in the continent
       where the language is actually spoken; remove it from wrong-continent files.
     - **Cross-continent different-name**: Different names, same `i`, different
       continents → **bug**. One language silently overwrites the other at runtime.
  4. Output a report documenting every collision with classification.

  ### Step 1.2: Repair Type C Collisions (different names, same index)

  For each collision where unrelated languages share an index:
  1. Decide which entry "owns" the index based on which continent the language actually
     belongs to.
  2. Assign the displaced entry a new unique `i`. Use a safe range that won't collide
     with existing allocations (e.g., 100000 + sequential counter).
  3. Update the `i` field in the source `modules/namebases-{continent}.js` file.
  4. Search `config/language-mixer-map.json` for the old index. For every ISO that
     referenced it, determine whether it was intentionally referencing the displaced
     entry (based on the catalog's language family/region vs. the base name). Update
     references to the new index where appropriate.
  5. If any catalog ISO codes for the displaced language have no mixer map entry at
     all, create one pointing to the new index.
  6. Regenerate `config/language-mixes-all.js`:
     `node tools/mixer-core/generate-language-mixer.js`

  ### Step 1.3: Verify

  Re-run the collision audit. Confirm zero collisions remain. Run the mixer health suite.

  ---

  ## Phase 2: Per-Entry Name Quality Verification

  **Goal**: Every name in every `b:` field is a genuine place name from the correct
  language, region, and cultural context.

  ### Step 2.1: Prioritize by Impact

  Start with the bases that the most mixer map entries depend on. A base referenced by
  300 languages affects the output for all 300; a base referenced by 2 affects only 2.
  Generate a priority-sorted list. Track progress in `docs/verification/verification-tracker.md`.

  ### Step 2.2: Verify Each Entry

  For each namebase entry:

  **A. Language Identity**
  - Confirm the entry's `name` corresponds to a real language/dialect, not just a
    geographic descriptor or language family name.
  - If the name is ambiguous (e.g., "Arabic" could mean many dialects), check whether
    the `b:` field's names match the intended specific variety.

  **B. Geographic Authenticity**
  - Research the language's actual geographic distribution.
  - Spot-check names from the `b:` field (minimum 10% or 20 names, whichever is larger).
  - Remove/replace names that are in the wrong country/region, are administrative units
    rather than places, are modern anachronisms, or follow wrong-language patterns.

  **C. Linguistic Distinctiveness**
  - For closely related language entries (e.g., "Castilian" vs "Spanish", "Serbian" vs
    "Croatian"), verify their `b:` fields reflect genuine dialectal differences — not
    identical lists.
  - Check that names follow the language's actual morphological patterns (typical
    suffixes, consonant clusters, phonotactic constraints).

  **D. Name Count & Diversity**
  - Major languages (>20M speakers): minimum 80 names
  - Medium languages (1M–20M): minimum 50 names
  - Small languages (<1M): minimum 30 names
  - Spread names across the language's full geographic range, not just one city.

  **E. Fix Immediately**
  Issues found must be fixed in the source file during verification, not just documented.
  Replace inauthentic names with verified authentic ones. Expand thin sets. Update
  `min`/`max` if the name length distribution has changed meaningfully.

  ### Step 2.3: Document

  Append per-entry results to `docs/verification/verification-log.md` with: status,
  speaker estimate, primary regions, mixer dependent count, names removed (with reasons),
  names added (with sources), and linguistic/cultural observations.

  ---

  ## Phase 3: Cross-Entry Consistency Audit

  **Goal**: Related language entries should be distinct where they differ in reality,
  and overlapping where they genuinely share naming conventions.

  ### Step 3.1: Identify Clusters
  ```
  node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2
  ```

  ### Step 3.2: Evaluate Each Cluster
  - Expected: pidgins/creoles sharing a parent; dialects of the same language; closely
    related languages with genuine shared toponymy.
  - Suspicious: unrelated languages sharing a base (possible collision artifact);
    languages from different families sharing a base.

  ### Step 3.3: Resolve Anomalous Clusters
  Give each unrelated language its own base entry with unique `i` and culturally
  appropriate names. Update the mixer map.

  ---

  ## Phase 4: Pipeline Validation

  After all repairs, confirm the full pipeline works:
  ```
  pnpm mixer:health
  pnpm mixer:guardrails
  pnpm mixer:qa
  node tools/tracking/consolidated-quality-tracker.js
  ```

  Document any remaining warnings.

  ---

  ## Safety Rules

  - **Never change an `i` value without updating all mixer map references to it.** This
    is the single most important rule. A mismatched index silently produces wrong names.
  - **Never delete a namebase entry entirely.** Removing an entry shifts all subsequent
    indices in that file. If an entry shouldn't exist as a base, give it a minimal
    placeholder `b:` field instead of deleting it.
  - **Back up before bulk operations.** Copy `config/language-mixer-map.json` and the
    relevant `modules/namebases-*.js` file before making changes.
  - **One entry at a time.** Complete full verification before moving to the next.
  - **Commit after each phase** (or every 10 entries in Phase 2).

  ---

  ## Research Methodology

  ### Search Patterns
  - "[Language Name] geographic distribution countries"
  - "[Language Name] place names toponymy etymology"
  - "[Language Name] cities towns villages"
  - "[Language Name] naming conventions suffixes morphology"
  - "[Language Name] Wikipedia"

  ### Sources (in order of reliability)
  1. Wikipedia (language articles: distribution, phonology, toponymy)
  2. Ethnologue (speaker counts, classification, dialect lists)
  3. GEOnet Names Server — official geographic name database
  4. Geonames.org — useful for smaller places
  5. Academic papers on toponymy and language-specific naming
  6. Official government geographic databases

  ### Red Flags (remove or fix)
  - Non-place words (colors, common nouns standing alone)
  - Administrative units (provinces, states, districts)
  - Post-1900 city foundations in historical namebases
  - Encoding-corrupted diacritics (e.g., "ProvenÃ§al" → fix to "Provençal")
  - Names from the wrong continent or language family

  ---

  ## Goal

  A namebase where every name in every `b:` field is a verified place name from the
  correct language and region, every entry has a unique collision-free index, every mixer
  map reference resolves to the intended base, and closely related but distinct languages
  have measurably different name sets reflecting real dialectal variation.
