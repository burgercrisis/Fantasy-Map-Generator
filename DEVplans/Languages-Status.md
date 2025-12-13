# Language System Status – Markov & Mixer
_Back to devplan overview: [Changes vs Azgaar overview](Changes-vs-Azgaar-master.md)_

 _Last updated: Worker 2–3 shared-base cleanup passes (Romance, Papuan/Oceania, Afroasiatic, South Asia, West Asia, English-based creoles, SE Asia base-29) + Worker 4 /languages-unique4 batch #3 (Mongolic/Koreanic + Baltic/Slavic micro-clusters) + Worker 5 /languages-unique5 pass (Hausa/Chadic base-132 cluster + Pan-African 112–156 cleanup) + Worker 6 /languages-unique6 batch (SE Asia 29/Bahnaric + South-Central Dravidian + South Slavic micro-cluster) + Worker 7 /languages-unique7 batch (Papuan macros + Romance/Celtic micro-cluster) + Worker 8 /languages-unique8 batch (Bantu Bemba/Bembe/Fwe, South-Central Dravidian 376, North Dravidian/Brahui 388, Papuan [195,360] macros; non-Uralic base clusters fully resolved) + Worker 9 Algic / Basque contact & Eastern Indonesian / Papuan Tip micro-pass + Worker 9 /languages-unique9 continuation batch (South-Central Dravidian 376/387 + Philippine [193,195] trio + Papuan 360/195 macro hubs + small Indo-Aryan/Creole splits) + `/decluster-language-bases` Aslian/Malay [195] micro-pass + Wikipedia §8.2 native-speakers seed subset batch‑1 wiring (all list items fully wired; per-list base-uniqueness clean except Uralic [9] macro cluster and a small Swedish `swe` cluster-of-three) – 2025-12-10_

- ✅ **2025-12-11 hotfix:** `modules/namebases-fantasy.js` array now ends with the missing closing `];`, restoring helper/test loader stability after IDE surfaced "`']' expected`" on line 364.
- ✅ **2025-12-11 helper doc sweep:** `tools/HELPER-TOOLS.md` now documents the previously-undocumented mixer helpers (`dedupe-language-mixer-map.js`, `report-language-history-totals.js`, `report-lost-language-mappings.js`, `restore-lost-language-mappings.js`, the `select-language-mixer-batch` family, and the `experiment-compound-markov-*` playgrounds) so future contributors can find and run them without reverse-engineering.

- ✅ **2025-12-12 wiring pass:** Wired the remaining Tai–Kadai / Mongolic / Japonic / Austronesian items surfaced by `tools/mixer-core/check-language-mixer-failures.js`, including clearing invalid Austronesian base references (e.g. old `346/348/405` values) by remapping onto valid SEA/Pacific bases (notably `193/194/195/196/197/198/303/304/367/369`). Follow-up Koreanic wiring mapped the remaining Korean dialect/historical entries to base **10** (and `chinese-korean` to **[10,11]**). Post-pass stabilization restored 153 accidentally-dropped map rows and replaced remaining invalid legacy bases; current checker snapshot: **0 failures** (0 missing mappings + 0 all-bases-invalid).
- ✅ **2025-12-12 catalog hygiene:** Normalized-name collision clusters are now clean in `tools/mixer-diagnostics/report-language-mixer-duplicates.js` (no duplicate ISOs; no overlapping normalized-name clusters).

- ✅ **2025-12-12 health+coverage verification:** After final cleanup (including removing the last stray invalid base reference), `check-language-mixer-failures` reports **0 failures** and `check-language-mixer-coverage` reports **0 catalog ISOs missing from map**.

- ✅ **2025-12-12 tooling (doctor + baselines):** Added a new read-only `pnpm mixer:doctor` orchestrator that writes predictable reports to `tools/mixer-diagnostics/` and maintains a rolling set of **5** ISO-set baseline snapshots (`tools/mixer-diagnostics/baselines/`). Loss checks compare against **any** of the last 5 baselines (warn by default; `--strict` fails).

- ✅ **2025-12-12 language integration table (decision recorded):** `tools/mixer-core/generate-language-integration-table.js` writes `tools/mixer-diagnostics/language-integration-table.(tsv|json)` and `tools/mixer-diagnostics/wiki-only-language-items.(tsv|json)`. Per decision, the main table’s `wiki_lists*` columns remain **devplan-driven** (registry in `DEVplans/Languages-Status.md`), while the wiki-only output scans **all** `tools/mixer-meta/wikipedia*.json` files to track the backlog.

- ✅ **2025-12-12 Wikipedia registry refresh (one command):** `pnpm run mixer:wiki-refresh` auto-registers any missing `tools/mixer-meta/wikipedia*.json` into §8.99 and then refreshes all per-list snapshot blocks across the registry, including a persisted **Base-set uniqueness details** subsection per list.

- ✅ **2025-12-12 Wikipedia base-uniqueness format (decision recorded):** Per-list **Base-set uniqueness details** in the devplan remain **compact** (counts + histogram + clustered ISO summary), not a full cluster-by-cluster breakdown.

- ✅ **2025-12-12 workflow guardrail (git safety):** Added explicit rules in `.windsurf/rules/languages-wiki.md` to forbid destructive git operations without explicit user approval and to prefer commit-splitting (interactive staging / stage-hunks) over reverting when the working tree is large.

- ✅ **2025-12-12 Wikipedia Uralic full-list pass (historical snapshot):** Claimed `tools/mixer-meta/wikipedia-uralic-languages-full.json` in `tools/mixer-diagnostics/_wiki_multiagent_claims.json` and ran the per-list reports. Earlier snapshot (prior to the coverage pass below): `fully wired=183` (considered), `unmatched=74`, `Nonunique Bases=257` (with `unique bases=106`, `clustered bases=77). Archived evidence: `tools/mixer-diagnostics/tmp/.tmp-uralic-coverage-utf8.txt`.

- ✅ **2025-12-12 Wikipedia Uralic full-list coverage pass (verified):** `tools/mixer-meta/wikipedia-uralic-languages-full.json` now resolves to `unmatched=0` (all non-skip list items are mapped to real catalog ISOs), and the §8.31b snapshot is refreshed via `update-wikipedia-list-coverage-in-devplan` (no hand-edited counts). In parallel, a first uniqueness burn-down batch split the Northern Sami `[274]` cluster, declustered the Komi-Permyak `[426]` lect cluster into unique `[426,...]` mixes, reduced the Hungarian `[15]` mega-cluster to a small remainder, and peeled a first mini-batch of Finnish dialect lects off the massive Finnic `[9]` hub by assigning unique Finnic-anchored mixes.

- ✅ **2025-12-12 stability verification:** `run-language-mixer-health` remains green (**3162** catalog entries, **3162** map rows, **0** missing mappings, **0** Markov failures, **0** duplicate names); `check-language-mixer-map-duplicate-isos` reports **0** duplicate ISO rows.

- ✅ **2025-12-12 Uralic uniqueness (verified):** Uralic `bases[]` declustering pass resolved **all size≥3 identical base-set clusters** except the intentional Finnic hub `bases=[9]` (now **24** members); `run-language-mixer-suite` is green (**0** failures) and the §8.31b snapshot for `tools/mixer-meta/wikipedia-uralic-languages-full.json` was refreshed via `update-wikipedia-list-coverage-in-devplan`.

- ✅ **2025-12-12 mixer comparison harness:** Added `tools/mixer-core/compare-mixer-nextgen-to-app.js` to compare **app legacyChain**, **app current**, and a **helper-only nextgen** mixer implementation side-by-side for the same inputs/seed. Initial smoke test with `--base="353" --count=10 --seed=42 --min=15 --max=50` showed app current and nextgen broadly aligned on length bands, while legacyChain produced much shorter names (expected given legacy behavior).
  - ✅ **ISO verification (seed=1, count=40):**
    - ✅ `fra`: app current ↔ nextgen exact overlap **39/40** (legacy ↔ current **0/40**)
    - ✅ `hin`: app current ↔ nextgen exact overlap **40/40** (legacy ↔ current **8/40**)
    - ✅ `vie`: app current ↔ nextgen exact overlap **40/40** (legacy ↔ current **1/40**)
    - ✅ `tur`: app current ↔ nextgen exact overlap **40/40** (legacy ↔ current **9/40**)
    - ✅ `rus`: app current ↔ nextgen exact overlap **40/40** (legacy ↔ current **2/40**)
    - ✅ `pol`: app current ↔ nextgen exact overlap **40/40** (legacy ↔ current **11/40**)
    - ✅ `ces`: app current ↔ nextgen exact overlap **40/40** (legacy ↔ current **0/40**)
    - ✅ `ukr`: app current ↔ nextgen exact overlap **40/40** (legacy ↔ current **21/40**)
    - ✅ `ara`: app current ↔ nextgen exact overlap **29/40** (legacy ↔ current **0/40**)
    - ✅ `amh`: app current ↔ nextgen exact overlap **40/40** (legacy ↔ current **6/40**)
    - ✅ `akoye`: app current ↔ nextgen exact overlap **12/40** (legacy ↔ current **0/40**)
    - ✅ `asmat`: app current ↔ nextgen exact overlap **7/40** (legacy ↔ current **0/40**)
    - ✅ `bunak`: app current ↔ nextgen exact overlap **38/40** (legacy ↔ current **0/40**)
  - ✅ **2025-12-12 nextgenSyll pair coverage debugging:** Missing co-occur pairs (e.g. `[4,5]` in `--base=1-10 --count=300 --seed=1 --v=4`) were caused by the **segment→base attribution heuristic** collapsing segments onto one base, not by base selection. Added a “chosen bases, pre-attribution” pair-coverage section, which reports **45/45 (100%)** for the same run.
  - ✅ **2025-12-12 provenance syllable mixer (tester, v=5):** Added `--v=5` (`nextgenSyllProv`) to the comparator. This version generates syllable segments from per-base chains while recording base provenance (ground-truth `baseSeq`, no post-hoc attribution). Verified with `--base=1-10 --count=300 --seed=1 --v=5`: **pair coverage 45/45 (100%)** and **chosenBases coverage 45/45 (100%)**.
  - ✅ **2025-12-12 linguistic syllable mixer (tester, v=6):** Added `--v=6` (`nextgenSyllLing`) to the comparator. This version keeps provenance-based `baseSeq` but uses linguistic heuristics (span switching, `smoothJoin` + onset sets, click-pattern avoidance, and base-switch penalties). Verified with `--base=1-10 --count=300 --seed=1 --v=6`: **pair coverage 45/45 (100%)** and **chosenBases coverage 45/45 (100%)**. For large base universes (e.g. `--base=1-100` with small `--count`), pair coverage is mainly limited by which base-pairs are sampled/selected (chosenBases), not by attribution.
  - ✅ **Comparator UX:** Sample diff now prints before the stats/overlap report, and sample lines include per-name base tags (segment order) for **app current** and **nextgen**.
  - ✅ **Comparator UX (audit view):** Sample diff now prints per-sample `segs:` + `name:` blocks so you can audit exactly which segments were stitched in **app current** and **nextgen** runs.
  - ✅ **Comparator enforcement (Option 2):** Comparator supports `--min-unique-bases=N` and defaults to requiring **2** unique bases per generated name when the selected ISO maps to multiple bases (enforced for **app current** and **nextgen**; legacy remains a single mixed-chain).

- ✅ **2025-12-12 Cape Verde Creoles (195 decluster, verified):** burned down the shared `[13,195,308]` cluster by dedicating bases `[523–524]`:
  - ✅ `barlavento-creoles`→`[523]` (Barlavento Creoles)
  - ✅ `fogo-creole`→`[524]` (Fogo Creole)

- ✅ **2025-12-12 Nenets invalid-base repair (verified):** `nenets` no longer points at missing base `323`; added dedicated Nenets base `[525]` and remapped `nenets`→`[525]`. `check-language-mixer-failures` and `check-language-mixer-coverage` are green.

- ✅ **2025-12-12 Austroasiatic (195 decluster, verified):** burned down the shared `[29,193,195,251]` cluster by dedicating bases `[526–527]`:
  - ✅ `juk-bahnaric`→`[526]` (Juk)
  - ✅ `wbm`→`[527]` (Wa)

- ✅ **2025-12-12 namebase collision refactor (verified):** eliminated the historical `i` collisions at **314/315/316/399** by moving the colliding fantasy bases to new indices (**Zhuang=530**, **Papuan=531**, **Shan=532**, **Kam-Sui=533**) and adding a dedicated **Tiwi=534** base. A helper (`tools/mixer-core/retarget-collided-namebase-indices.js`) retargeted affected `language-mixer-map.json` rows, and `run-language-mixer-health` remains green (**0 failures**, **0 missing mappings**).

- ✅ **2025-12-12 Tai-Kadai uniqueness batches (verified):**
  - Declustering removed the `bases=[530]` mega-cluster (33 members) by assigning unique Tai-Kadai-plausible mixes.
  - Declustering removed the `bases=[251,252]` Thai/Lao cluster (21 members) by assigning unique Tai-Kadai-plausible mixes.
  - Follow-up declustering removed the `bases=[317]` Kra cluster (kept `kra` as `[317]`, moved the other lects onto unique `[317,...]` mixes).
  - Follow-up declustering removed the `bases=[318]` Hlai cluster (kept `hlai` as `[318]`, moved the other lects onto unique `[318,...]` mixes).
  - ✅ Final Tai-Kadai cleanup reduced **all** Tai-Kadai identical base-set clusters of size **≥ 3** to **0** (`report-language-mixer-base-clusters --category=tai-kadai --min-size=3`), and `run-language-mixer-health` remains green.
  - ✅ Both batches are repeatable via helpers (`tools/mixer-core/decluster-tai-kadai-530.js`, `tools/mixer-core/decluster-tai-kadai-251-252.js`) and the suite remains green.

- ✅ **2025-12-12 Papuan hub decluster (verified):** burned down the shared `bases=[360]` mega-cluster in `config/language-mixer-map.json` to **0** remaining exact `[360]` singletons via repeatable helpers (`tools/mixer-core/decluster-papuan-360-batch1.js` … `batch4.js`). `run-language-mixer-health` remains green.

- ✅ **2025-12-12 mixer-map ISO dedupe (verified):** removed accidental duplicate ISO rows (e.g. `hokkien`, `min`, `proto-min`, `teochew-min`) by running `tools/mixer-core/dedupe-language-mixer-map-isos.js` (keeps the first row per ISO). `check-language-mixer-map-duplicate-isos` is green.

- ✅ **2025-12-12 mixer-map hygiene (verified):** removed a duplicate `mogholi` row in `config/language-mixer-map.json` (the incorrect duplicate included base `11`). `check-language-mixer-map-duplicate-isos` is green and `run-language-mixer-health` is green.

- ✅ **2025-12-12 policy update (uniqueness enforcement):** "Allowed clusters" are now permitted **only** when the sharing is linguistically defensible (e.g. true alias entries for the *same language* or items excluded from coverage like `skip: true`). Broad macro hubs (e.g. Hausa-as-Chadic, generic Uralic base-9, Mandarin-as-all-Sinitic) are no longer treated as acceptable end-state behavior; any identical shared `bases[]` arrays among non-skipped languages are treated as **uniqueness debt** to be burned down.

- ✅ **2025-12-12 Romance decluster micro-passes:** reduced the largest Romance shared-base clusters (readable via `report-language-mixer-base-clusters --category=romance`).
  - ✅ Tooling: `report-language-mixer-base-clusters.js` now prints `base_names=[...]` for each `[bases]` set.
  - Remaps:
    - `canz-s` (Canzés) moved off `base_names=[French,Corsican]` to `[3,279,301]`.
    - `franco-proven-al` (Franco-Provençal) moved off `base_names=[French,Corsican]` to `[2,232,286]`.
    - `palra` (Palra) moved off `base_names=[French,Corsican]` to `[4,232,286]`.
    - `bolognese` moved off `[3,301]` to `[3,8,301]`.
    - `milanese` moved off `[3,301]` to `[3,234,301]`.
    - `old-lombard` moved off `[3,301]` to `[3,8,234,301]`.
    - `ita` moved off `[3,301]` to canonical `[3]`.
    - `brianz-`, `bustocco-legnanese`, and `comasco-lecchese` moved off `[3,301]` to `[3,234,301]`.
    - `ferrarese` moved off `[3,301]` to `[3,8,233,301]`.
    - `forlivese` moved off `[3,301]` to `[3,8,233,234]`.
    - `old-romagnol` moved off `[3,301]` to `[3,8,234,301]`.
    - `parmigiano` moved off `[3,301]` to `[3,234,279,301]`.
    - `sammarinese` moved off `[3,301]` to `[3,8,279,301]`.
  - Post-pass Romance cluster snapshot:
    - `--min-size=14`: **0** clusters remain.
    - `--min-size=8`: **1** cluster remains (8 members total), `[8,233]` (8).

- ✅ **2025-12-12 Romance uniqueness batches (verified):**
  - Declustering removed the `bases=[287]` Aragonese cluster (kept `central-aragonese` as `[287]`, moved the other lects onto unique `[287,...]` mixes).
  - Declustering removed the `bases=[2,279]` French+Corsican cluster (kept `cauchois` as `[2,279]`, moved the other lects onto unique `[2,279,...]` mixes).
  - Declustering removed the Romance dialect `bases=[2]` French cluster (kept `standard-french` as `[2]`, moved the other Romance dialects onto unique `[2,...]` mixes). Note: `[2]` remains used by French-based creoles/pidgins outside the Romance filter.
  - Declustering removed the Romance `bases=[3]` Italian hub (kept `ita` as `[3]`, moved other lects onto unique `[3,...]` mixes).
  - Fixed a mixer regression where catalog ISO `dre` (Dolpo) was missing from `language-mixer-map.json` by wiring it to an existing Tibetic base-set.

This document captures where the language system work currently stands so this project can be picked up later without re–reverse–engineering everything. It assumes the core design goal that **every language entry** ultimately has its own linguistically and regionally appropriate **dedicated base** in the namebase/mixer layer (a single-base `[X]` array for normal, non-hybrid languages) or, where the language is genuinely hybrid / creole / mixed, a **unique tuned mix**. Any present-day sharing of identical bases or `[bases]` arrays is treated as **temporary per-language uniqueness debt**, not an acceptable end state, and paying that debt down will routinely involve **introducing new bases and splitting over-broad hubs** rather than leaving long-term shared clusters in place. [Races & Languages – System Rules §1.3](Races-Languages-Rules.md#13-language-base-uniqueness-intent) describes how that goal is consumed on the race side.

Throughout this devplan, `config/language-mixes.json` and `config/language-mixer-map.json` are treated as **append-only language registries**. Once a language ISO exists in either file it should not be deleted; cleanup and uniqueness passes only adjust `bases[]`, metadata, or add new entries. If an earlier revision contained a language that is now missing, that is treated as data loss to be repaired by restoring the language from history rather than as an intentional deletion.

### Section index

- [1. Infrastructure status](#1-infrastructure-status)
- [2. Families / bases already reviewed](#2-families--bases-already-reviewed)
- [3. Not-unique-enough clusters (current suspects)](#3-not-unique-enough-clusters-current-suspects)
- [4. Work not yet done / future passes](#4-work-not-yet-done--future-passes)
- [5. Planned next steps when resuming](#5-planned-next-steps-when-resuming)
- [6. Quick checklist for whoever picks this up](#6-quick-checklist-for-whoever-picks-this-up)
- [7. Planned tooling extensions (Markov, similarity, and UX helpers)](#7-planned-tooling-extensions-markov-similarity-and-ux-helpers)
 - [8. Wikipedia language list coverage registry](#8-wikipedia-language-list-coverage-registry)

## 1. Infrastructure status

- **Blended Markov generator**
  - Implemented in `modules/names-mixer.js`.
  - Supports:
    - Per-base Markov chains.
    - Segment-wise blending of multiple bases with weights.
    - Smoothing joins between segments (spaces / hyphens / elision).
    - Basic safeguards against over-repetition (esp. click-heavy languages).
  - ✅ **2025-12-11 live app verification:** In the Namebase Editor → Language Mixer UI, local generation succeeded for `French` (`fra`), `Vietnamese` (`vie`), and `Russian` (`rus`) when served via `run_python_server.bat` on `http://localhost:3000`.
  - Legacy "single mixed chain" path kept behind `options.legacyChain`.
  - Planned next iteration (approved): improve *mixed* generation quality by combining adaptive multi-try scoring (`K=2` with early-exit; hard time budget 1000ms; mixed-only) with configurable join/phonotactic rules keyed primarily off base-level feature flags (with ISO overrides only when necessary).

- **Core `Names` API**
  - `modules/names-generator.js` is still the authoritative single-base Markov engine.
  - APIs:
    - `Names.getBase(base, min, max, dupl)` – uses base `min/max/d` by default.
    - `Names.getCulture(culture, min, max, dupl)` – wraps `getBase` via `pack.cultures[culture].base`.
    - `Names.getCultureShort(culture)` – shortens `min/max` for label-ish uses.
    - `Names.getState(name, culture, base)` / `Names.getMapName(force)` – apply culture-specific suffix logic on top of base names.

- **Tooling (under `tools/`)**
  - `check-namebase-lengths.js`
    - Uses a Node VM to load `namebases-*` and `names-generator`.
    - ✅ Reports **seed** and **generated** length stats per base.
    - ✅ Currently wired so that `Names.getBase` sees `nameBases = defaultNameBases`.
  - `report-namebase-duplicates.js`
    - ✅ 2025-12-11 follow-up: refreshed Tok Pisin (399), Melanesian Vanuatu (368), East Chadic (386), Koya-Konda-Manda-Pengo (376), Ukrainian (373), Samoyedic Arctic (438), and the straggler fantasy bases (Burmese 390, Shan 399, Aleut 413, Athabaskan 415, Erzya 429) so the report now prints “No duplicate names found in any base.” Re-run via `pnpm exec node tools/mixer-namebases/report-namebase-duplicates.js` to verify future edits.
  - `profile-language-mixes.js`
    - Profiles entries in `config/language-mixes.json` and `language-mixer-map.json`.
    - For each ISO:
      - region, family, category, tags,
      - mapped bases,
      - seed length stats and script / character profile (ASCII vs extended, etc.).
  - `check-language-mixer-map-inconsistencies.js`
    - Sanity-sweeps `language-mixes.json` + `language-mixer-map.json`.
    - Surfaces:
      - ISOs with **mix entry but no base mapping**.
      - ISOs with **base mapping but no mix entry**.
      - Bases used across **multiple families/regions** (potential style-collapsing hubs).
  - `generate-language-pair-samples.js`
    - Walks every possible catalog ISO pair (optionally capped with `--max-pairs`) and locally generates Markov samples for each combination using the same blender as `generate-language-samples`.
    - Prints any pairs where all generated samples drew segments from only one ISO, plus a total count so we can triage unmixed mappings and base clusters that still behave monolingually.
    - ✅ Supports deterministic seeds, per-sample length overrides, and verbosity flags for investigating stubborn clusters. (2025-12-11 tweaks: summary block now prints at the end of the run so failure details stream first, and the CLI now also lists every ISO that never produced even a single mixed-segment name during the run so we can escalate those languages for rewiring.)
  - `compare-mixer-nextgen-to-app.js`
    - Tri-path mixer comparison harness: compares **app legacy** (`legacyChain`), **app current**, and a **helper-only nextgen** mixer implementation (not wired into the app) for the same ISO or base list and seed.
    - Use this to validate experimental mixing heuristics against both shipped mixer behaviors without pushing changes into the app runtime.
    - Example: `pnpm exec node tools/mixer-core/compare-mixer-nextgen-to-app.js --iso=amkoe --count=40 --seed=1` (on Windows shells, quote comma-separated `--base` values, e.g. `--base="353,354"`).
  - `report-language-mixer-duplicates.js`
    - Finds potentially non-unique languages in the catalog by:
      - Detecting duplicate ISO codes.
      - Grouping entries that normalize to the same language name (after stripping generic suffixes and parentheses), while skipping groups that are clearly pure family macros.
  - `check-language-mixer-map-duplicate-isos.js`
    - Read-only scan of `config/language-mixer-map.json` for **duplicate ISO rows**.
    - Useful after manual wiring batches to ensure the mixer-map is deterministic (`iso -> bases`).
  - `dedupe-language-mixer-map-duplicate-isos.js`
    - Removes **exact duplicate** mixer-map rows (same `iso` + same `bases`) while refusing to touch conflicting duplicates.
    - Has `--apply` mode with a **no-drop-ISO** guard (will refuse to write if the ISO set changes).
  - **2025-12-11 catalog sweep:** Ran `node tools/mixer-diagnostics/check-language-mixer-name-duplicates.js` and retagged macro/list-alias catalog entries (e.g., Cebuano, Ilocano, Sundanese, Swedish, Hmong, Malagasy, Madurese, Khasi, Meitei) with explicit `(native-speakers subset)` / `(macro entry)` suffixes. The catalog now reports **0 exact duplicate names**, so coverage helpers no longer need to disambiguate those headliner duplicates.
  - `check-language-mixer-map-inconsistencies.js`
    - Sanity-sweeps `language-mixes.json` + `language-mixer-map.json`.
    - Surfaces:
      - ISOs with **mix entry but no base mapping**.
      - ISOs with **base mapping but no mix entry**.
      - Bases used across **multiple families/regions** (potential style-collapsing hubs).
  - **Language mixer safety invariants (append-only registries)**
    - As of 2025-12-11, all Node helpers that write `config/language-mixer-map.json` or
      `config/language-mixes.json` are hardened with "no-drop-ISO" guards:
      each script snapshots the original ISO set on load and **refuses to write** if any
      original ISO would be missing in the output.
    - Combined with the project rule that these JSONs are append-only registries, this
      makes silent language deletion via helper scripts mechanically impossible; future
  - ✅ **2025‑12‑11 tooling fix:** `names-mixer.js` + `generate-language-samples.js` now soften long click-segment runs by stripping repeated leading click markers and inserting whispered or `h` buffer consonants; verified with `node tools/mixer-core/generate-language-samples.js --base=353,354 --count=20 --seed=42 --min=8`.
    - ✅ **2025‑12‑11 click expressive pass:** Extended the click smoother with random prefixes, bridge vowels, suffix syllables, and accent swaps (mirrored in CLI) so `[353,354]` blends show richer intra-name variation (e.g., `kóá-samáa`, `ao’káéhóa`).
    - ✅ **2025-12-11 mixer sampler guard:** `generate-language-pair-samples.js` now forces a second ISO segment into a candidate blend when multiple ISOs are available but the first pass pulled only one, eliminating “monolingual-only” false positives in pair scans (verified: 0 monolingual failures on 60-, 300-, and 500-pair runs across seeds 123/456).
  - ✅ **2025-12-11 CLI upgrade:** `generate-language-samples.js` now mirrors `Names.getMixedBaseMany` by stitching segments from all requested bases inside each generated name (instead of alternating base-by-base). New options: blended runs require at least two segments, accept `--weights`, `--max-segments`, and honor `--min/--max` when composing single-name mixes so we can visibly verify intra-name mixing for any `[base]` set.
  - **2025‑12‑11 micro-pass (small-cluster burn-down, batch 3):** eliminated a large set of 2–4 member collisions by moving list-aliases, regional lects, and contact varieties onto unique mixes (including Catalan/Aragonese overlaps, Bantu micro-pairs, Romani micro-variants, and several pidgins). After this pass, `report-wikipedia-list-base-uniqueness.js` reports:
  - Native-speakers helper: **unique bases 156 / clustered bases 21**
  - Europe helper: **unique bases 112 / clustered bases 26**
  - ✅ **2025-12-12 verification:** `check-language-mixer-map-duplicate-isos.js` reports **Duplicate ISO codes: 0** (**3161** rows / **3161** unique ISOs)
 set.
  - **Post-restore + fixer diagnostics snapshot (2025-12-11)**
    - `merge-language-mixer-from-head` and `restore-lost-language-mappings` now report
      zero additions needed from HEAD / snapshot: all languages present in git HEAD and
      in `_lost-languages-from-declustering.json` are present in the current
      `language-mixer-map.json`.
    - A one-off guarded run of `fix-language-mixer-mappings.js` on the restored map
      increased the number of mapped ISOs from 1,538 to 2,303 while preserving the
      original ISO set (`missing_count=0`, `added_count=765` when comparing before/after
      snapshots). This confirms the fixer no longer causes ISO loss and only adds or
      adjusts mappings.
    - `report-language-mixer-iso-diff-vs-head` confirms there are no ISOs that exist in
      HEAD but are missing in the current map; the current map is a strict superset of
      HEAD by construction.
    - **2025-12-11 coverage repair:** `burushaski` was present in `language-mixer-map.json` but absent from the catalog; added a dedicated catalog entry (Language isolate, Asia) and reran `generate-language-mixer.js` so both bundles stay in sync. Coverage check now reports zero ISOs in the map without catalog entries.
    - **2025-12-11 mixer-map gap:** `standard-french` existed in the catalog but lacked a mapping entry; wired it to the French base `[2]`, regenerated the bundles, and reran the health suite to drop the missing-mapping count by one (475 → 474).
    - **2025-12-11 Ryukyuan macro fix:** Added a catch-all `ryukyuan` mapping keyed to `[10,11,12]` (Korean, Japanese, and Mandarin base influences) to cover the catalog macro entry. Regenerated bundles and reran health diagnostics; missing-mapping count now 341 (down from 452). New follow-up task: scrub the 43 “mapped but all bases invalid” languages surfaced by the larger restored map set.
    - ✅ **2025-12-11 Ryukyuan split normalization:** Normalized `macro-yaeyama`, `miyakoan`, and `yaeyama` duplicate mapping entries in `language-mixer-map.json` so all now consistently use `[10,11,12]` and removed an accidental stray base `30` (Cantonese) from those mappings. Regenerated the bundles and reran health diagnostics.
    - **2025-12-11 catalog duplicate-name fix:** Resolved an exact duplicate catalog name (`Khorchin Mongol`) by renaming the `khorchin-mongol` catalog entry to `Khorchin Mongol (alias)` (kept append-only registry invariant), then regenerated bundles and confirmed `check-language-mixer-name-duplicates` reports 0 duplicates.
    - **2025-12-11 Semitic macro wiring:** Wired missing catalog macros `central-semitic` → `[18,42]` and `west-semitic` → `[18,23,42]` in `language-mixer-map.json`, regenerated bundles, and reran the health suite. Post-pass summary: missing mapping entries now 78; “all bases invalid” now 41; duplicate catalog names remain 0.
    - **2025-12-11 Mongolic macro wiring:** Wired missing catalog entry `serbi-mongolic-family` → `[381]` (Southern Mongolic base), regenerated bundles, and reran health diagnostics. Post-pass summary: missing mapping entries now 76; “all bases invalid” now 40; duplicate catalog names remain 0.
    - **2025-12-11 deeper diagnostics pass:**
      - `check-language-mixer-coverage`: map has 2,932 unique ISOs; catalog has 3,025; **catalog missing from map = 93**; **map missing from catalog = 0**.
      - `check-language-mixer-failures`: **116 total failures** (76 missing mapping + 40 “all bases invalid”; 0 empty-base entries).
      - ✅ **2025-12-12 verification:** `check-language-mixer-map-duplicate-isos` reports **Duplicate ISO codes: 0**.
  - `softmods/softmod-language-loader.js` + `softmods/test-softmods-languages.js`
    - Node-only softmod prototype for merging extra language bundles from
      `mods/**/languages*.js` on top of an in-memory copy of the canonical
      catalog and mixer-map.
    - Currently exercised with a **Blue Rose** dummy bundle
      (`mods/blue-rose/languages-blue-rose.js`) and an **Arcana Unearthed**
      bundle (`mods/arcana-unearthed/languages-au.js`).
    - These softmod bundles are kept out of `language-mixes.json` /
      `language-mixer-map.json` and do **not** affect coverage percentages or
      base-uniqueness metrics; they are purely local experiments.

 These tools are the main entry points for future tuning passes.

 For a full index of helper scripts and workflows, see [tools/HELPER-TOOLS.md](../tools/HELPER-TOOLS.md); that doc also calls out the core runners for these passes (`profile-language-mixes.js`, `check-language-mixer-map-inconsistencies.js`, `check-namebase-lengths.js`, and the `run-language-mixer-suite.js` orchestrator).
 Dedicated CASCADE workflows exist for parallel uniqueness passes: `/language-uniqueness` (Worker 1), `/languages-unique2`–`/languages-unique10` (Workers 2–10), and `/decluster-language-bases` for targeted shared-base cluster cleanup when a specific hub needs to be broken up.

---

## 2. Families / bases already reviewed

This section summarizes families where we have done at least a **first pass**: checking seed lengths vs config, reviewing duplication rules, and eyeballing overall behavior.

### 2.1 Romance cluster (core Azgaar + extensions)

Representative bases:
- **Italian** (`i:3`), **Castilian/Spanish** (`i:4`), **Portuguese** (`i:13`), **French** (`i:2`), **Roman** (`i:8`), **Occitan** (`i:232`), **Sardinian** (`i:233`), **Neapolitan** (`i:306`), etc.

Status:
- Length ranges (`min/max`) broadly match seed distributions; most are already quite tight around their medians.
- Duplication patterns reflect Romance flavors reasonably (e.g. French allowing `nlrs` doubles, Italian `cltr`).
- Earlier, many Romance dialects and offshoots in `language-mixer-map` all mapped back onto the same few bases (Spanish, Portuguese, French, Italian, Occitan, Sardinian, Neapolitan). A dedicated multi-batch **Worker‑3 uniqueness pass** has since burned down most of that debt: the majority of mapped Romance languages now have globally unique `[bases]` arrays, with only a short tail of shared-base clusters left for follow-up.
@@
Takeaway:
- Core Romance macro-family is in **good shape** for fantasy-mapping use at a coarse level (seed quality, duplication, and high-level flavor), and a substantial slice of the previously-documented iso/dialect-level uniqueness debt has already been paid down via the Worker‑3 pass.
- Remaining Romance work should focus on the small number of still-shared base clusters surfaced by `report-language-mixer-base-clusters` (currently concentrated around bases 3, 13, 22, 43, and 44) until each mapped Romance language has a unique base or mix signature.
- **Linked Wikipedia lists:** *Languages of Europe* subset (see §8.7).
- ✅ **2025‑12‑11 micro-pass:** `gallurese` now uses a mixed base set **[279, 233]** (Corsican + Sardinian) instead of sharing pure Corsican base 279. On the `Languages of Europe` helper, this raised **unique bases** among fully wired items from 85 to 86 and reduced **clustered bases** from 37 to 36, while keeping the ISO set unchanged.
 - **2025‑12‑11 micro-pass:** `pannonian-latin` now uses a mixed base set **[8, 3]** (Latin + Italian) instead of sharing the pure Latin base `[8]` with `lat`. On the `Languages of Europe` helper, this further increases the number of unique Romance `[bases]` signatures and reduces one of the remaining 2‑language Romance micro-clusters, without changing the ISO set.
 - **2025‑12‑11 micro-pass (Portuguese creoles, batch 1):** `bengali-portuguese-creole`, `cochin-portuguese-creole`, and `sri-lankan-portuguese-creole` now use `[13,183,256]` (Portuguese + Hindi + Odia), `[13,199,255]` (Portuguese + Tamil + Malayalam), and `[13,199,205]` (Portuguese + Tamil + Sinhala) instead of pure `[13]`, splitting the South Asian Portuguese-creole tail off the base‑13 macro-cluster while keeping core Portuguese standards on pure `[13]`.
 - ✅ **2025‑12‑11 micro-pass (Portuguese creoles, batch 2):** `korlai-portuguese-creole`, `kristang`, `macanese-patois`, and `mardijker-creole` now use `[13,183,253]` (Portuguese + Hindi + Marathi), `[13,304]` (Portuguese + Tagalog/Philippine), `[11,13,30]` (Portuguese + Mandarin + Cantonese), and `[13,195,367]` (Portuguese + Malay + Eastern Indonesian) instead of pure `[13]`, peeling off a second wave of non-European Portuguese creoles from the base‑13 macro-cluster while keeping core Portuguese standards canonical.
 - **2025‑12‑11 micro-pass (Portuguese creoles, batch 3):** Cape Verdean macro entries `barlavento-creoles`, `sotavento-creoles`, `fogo-creole`, and `santiago-creole` now use `[13,195,308]`, `[13,195,346]`, `[13,195,308,346]`, and `[13,195,308,367]` instead of pure `[13]`, giving each macro a distinct Portuguese-anchored creole signature and further shrinking the base‑13 cluster.
 - **2025‑12‑11 micro-pass (Spanish-contact creoles):** `chavacano` now uses `[4,193]` (Spanish + Tagalog) instead of pure Spanish `[4]`, `palenquero` uses `[4,153]` (Spanish + Kongo) instead of `[4]`, and `roquetas-pidgin-spanish` uses `[1,4,13]` (English + Spanish + Portuguese) instead of `[4]`, shrinking the pure‑Spanish `[4]` cluster while keeping `spa` as the canonical pure `[4]` Castilian/Spanish base.
 - **2025‑12‑11 micro-pass (Spanish-contact lects, batch 2):** `cocoliche` now uses `[3,4,286]` (Italian + Spanish + Asturian/West Iberian) instead of pure `[4]`, `llanito` uses `[1,4,231]` (English + Spanish + Judeo‑Spanish) instead of `[4]`, and `mediterranean-lingua-franca` uses `[2,3,4,18]` (French + Italian + Spanish + Maghrebi Arabic) instead of `[4]`, further shrinking the pure‑Spanish `[4]` dialect/lect cluster while keeping `spa` as the only pure `[4]` Castilian/Spanish standard.
- **2025‑12‑11 micro-pass (Spanish dialects, batch 3):** remaining Spanish dialect lects `canarian`, `cast-o`, `castilian`, `castrapo`, `mallorcan`, `menorcan`, and `murcian` have been moved off pure `[4]` onto unique Spanish‑anchored mixes `[2,4,286]`, `[3,4,232]`, `[2,3,4]`, `[2,4,232,286]`, `[3,4,233]`, `[2,4,233]`, and `[4,8,233]` respectively, leaving `spa` as the sole pure‑`[4]` Castilian/Spanish standard while preserving fine-grained dialect distinctions.
- **2025‑12‑11 micro-pass (Scandinavian + Portuguese cluster trim):** `norwegian` now mixes `[6,236]` and `danish` `[0,6,235]`, breaking the pure `[6]` Scandinavian cluster; `vosgien` moved to `[2,279]` to free the `[2,233]` mix for standard French; `brazilian-portuguese` now uses `[13,233]` to express its Sardinian/Azorean substrate instead of sharing pure `[13]`. CLI helper `generate-language-pair-samples.js` now also reports per-run “never mixed” ISOs so these rewires can be prioritized directly from helper output.
- **2025‑12‑11 micro-pass (Eastern Romance split):** cleared the `[8,233]` cluster by remapping `eastern-romanian` to `[8,233,43]` and `northern-romanian` to `[43,233]`, keeping `lat` `[8]` canonical and using Roman base `43` to differentiate the two Eastern Romance lects.
 - **Worker 7 (/languages-unique7) note:** this pass burned down the [22] and [3] mini-clusters around Balearic, Gaelic (`gla`), Irish (`gle`), Occitan, Istriot, Ligurian, and Romansh by wiring them to unique mixer base sets that blend Italian (3), Celtic (22), Scottish/Irish Gaelic (184/394), Occitan (232), Sardinian (233), Corsican (279), and Romansh (234), and also split the Papuan macros Finisterre–Huon languages, Inland Gulf, and Southeast Papuan languages off the shared `[198,263,360]` cluster via Engan Papuan (365) and Eastern Indonesian (367).

### 2.2 Uralic / Finnic cluster

Representative base:
- **Finnic** (`i:9`) – used for Finnish, Karelian, Veps, Sámi relatives, etc.

Status:
- Seed and config length bands align; names fall in expected 5–11 range.
- Duplication rule `d:"akiut"` is already tuned to preserve characteristic geminates.
- Mixer map shows base `9` reused across multiple Uralic branches and even some neighboring contact zones.

Takeaway:
- `i:9` currently acts as a **macro-Finnic / generic Uralic** base reused across multiple Uralic branches and some contact zones.
- Under the stricter "linguistically defensible" policy, any remaining identical shared `[9]` base-sets among distinct Uralic languages are treated as **uniqueness debt** and should be split into unique Uralic-appropriate mixes (or new bases) rather than preserved as an exception.
- If future flavor or gameplay needs demand more contrast inside Uralic, we can still introduce additional Uralic bases (e.g. East Uralic vs Finnic vs Sámi-flavored) and progressively remap languages off 9 until those subgroups have distinct base or mix signatures.
- **Linked Wikipedia lists:** *Languages of Europe* subset (see §8.7).
- **2025‑12‑11 micro-pass (Udmurt/Besermyan):** `besermyan` now uses `[283,438]`, adding a Finnic/Sámi-flavored layer **438** on top of the Udmurt base **283**, while `udmurt` remains the sole pure-`[283]` Udmurt standard.
- ✅ **2025‑12‑11 micro-pass (South Estonian / Kraasna):** `south-estonian` remains on pure `[424]` as the South Estonian anchor, while `kraasna` now uses `[424,283,425]`, adding Udmurt **283** and North-Estonian **425** layers so that it no longer shares a pure `[424]` key with `south-estonian` or collide with the existing South Estonian dialect mixes.
- **2025‑12‑11 verification:** `report-language-mixer-base-clusters --category=Uralic` shows the remaining `[9]` hub cluster (currently **24** members) and no other size≥3 clusters; under the current policy this is treated as remaining uniqueness debt to split rather than an intentional end-state.

### 2.3 Germanic cluster

Core Azgaar bases:
- **German** (`i:0`), **English** (`i:1`), **Nordic** (`i:6`).

Additional Germanic-like bases (in `namebases-fantasy.js`):
- **Afrikaans** (`i:268`), **Yiddish** (`i:230`), **Frisian** (`i:235`), **Faroese** (`i:236`), **Luxembourgish** (`i:293`).

Status:
- Length bands:
  - `German` / `English` / `Nordic` already have reasonable `min/max` ranges and strong seeds.
  - Added Germanic bases cluster around `min≈4`, `max≈12`, aligned with small/medium town names.
- Duplication rules:
  - `German (0)`: `d:"lt"`.
  - `English (1)`: `d:""` (very conservative; doubles mostly suppressed).
  - `Nordic (6)`: `d:"kln"`.
  - **New Germanic bases** (Afrikaans/Yiddish/Frisian/Faroese/Luxembourgish): standardized on `d:"lnrt"`.

Takeaway:
- Germanic macro-family is in **usable** shape.
- Some internal asymmetry (e.g. English being the most conservative on duplication) is currently accepted for flavor.
- No immediate `min/max` changes applied; we treat `d:"lnrt"` as the default for **new Germanic-like bases**.
- **Linked Wikipedia lists:** *Languages of Europe* subset (see §8.7).

### 2.4 Semitic / Afroasiatic (Levantine + surrounds)

Representative bases:
- **Berber** (`i:17`), **Arabic** (`i:18`), **Mesopotamian** (`i:23`), **Levantine** (`i:42`).

Status:
- Length bands checked with `check-namebase-lengths`:
  - `Berber (17)`: config `4–10`, seeds mostly `6–8` with mild tails.
  - `Arabic (18)`: config `4–9`, seeds centred `6–8`, occasional `10–11` outliers.
  - `Mesopotamian (23)`: config `4–9`, seeds have long historical forms but central mass `5–8` is covered.
  - `Levantine (42)`: config `4–12`, seeds `5–7` median, occasional longer historic names.
- No `min/max` adjustments made yet; the current ranges are decent for **city/state** style use.
- A dedicated Afroasiatic **Worker-3 uniqueness pass** has split most previously shared singletons in `language-mixer-map` so that individual Afroasiatic languages (especially Berber, Ethio-Semitic, and Chadic lects) now have unique `[bases]` arrays even when they still draw on 17/18/23/42 as ingredients.

Takeaway:
- Semitic macro-family is **serviceable** for flavor and now substantially less entangled in shared `[bases]` than in the original Azgaar mapping: most attested ISOs have distinct mixer signatures, with only a tiny core cluster still outstanding as uniqueness debt.
- Arabic, Mesopotamian, and Berber bases still act as broad central anchors and lexifier ingredients for many related ISOs in the mixer, but differences are increasingly expressed via additional Afroasiatic bases and per-ISO combinations rather than reusing a single bare base.
- **Linked Wikipedia lists:** *Languages of West Asia* subset (see §8.8).

### 2.5 Nahuatl & Quechua

Representative bases:
- **Nahuatl** (`i:14`), **Quechua** (`i:27`).

Status:
- Lengths:
  - `Nahuatl (14)`: config `6–13`, seeds `min=6, max=14, mean≈9.1`. Config tracks the core nicely.
  - `Quechua (27)`: config `6–12`, seeds `min=4, max=15, mean≈8.3`. Config again hugs the central `6–10` region.
- Duplication: both currently use `d:"l"` – preserves `ll`-type sequences without general over-duplication.

Takeaway:

- These two bases are **already niche and distinct**; good candidates for Mesoamerican / Andean flavor.
- No changes applied so far for `Nahuatl (14)` and `Quechua (27)`.
- Neighboring **Mazatec** (`i:169`, Oto-Manguean) had its length band retuned from `4–12` to `11–20` based on seed and generated stats so its home range matches the observed distribution.
 - **2025‑12‑11 micro-pass:** `pipil` now uses a mixed base set **[4, 14, 169]** (Spanish + Nahuatl + Mazatec neighbor) instead of sharing the `[4, 14]` mix with `nah`. On the `Indigenous languages of the Americas` helper, this increased **unique bases** among fully wired items by 1 and reduced **clustered bases** by 1, without altering the ISO set.
- **2025‑12‑11 verification:** `report-language-mixer-base-clusters --family=Nahuatl --region=Americas` reports no multi-member clusters, so all catalogued Nahuatl/Quechua entries are currently unique.

### 2.6 Slavic / East-European cluster

Representative mapping status (via `profile-language-mixes`):

- **East Slavic / macro-Slavic anchor**:
  - `rus` (Russian): family *East Slavic*, category *Slavic* → base **5 (Slavic/Ruthenian)**.
  - `ukr` (Ukrainian), `rusyn`, `podlachian`, `west-polesian`, `upper-sorbian`, `lower-sorbian`, `old-church-slavonic` also currently map to base **5**.

- **Lechitic cluster (West Slavic)**:
  - `pol` (Polish), `kashubian`, `polabian`, `pomeranian`, `slovincian`: family *Lechitic* → base **314 (Lechitic)**.

- **Czech–Slovak cluster (West Slavic)**:
  - `ces` (Czech), `slovak`: family *Czech-Slovak* → base **315 (Czech-Slovak)**.

- **South Slavic BCS cluster (Western South Slavic)**:
  - `bosnian`, `croatian`, `montenegrin`, `srp` (Serbian), `serbo-croatian`: family *Western South Slavic* → base **316 (South Slavic BCS)**.

- **Other dedicated Slavic bases**:
  - `belarusian` → base **266 (Belarusian)**.
  - `slovene` → base **267 (Slovene)**.
  - `macedonian` → base **273 (Macedonian)**.
  - `silesian` → base **294 (Silesian)**.

Additional mapping cleanup (Stage A/B):
- Removed stray mappings from `ces` to **20 (Basque)** and from `ukr` to **25 (Hawaiian)**; both now lean on Slavic-family bases only.
- Deduplicated `rus → [5]` entries in `language-mixer-map.json`.
- Introduced dedicated bases **314 (Lechitic)**, **315 (Czech-Slovak)**, and **316 (South Slavic BCS)** and remapped the corresponding West/South Slavic ISOs off base 5.

Takeaway:

- Base **5 (Slavic/Ruthenian)** now primarily serves as a macro **East Slavic / historical Slavic** anchor plus some Sorbian and border lects.
- West Slavic subclusters (Lechitic and Czech–Slovak) and the core South Slavic BCS cluster now have **distinct bases with tuned length bands**, improving internal contrast within the Slavic family.
- Future passes may:
  - split East Slavic further (e.g. Russian vs Ukrainian vs Belarusian),
  - give Sorbian and border lects (Podlachian / West Polesian) blended or dedicated bases,
  - and tighten duplication / length settings once more gameplay feedback is available.
- **Linked Wikipedia lists:** *Languages of Europe* subset (see §8.7).
 - ✅ **2025‑12‑11 micro-pass:** `kashubian` now uses a mixed base set **[5, 314, 0]** (Slavic/Ruthenian + Lechitic + German) to reflect Polish + macro-Slavic core plus German contact. On the `Languages of Europe` helper, this increased **unique bases** among fully wired items from 83 to 85 and reduced **clustered bases** from 39 to 37, without changing the global ISO set.

### 2.7 East Asia (Sinitic / Japonic / Koreanic & neighbors)

Representative bases / mappings (via `profile-language-mixes`):

- **Chinese / Mandarin**:
  - `iso: mandarin` → base **11 (Chinese)**.
  - Seed lengths `min=4, max=11, mean≈7.0`; config `5–10` with p25–p75 ≈ `6–8`.
  - Mixer map previously also had a stray mapping `mandarin → 66`; this has been removed so Mandarin now consistently uses base 11.
- **Japanese**:
  - `iso: jpn-lang` → base **12 (Japanese)**.
  - Seeds `min=3, max=14, mean≈6.8`; config `4–10` with p25–p75 ≈ `6–8`.
- **Korean**:
  - `iso: kor` → base **10 (Korean)**.
  - Seeds `min=3, max=11, mean≈6.9`; config `5–11` with p25–p75 ≈ `6–8`.
- **Vietnamese**:
  - `iso: vie` → base **29 (Vietnamese)**.
  - Seeds `min=3, max=19, mean≈8.1`; config `3–12` with p25–p75 ≈ `7–9`, plus `hyphen/space` flags to allow multi-word and hyphenated forms.
- **Cantonese**:
  - `iso: yue` → base **30 (Cantonese)**.
  - Seeds `min=4, max=14, mean≈7.4`; config `5–11` with p25–p75 ≈ `6–8`.

Takeaway:

- Core East Asian standards (Mandarin, Japanese, Korean, Vietnamese, Cantonese) each have **dedicated, well-anchored bases** with sensible length bands.
- Mandarin’s duplicate mapping to a non-Chinese base (66) has been cleaned; it now correctly routes only to base 11.
- Next East Asian work should focus on:
  - auditing **Mongolic** and neighboring families (Mongolian / Khalkha / Buryat / Kalmyk, plus historical Mongolic varieties) to ensure they are mapped onto base **31 (Mongolian)** or other purpose-built Mongolic bases rather than unrelated hubs, and
  - checking that smaller Sinitic varieties and regional lects do not silently collapse onto the same few bases without justification.
- **2025‑12‑11 micro-pass (Southeast Asia Austronesian decluster):** cleared four Southeast Asia base-set clusters by adding small, region-plausible Austronesian ingredients:
  - ✅ `banjar` now uses `[194,195,193,367]` (Indonesian + Malay + Tagalog + Eastern Indonesian)
  - ✅ `berau-malay` now uses dedicated base `[444]` (**Berau Malay**)
  - ✅ `malay` now uses dedicated base `[445]` (**Standard Malay**), while base **195** remains a Malay / trade-lexifier hub for other Malayic lects
  - ✅ Malay hub burn-down (formerly pure `[195]`):
    - ✅ `cocos-malay` → `[446]` (Cocos Malay)
    - ✅ `kupang-malay` → `[447]` (Kupang Malay)
    - ✅ `larantuka-malay` → `[448]` (Larantuka Malay)
    - ✅ `makassar-malay` → `[449]` (Makassar Malay)
    - ✅ `malaccan-creole-malay` → `[450]` (Malaccan Creole Malay)
    - ✅ `manado-malay` → `[451]` (Manado Malay)
    - ✅ `maumere-malay` → `[452]` (Maumere Malay)
    - ✅ `north-moluccan-malay` → `[453]` (North Moluccan Malay)
    - ✅ `papuan-malay` → `[454]` (Papuan Malay)
    - ✅ `serui-malay` → `[455]` (Serui Malay)
    - ✅ `sri-lankan-malay` → `[456]` (Sri Lankan Malay)
    - ✅ `sula-malay` → `[457]` (Sula Malay)
  - ✅ Burned down remaining pure `[195]` singletons (non-`*-malay`) by dedicating bases `[458–475]`:
    - ✅ Aslian (Austroasiatic): `batek`→`[458]`, `mah-meri`→`[459]`, `semai`→`[460]`, `semaq-beri`→`[461]`, `semelai`→`[462]`, `temiar`→`[463]`
    - ✅ Nicobarese: `camorta-nicobarese`→`[464]`, `car-nicobarese`→`[465]`, `chaura-nicobarese`→`[466]`, `nancowry-nicobarese`→`[467]`, `nicobarese`→`[468]`, `shompen`→`[471]`, `southern-nicobarese`→`[472]`, `teressa-nicobarese`→`[473]`, `katchal-nicobarese`→`[474]`
    - ✅ Malay-based creoles: `orang-pulo`→`[469]`, `peranakan`→`[470]`
    - ✅ Unclassified: `kenaboi`→`[475]`
  - ✅ Began burning down `[194,195]` cluster debt by dedicating bases `[476–482]`:
    - ✅ `minangkabau`→`[476]` (Minangkabau)
    - ✅ `lampung`→`[477]` (Lampung)
    - ✅ `bima`→`[478]` (Bima)
    - ✅ `rejang`→`[479]` (Rejang)
    - ✅ `basap`→`[480]` (Basap)
    - ✅ `selaru`→`[481]` (Selaru)
    - ✅ `land-dayak`→`[482]` (Land Dayak)
  - ✅ Continued burning down `[194,195]` cluster debt by dedicating bases `[483–490]`:
    - ✅ `flores-lembata`→`[483]` (Flores-Lembata)
    - ✅ `kei-tanimbar`→`[484]` (Kei-Tanimbar)
    - ✅ `timoric`→`[485]` (Timoric)
    - ✅ `sumba-flores`→`[486]` (Sumba-Flores)
    - ✅ `tomini-tolitoli`→`[487]` (Tomini-Tolitoli)
    - ✅ `muna-buton`→`[488]` (Muna-Buton)
    - ✅ `minahasan`→`[489]` (Minahasan)
    - ✅ `sangiric`→`[490]` (Sangiric)
  - ✅ Continued burning down `[194,195]` cluster debt by dedicating bases `[491–496]`:
    - ✅ `kayan-murik`→`[491]` (Kayan-Murik)
    - ✅ `melanau-kajang`→`[492]` (Melanau-Kajang)
    - ✅ `north-sarawakan`→`[493]` (North Sarawakan)
    - ✅ `sabahan`→`[494]` (Sabahan)
    - ✅ `north-borneo`→`[495]` (North Borneo)
    - ✅ `greater-north-borneo`→`[496]` (Greater North Borneo)
  - ✅ Continued burning down `[194,195]` cluster debt by dedicating bases `[497–503]`:
    - ✅ `makassar-branch`→`[497]` (Makassar Branch)
    - ✅ `south-sulawesi`→`[498]` (South Sulawesi)
    - ✅ `northern-south-sulawesi`→`[499]` (Northern South Sulawesi)
    - ✅ `central-south-sulawesi`→`[500]` (Central South Sulawesi)
    - ✅ `kaili-wolio`→`[501]` (Kaili-Wolio)
    - ✅ `saluan-banggai`→`[502]` (Saluan-Banggai)
    - ✅ `seko-badaic`→`[503]` (Seko-Badaic)
  - ✅ Finished burning down the remaining exact `[194,195]` mappings by dedicating bases `[504–510]`:
    - ✅ `moklenic`→`[504]` (Moklenic)
    - ✅ `nasal`→`[505]` (Nasal)
    - ✅ `northwest-sumatra-barrier-islands`→`[506]` (Northwest Sumatra Barrier Islands)
    - ✅ `sumatran`→`[507]` (Sumatran)
    - ✅ `shwng`→`[508]` (SHWNG / South Halmahera–West New Guinea)
    - ✅ `barito`→`[509]` (Barito)
    - ✅ `bali-sasak-sumbawa`→`[510]` (Bali Sasak Sumbawa)
  - ✅ Burned down remaining Malay-lexifier creoles still referencing hub base **195**:
    - ✅ `alor-malay`→`[511]` (Alor Malay)
    - ✅ `ambonese-malay`→`[512]` (Ambonese Malay)
  - ✅ Removed remaining Malay-adjacent macro / diaspora uses of base **195** by dedicating bases `[513–517]`:
    - ✅ `malaysian-mandarin`→`[513]` (Malaysian Mandarin)
    - ✅ `malayo-chamic`→`[514]` (Malayo-Chamic)
    - ✅ `malayo-polynesian`→`[515]` (Malayo-Polynesian)
    - ✅ `western-malayo-polynesian`→`[516]` (Western Malayo-Polynesian)
    - ✅ `singaporean-mandarin`→`[517]` (Singaporean Mandarin)
  - ✅ Reduced hub base **195** usage for Indonesian by dropping it from the mapping: `indonesian` now uses `[194,367]`.
  - ✅ Burned down `[194,195,303]` cluster debt by dedicating bases `[518–519]`:
    - ✅ `ace`→`[518]` (Acehnese)
    - ✅ `madurese`→`[519]` (Madurese)
  - ✅ Burned down `[194,195,198]` cluster debt by dedicating bases `[520–522]`:
    - ✅ `north-new-guinea`→`[520]` (North New Guinea)
    - ✅ `sawila`→`[521]` (Sawila)
    - ✅ `halmahera-sea`→`[522]` (Halmahera Sea)
  - ✅ `iban` now uses dedicated base `[439]` (**Iban**)
  - ✅ `sarawakian-malay` now uses dedicated base `[440]` (**Sarawakian Malay**)
  - ✅ `brunei-malay` now uses dedicated base `[441]` (**Brunei Malay**)
  - ✅ `sabah-malay` now uses dedicated base `[442]` (**Sabah Malay**)
  - ✅ `malaysian-malay` now uses dedicated base `[443]` (**Malaysian Malay**)
  - ✅ `kasiguranin` now uses `[193,304,367,194]` (Tagalog + Cebuano + Eastern Indonesian + Indonesian)
  - ✅ `iranun` now uses `[193,195,304,367]` (Tagalog + Malay + Cebuano + Eastern Indonesian)
  This removes the prior clusters `[193,195,304]`, `[193,195,367]`, `[193,304,367]`, and `[195,304,346]` as verified by `report-language-mixer-base-clusters --region='Southeast Asia'`.

  - ✅ Blocked-195 Batch 1 (doc correction): the repo does **not** currently define namebases `i=539–542`, so those remaps are not applied.
    - Current mixer-map (verified):
      - `mardijker-creole`→`[13,195,367]`
      - `tetum`→`[13,195,367]`
      - `sat`→`[29,195,251]`
      - `rbb`→`[29,251,195]`

  - ✅ Health unblock (verified): added the missing mixer map entry for catalog ISO `dre` (Dolpo) by wiring it to an existing Tibetic base-set `dre`→`[47,54,58]`.

### 2.8 Sub-Saharan Africa (first Bantu split)

Representative bases / mappings (via `profile-language-mixes`):

- **West / Horn African standards**:
  - **Yoruba**: `yor` / `yoruba` → base **112 (Yoruba)**, seeds `min=3, max=9, mean≈6.0`, config `4–12`, ASCII with `hyphen`.
  - **Igbo**: `igbo` → base **113 (Igbo)**, seeds `min=3, max=11, mean≈5.8`, config `4–12`, ASCII with `hyphen`.
  - **Somali**: `somali` → base **130 (Somali)**, seeds `min=3, max=10, mean≈6.6`, config `4–12`, ASCII.
  - **Amharic**: `amharic` → base **133 (Amharic)**, seeds `min=4, max=12, mean≈8.4`, config `4–12`, ASCII with `hyphen`.
- **Bantu cluster (Great Lakes / Southern)**:
  - **Lingala**: `lingala` → base **146 (Lingala)**, seeds `min=4, max=13, mean≈6.7`, config `4–12`, ASCII with `hyphen`.
  - **Kinyarwanda**: `kinyarwanda` → base **147 (Kinyarwanda)**, seeds `min=5, max=9, mean≈7.2`, config `4–12`, ASCII.
  - **Shona**: `shona` → base **148 (Shona)**, seeds `min=5, max=11, mean≈7.1`, config `4–12`, ASCII.
  - **Zulu**: `zulu` → base **149 (Zulu)**, seeds `min=6, max=16, mean≈8.6`, config `4–12`, ASCII with `hyphen`.
  - **Xhosa**: `xhosa` → base **150 (Xhosa)**, seeds `min=5, max=19, mean≈9.0`, config `4–12`, ASCII with `apostrophe / hyphen / space`.
  - **Sesotho**: `sesotho` → base **151 (Sesotho)**, seeds `min=6, max=14, mean≈9.4`, config `4–12`, ASCII with `apostrophe / hyphen`.
  - **Tswana**: `tswana` → base **152 (Tswana)**, seeds `min=4, max=13, mean≈7.8`, config `4–12`, ASCII with `hyphen`.

Changes applied in `language-mixer-map.json`:

- `zulu`, `xhosa`, and `shona` previously had duplicate mappings to **base 28 (Swahili)** alongside their own Bantu bases (148–150); the Swahili duplicates have been removed so they now use only their dedicated bases.
- `kinyarwanda`, `lingala`, `sesotho`, and `tswana` likewise had trailing Swahili-28 mappings; these duplicates have been removed so they now resolve only to bases **147, 146, 151, 152** respectively.

- **Second-pass Bantu refinement**:
  - `kongo`, `luganda`, `chichewa`, and `kikuyu` previously also had trailing Swahili-28 mappings in addition to their dedicated bases **153 (Kongo)**, **154 (Luganda)**, **155 (Chichewa)**, **156 (Kikuyu)**.
  - These Swahili duplicates have now been removed so they consistently use only their own Bantu bases, with shared settings `min=4, max=12, d="lnrt"` and city seeds drawn from their respective core regions.

- Post-coverage wiring for additional African lects:
  - **Sekele** (`sekele`, Kx'a / Northern ǃKung) now maps to a dedicated Kx'a click blend `[353,354]`, alongside **Ekoka ǃKung** (`ekoka-kung` → `[353]`) and **ǂ’Amkoe** (`amkoe` → `[355]`), and distinct from the pure **Taa** / **Nǁng** / **Nama** / **Naro** click bases `[356–359,361]`.
  - ✅ **Sena** (`sena`, Bantu; Mozambique/Malawi) now has a unique Southeastern Bantu mix `[148,155]` anchored on **Shona (148)** and **Chichewa (155)** rather than riding on a generic Swahili or undifferentiated Pan-African hub.
  - ✅ **Tumbuka** (`tumbuka`, Bantu; Malawi/Zambia) now uses a SE Bantu/Zambezi blend `[155,377]` combining **Chichewa (155)** with the regional **Bemba–Bembe–Fwe** cluster base **377**, reflecting its close ties to Chichewa and neighboring Zambian lects.
  - ✅ **Tonga (Zimbabwe, Zambia, and Mozambique)** (`tonga-zimbabwe-zambia-and-mozambique`) now has a Southern/Zambezi Bantu mix `[148,149,377]` tying **Shona (148)** and **Zulu (149)** into the **Bemba–Bembe–Fwe** basin **377**.
  - ✅ **Tonga (Mozambique)** (`tonga-mozambique`) now uses `[148,149,155]`, blending **Shona (148)** and **Zulu (149)** with **Chichewa (155)** to reflect its SE Mozambique contact zone.
  - ✅ **Tonga (Malawi)** (`tonga-malawi`) now uses `[148,155,377]`, emphasizing **Shona (148)**, **Chichewa (155)**, and the **Bemba–Bembe–Fwe** cluster **377** across the Malawi–Zambia corridor.
  - ✅ **Soli** (`soli`, Botatwe Bantu; Zambia) now has `[149,155,377]`, a Botatwe/Zambezi blend over **Zulu (149)**, **Chichewa (155)**, and **Bemba–Bembe–Fwe (377)** alongside neighboring Tonga and Tumbuka.
  - ✅ **Tswa** (`tswa`, Tswa–Ronga Bantu; Mozambique) now uses `[148,150,152]`, a Tswa–Ronga SE Bantu mix anchored on **Shona (148)** plus **Xhosa (150)** and **Tswana (152)**.
  - ✅ **Tsonga or Xitsonga** (`tsonga-or-xitsonga`, Tswa–Ronga Bantu; Mozambique/South Africa) now uses `[149,150,152]`, a slightly more Nguni-leaning Tswa–Ronga blend combining **Zulu (149)**, **Xhosa (150)**, and **Tswana (152)**.
  - ✅ **Swazi** (`swazi`, Nguni Bantu; Eswatini/South Africa) now has `[149,150]`, a compact Nguni mix over **Zulu (149)** and **Xhosa (150)**.
  - ✅ **Southern Ndebele** (`southern-ndebele`, Nguni Bantu; South Africa) now uses `[149,151]`, reflecting a Zulu–Sesotho contact blend.
  - ✅ **Sumayela Ndebele** (`sumayela-ndebele`, Nguni Bantu; South Africa) now uses `[149,152]`, a Zulu–Tswana-flavored Nguni mix.
  - ✅ **Sotho** (`sotho`, Sotho-Tswana Bantu; Southern Africa) now has `[151,152]`, a macro-Sotho mix spanning **Sesotho (151)** and **Tswana (152)**.
  - ✅ **Sepedi** (`sepedi`, Northern Sotho/Pedi; South Africa) now uses `[149,151,152]`, adding a Zulu contact component to the core Sotho–Tswana band.
  - ✅ **Setlôkwa** (`setlokwa`, Sotho-Tswana Bantu; South Africa/Botswana) now uses `[150,151,152]`, a slightly more eastern Sotho–Tswana blend incorporating **Xhosa (150)**.
  - ✅ **Pretoria Sotho** (`pretoria-sotho`, urban Sotho–Tswana creole; South Africa) now uses `[148,149,151,152]`, an urban Sotho–Tswana macro-mix blending **Shona (148)**, **Zulu (149)**, **Sesotho (151)**, and **Tswana (152)** while keeping `tswana` as the pure base-**152** anchor.
  - ✅ **Tsotsitaal** (`tsotsitaal`, Tswana-based urban slang/creole; South Africa) now uses `[1,151,152]`, an English–Sotho–Tswana contact mix anchored on **English (1)** with a **Sesotho (151)** and **Tswana (152)** substrate.
  - ✅ **Totela** (`totela`, Lozi-related Bantu; Namibia/Zambia) now uses `[149,152,377]`, a Zambezi blend combining **Zulu (149)**, **Tswana (152)**, and the regional **Bemba–Bembe–Fwe** basin base **377**.
  - ✅ **Tshiluba / Luba-Kasai** (`tshiluba`, DRC Bantu) now uses `[146,153]`, a Congolese mix anchored on **Lingala (146)** and **Kongo (153)**.
  - ✅ **Sakata** (`sakata`, DRC Bantu) now uses `[146,153,277]`, adding a modest Sahelian trade component via **Zarma Songhay (277)** on top of the same Lingala/Kongo backbone.
  - ✅ **Umbundu** (`umbundu`, South Mbundu Bantu; Angola) now uses `[146,149,153]`, bridging **Lingala/Kongo (146/153)** with a southern Bantu component **Zulu (149)**.
  - **Venda / Tshivenda** (`venda` / `tshivenda`, Southern Bantu; South Africa/Zimbabwe) now use `[148,151,152]` and `[148,151,152,377]` respectively, a pair of Venda–Sotho–Shona mixes that share the **Shona (148)** + **Sesotho/Tswana (151/152)** core while giving **Tshivenda** an added Zambezi flavor via **Bemba–Bembe–Fwe (377)**.
  - ✅ **Suku** (`suku`, Yaka-branch Bantu; DRC) now uses `[146,153,377]`, tying the **Lingala/Kongo (146/153)** zone into the **Bemba–Bembe–Fwe (377)** basin.
  - **Bembe (Congo) / Bembe (DRC)** (`bembe-congo`, `bembe-drc`, Bantu; Republic of the Congo / DRC) now use `[153,377]` and `[146,377]` respectively, splitting the former pure-`[377]` pair into distinct Kongo- and Lingala-anchored Zambezi mixes while keeping base **377** as the shared **Bemba–Bembe–Fwe** basin.
  - **Berta / Besme** (`berta`, `besme`, Afro-Sahelian borderzone; Sudan/Chad) now use multi-base mixes `[132,145,277,378]` and `[120,132,145,378]` instead of a shared pure-`[378]` key, keeping base **378** as a common Blue Nile / Nuba‑hills basin while distinguishing Berta’s stronger Sahel/Sudan contact (`132`, `277`) from Besme’s more Niger‑Congo‑leaning ties (`120`, `145`).
  - **Afrikaans / Oorlams Creole** (`afrikaans`, `oorlams-creole`, West Germanic / Afrikaans-based creole; Southern Africa/Namibia) now form a de-clustered pair where `afrikaans` remains the canonical pure-`[268]` Afrikaans base, while `oorlams-creole` uses a Germanic creole mix `[0,1,268]` layered over **German (0)**, **English (1)**, and **Afrikaans (268)**.
  - **Saba / Sukur / Tsamai** (`saba`, `sukur`, `tsamai`, Afroasiatic; Sahel / Horn of Africa) now form a small Afroasiatic micro-cluster split so that `saba` remains on the full macro Afroasiatic base-set anchored on `[17,144]`, while `sukur` now uses a compact Sahelian Afroasiatic mix `[17,132,144]` and `tsamai` uses a Horn-leaning Afroasiatic mix `[17,133,140,144]`, giving each language a distinct `bases[]` signature.
  - **Yoruba (alias ISO)** (`yoruba`, alias for `yor`, Niger–Congo; West Africa) now uses a West African trade mix `[112,114,132,277]` anchored on **Yoruba (112)**, **Fula (114)**, **Hausa (132)**, and **Zarma Songhay (277)`, while the canonical `yor` entry remains the sole pure-`[112]` Yoruba base.
  - **Afar** (`afar`, Afroasiatic / East Cushitic; Horn of Africa) now uses a Horn-leaning Afroasiatic mix `[133,140]`, pairing a more specific Cushitic base **133** with the macro East Cushitic anchor **140** instead of sharing a pure-`[140]` key with the broader Cushitic cluster.
  - **Tigrinya / Dahalik** (`tigrinya`, `dahalik`, Ethio-Semitic; Eritrea / Dahlak Islands) now form a de-clustered pair where `tigrinya` remains the canonical pure-`[134]` Ethiopic base, while `dahalik` uses an Arabic-influenced Ethio-Semitic mix `[18,133,134]` combining **Maghrebi Arabic (18)**, a Cushitic/Horn layer **133**, and the Ethiopic anchor **134**.
  - **Bade (Chadic)** (`bade-chadic`, Afroasiatic / West Chadic; Nigeria) now uses a West African Chadic mix `[112,120,132,277]` that layers **Yoruba (112)**, **Ewe (120)**, and **Zarma Songhay (277)** on top of the **Hausa (132)** anchor instead of sharing a pure-`[132]` key with the broader Hausa/Chadic cluster.
  - **Wolof / Pidgin Wolof** (`wolof`, `pidgin-wolof`, Niger–Congo / pidgin; West Africa) now form a de-clustered pair where `wolof` remains the canonical pure-`[115]` Wolof base, while `pidgin-wolof` uses an English–Wolof creole mix `[1,115]` anchored on **English (1)** and **Wolof (115)**.
  - ✅ **Shi / Mashi** (`shi`, South Kivu Bantu; DRC) now uses `[146,147,153]`, a Great Lakes–Congo mix over **Lingala (146)**, **Kinyarwanda (147)**, and **Kongo (153)**.
  - ✅ **Shanjo** (`shanjo`, Zambia Bantu) now uses `[148,152,377]`, a Zambezi blend over **Shona (148)**, **Tswana (152)**, and **Bemba–Bembe–Fwe (377)**.
  - ✅ **Simaa** (`simaa`, Kavango–Southwest Bantu; Zambia) now uses `[148,151,377]`, linking **Shona (148)** and **Sesotho (151)** into the **Bemba–Bembe–Fwe (377)** corridor.
  - ✅ **Yeyi** (`yeyi`, Okavango Bantu with clicks; Namibia/Botswana) now uses `[152,353,358]`, combining **Tswana (152)** with **Kx'a Click A (353)** and **Nama Click (358)** to reflect its Bantu-with-clicks profile.
  - ✅ **Zemba / Dhimba** (`zemba`, Herero-related Bantu; Angola/Namibia) now uses `[149,153,377]`, a southwestern Bantu blend tying **Zulu (149)**, **Kongo (153)**, and the **Bemba–Bembe–Fwe (377)** basin.
  - ✅ **Songhoyboro Ciine** (`songhoyboro-ciine`, Southern Songhay; Niger) now uses `[277,132]`, a Sahelian mix anchored on **Zarma Songhay (277)** with a strong **Hausa (132)** contact component.
  - ✅ **Tadaksahak** (`tadaksahak`, Northern Songhay; Mali/Niger) now uses `[277,18,132]`, blending **Zarma Songhay (277)** with **Maghrebi Arabic (18)** and **Hausa (132)** to reflect its Tuareg/Arabic contact.
  - ✅ **Tasawaq** (`tasawaq`, Northern Songhay; Niger) now uses `[277,18]`, a Songhay–Arabic mix over **Zarma (277)** and **Maghrebi Arabic (18)**.
  - ✅ **Tagdal** (`tagdal`, Northern Songhay; Niger) now uses `[277,18,17]`, a more Berber-leaning Northern Songhay blend combining **Zarma (277)** with **Maghrebi Arabic (18,17)**.
  - ✅ **Susu** (`susu`, coastal Mande; Guinea/Sierra Leone) now uses `[112,277]`, a coastal trade mix anchored on **Yoruba (112)** with a **Zarma Songhay (277)** Sahel influence.
  - ✅ **Supyire** (`supyire`, Northern Senufo; Mali) now uses `[112,132,277]`, reflecting **Yoruba (112)** + **Hausa (132)** + **Zarma (277)** contact in the northern Senufo zone.
  - ✅ **Twi / Akan** (`twi`, Akan dialect cluster; Ghana) now uses `[112,113,277]`, a Ghanaian macro-mix combining **Yoruba (112)**, **Igbo (113)**, and a lighter **Zarma (277)** Sahel component.
  - ✅ **Yalunka** (`yalunka`, Mande; Guinea/Sierra Leone/Mali/Senegal) now uses `[113,277]`, a Mande/Sahel mix over **Igbo (113)** and **Zarma Songhay (277)**, paralleling its close relationship with Susu.

  - ✅ **South Banda** (`south-banda`, Banda/Ubangian; CAR/DRC) now uses `[297,146]`, mixing **Sango (297)** with **Lingala (146)**.
  - ✅ **West Banda** (`west-banda`, Banda/Ubangian; CAR) now uses `[297,153]`, mixing **Sango (297)** with **Kongo (153)**.
  - ✅ **Wongo** (`wongo`, Bantu; DRC) now uses `[146,152,153]`, a central Bantu blend over **Lingala (146)**, **Tswana (152)**, and **Kongo (153)**.
  - ✅ **Wushi** (`wushi`, Grassfields Bantu; Cameroon) now uses `[112,146,152]`, tying **Yoruba (112)** into a **Lingala (146)** + **Tswana (152)** central/hinterland band.

Takeaway:

- A core set of major Sub-Saharan languages (Yoruba, Igbo, Somali, Amharic, Lingala, Kinyarwanda, Shona, Zulu, Xhosa, Sesotho, Tswana, **Kongo, Luganda, Chichewa, Kikuyu**) now each have **dedicated, well-anchored bases** with sensible length bands.
- Swahili (28) is moving back toward its role as a **trade/lexifier hub** rather than a generic stand-in for unrelated Bantu languages.
- Many **smaller African lects** (additional Bantu and Atlantic–Congo families) still map directly to Swahili 28 or other hubs and remain candidates for future passes to introduce language-specific bases and tuned length/duplication profiles.
 - **Linked Wikipedia lists:** *Languages of Africa – major languages subset* (see §8.1).

---

### 2.9 South Asia (Indo-Aryan / Dravidian)

Representative bases / mappings (via `profile-language-mixes`):

- **Indo-Aryan standards (one-to-one bases)**:
  - **Hindi**: `hin` → base **183 (Hindi)**, seeds `min=4, max=11, mean≈6.6`, generated stats `min=4, max=12, mean≈7.4, p25≈5, p75≈9, p90≈11`; config band tightened from `4–12` to `5–11` so the home range hugs the central distribution.
  - **Urdu**: `urdu` → base **203 (Urdu)**, seeds `min=5, max=15, mean≈8.0`, config `4–12`, ASCII + space.
  - **Gujarati**: `gujarati` → base **204 (Gujarati)**, seeds `min=5, max=11, mean≈7.0`, config `4–12`, ASCII.
  - **Sinhala**: `sinhala` → base **205 (Sinhala)**, seeds `min=5, max=12, mean≈8.3`, config `4–12`, ASCII + space.
  - **Odia**: `odia` → base **256 (Odia)**, seeds `min=4, max=13, mean≈8.1`, config `4–12`, ASCII.
  - **Assamese**: `assamese` → base **257 (Assamese)**, seeds `min=5, max=10, mean≈7.5`, config `4–12`, ASCII.
  - **Kashmiri**: `kashmiri` → base **288 (Kashmiri)**, seeds `min=4, max=9, mean≈7.0`, config `4–12`, ASCII.
  - **Sindhi**: `sindhi` → base **289 (Sindhi)**, seeds `min=4, max=19, mean≈8.4`, config `4–12`, ASCII + space.
  - **Marathi / Konkani**: `marathi`, `konkani` → base **253 (Marathi)**, generated stats `min=3, max=12, mean≈6.9, p25≈5, p75≈8, p90≈10`; config band tightened from `4–12` to `5–10` to capture the core while trimming rare extremes.
  - **Punjabi**: `punjabi` → base **202 (Punjabi)**, generated stats `min=4, max=12, mean≈7.9, p25≈6, p75≈10, p90≈11`; config band tightened from `4–12` to `6–11` to reflect the observed 6–11 cluster.

- **Dravidian macro-hubs**:
  - **Tamil**: base **199 (Tamil)**, shared across South / Central / North / unclassified Dravidian lects; seeds `min≈5, max≈15, mean≈9.1`, generated stats `min=4, max=12, mean≈8.0, p25≈5, p75≈11`. Config band lightly tightened from `4–12` to `5–12` so it aligns with p25 and avoids very short outliers.
  - **Telugu**: base **200 (Telugu)**, shared across South-Central + some South Dravidian lects; seeds `min≈5, max≈13, mean≈8.3`, config `4–12` covers the core (`p25≈6, p75≈10`).
  - **Kannada**: base **254 (Kannada)**, used for Kannada, Tulu, Kodava, and neighbors; seeds `min≈5, max≈14, mean≈7.8`, config `4–12` matches `p25≈6, p75≈9`.
  - **Malayalam**: base **255 (Malayalam)**, used for Malayalam and many closely related South Dravidian lects; seeds `min≈5, max≈18, mean≈9.1`, config `4–12`, with central mass (`p25≈8, p75≈10`) inside the band.

Takeaway:

- Core Indo-Aryan standards have **one-to-one bases** with reasonable `min/max` bands; they are not acting as problematic hubs.
- A first Indo-Aryan mixer pass has also broken the worst Hindi-adjacent shared-base cluster: **Bhojpuri** and **Magahi** no longer share `[183,201]`, but instead use unique 183-anchored mixes while continuing to reflect a Hindi-centered palette.
- Dravidian still leans on a small set of **macro-family bases** (Tamil 199, Telugu 200, Kannada 254, Malayalam 255) reused across many lects; under the explicit per-language uniqueness rule this remains **uniqueness debt**, but multiple South Dravidian passes have now remapped many Malayalam/Tamil-adjacent lects (including the former pure-255 tail) onto distinct `[199/253/254/255/372–375]` combinations so that no South Dravidian entry remains on a bare `[255]` array.
- Initial tuning on **Tamil (199)** (raising `min` from `4` to `5`) ensures generated names better reflect the observed Tamil length distribution, but it does **not** change the requirement that each Dravidian language should ultimately have its own base or tuned mix rather than sharing these macro-hubs.
- **2025‑12‑11 micro-pass (South Dravidian tail):** the shared Dravidian clusters `[199,254,372]` (`kota-dravidian`, `sholaga`), `[372,374]` (`madiya`, `pattapu`), and `[374]` (`pardhan`, `muria`) have been split so that `kota-dravidian`, `madiya`, and `pardhan` retain `[199,254,372]`, `[372,374]`, and `[374]` as canonical anchors while `sholaga`, `pattapu`, and `muria` now use unique tail mixes `[199,372,374]`, `[372,374,375]`, and `[199,372,375]` respectively.
- Future passes should therefore:
  - introduce additional Dravidian bases for major subgroups (e.g. Gondi-like cluster vs generic Telugu; select Malayalam-based minorities vs core Malayalam),
  - progressively remap languages off the shared 199/200/254/255 hubs until each mapped Dravidian entry has a unique base or mix signature, and tighten length and duplication settings per base once more targeted seeds are available.
- **Linked Wikipedia lists:** *List of languages by number of native speakers* subsets (see §8.2 and §8.3).
### 2.10 Shared-base cluster cleanup (Worker 2 passes)

Representative clusters addressed so far (using `report-language-mixer-base-clusters.js` together with family-focused sweeps):

- **Note (diagnostic snapshots):** `report-language-mixer-base-clusters.js` is a read-only helper; any `_last-language-base-clusters*.txt` or `_report-language-mixer-base-clusters.txt` files under `tools/mixer-diagnostics/` are just saved console output for review, are gitignored, and should be treated as ephemeral diagnostics that can be regenerated on demand, not as editable source data.

- **Romance:** Shared `[3]`, `[13]`, `[22]`, `[43]`, and `[44]` clusters have been split so each mapped Romance entry now has a distinct base or mix signature (see §2.1).
- **Uralic:** Non-9 Uralic clusters around bases 320–323 (Khanty, Mansi, Mari, Nenets) have been split into unique mixes. Any remaining identical `[9]` base-set clusters are treated as ongoing uniqueness debt under the stricter policy.
- **South Asia / Dravidian:** Multiple passes have remapped South Dravidian and Tamil-adjacent lects off pure `[199]` / `[255]` onto distinct `[199/253/254/255/372–375]` combinations; in particular, the Malayalam-anchored `[255]` tail is now fully de-clustered so that no South Dravidian entry uses a pure `[255]` array (see §2.9).
- **Hindi / Indo-Aryan:** The shared `[183,201]` cluster for **Bhojpuri** and **Magahi** has been broken; both now use unique 183-anchored mixes while still reflecting a Hindi-centered palette (see §2.9).
- **Semitic / Ethiopic:** The Amharic/Ethiopic `[133]` duplication between `amh` and `amharic` has been resolved so that `amh` is the canonical pure-133 entry and `amharic` uses `[2,133,140]` instead of sharing `[133]` (see §2.4).
- **English-based pidgins & creoles:** English base `1` is now kept as a pure `[1]` anchor for `eng`, while key English-based contact varieties (e.g. `american-indian-pidgin-english`, `anguillian-creole`, `bislama`, `pijin`) use distinct 1-anchored mixes that incorporate appropriate regional bases.
- **English-based Pacific creole macros (local helper):** regional macros and neighbors (`australian-kriol`, `melanesian-pidgin`, `torres-strait-creole`, `pitcairn-norfolk`, `english-based-pacific-creoles-family`, `manglish`) now have distinct English-anchored `[bases]` mixes instead of pure `[1]` / `[309]` signatures, reducing the residual English-based Pacific macro cluster around the English hub.
- **SE Asia base-29 (Vietic/Bahnaric + neighbors):** The large pure-`[29]` Vietic/Bahnaric cluster and its mixed offshoots have been de-clustered so that `vie` is the sole pure-29 entry and all other base-29 users have unique 29-anchored mixes, even when they cross families (Vietic, Bahnaric, Monic, Khmeric, Austroasiatic, and Munda; see §2.7 and §2.12).
- **Algic / Yeniseian / Canadian Romance tail (base 19, Worker‑9):** the former `[19]` pair `arin` / `brayon` has been split so that `arin` now uses a Yeniseian multi-base `[19,31,275]` and `brayon` now rides on an English/French‑anchored Canadian mix `[1,2,272]` instead of sharing `[19]`.
- **Algic / Basque contact (Worker‑9):** the former `[186,187]` cluster has been split by giving `yurok` an Algic–Salish mix `[187,222]` and remapping `algonquian-basque-pidgin` to `[20,186]` so that Basque `eus` remains a pure `[20]` isolate while the pidgin carries both Basque and Algonquian flavor.
- **SE Asia 29/Bahnaric follow-up micro-batch (post `/languages-unique6`):** extended the SE Asia base‑29 cleanup by de-clustering the remaining Bahnaric tail so that **Halang** (`halang-bahnaric`) now uses `[29,193,251,367]` and **Kaco'** (`kaco-bahnaric`) now uses `[29,194,251,367]`, leaving `mnw`, `duan-bahnaric`, `jeh-bahnaric`, `jru-bahnaric`, and `juk-bahnaric` on distinct 29‑anchored mixes and eliminating the last `[29,193,251]` / `[29,194,195,251]` duplicates in that cluster.

Takeaway:

- The high-level rule from [Races & Languages – System Rules §1.3](Races-Languages-Rules.md#13-language-base-uniqueness-intent) is now being enforced family-by-family: shared `[bases]` arrays are treated as **per-language uniqueness debt** and worked down via targeted cluster passes.
- Future passes should continue this workflow: run cluster reports, pick the largest remaining cluster, design per-language mixes consistent with family and region, and re-profile with the mixer QA tools.

---
Representative bases / mappings (via `profile-language-mixes.js` and `report-language-mixer-base-clusters.js`):

- **Hausa / Chadic cluster (base 132 as anchor)**:
  - Earlier diagnostics showed many Chadic entries (e.g. Angas, Biu-Mandara, Bade, Masa, and West Chadic macros) all riding on a single `[132]` key.
  - Recent passes have remapped dozens of these languages to **globally unique base sets** of the form `[132, X, Y]`, where `X`/`Y` are neighboring African bases such as Yoruba **112**, Igbo **113**, Fula **114**, Ewe **120**, Akan **116**, Lingala **146**, Kinyarwanda **147**, Shona **148**, Zulu **149**, Sesotho **151**, Tswana **152**, Kongo **153**, Luganda **154**, Chichewa **155**, and Kikuyu **156**.
  - New mappings were also added for previously unmapped or partially mapped Chadic entries so they participate in the same per-language uniqueness guarantees.
  - **2025‑12‑11 micro-pass (Barikanchi / Masa):** `barikanchi-pidgin` now uses `[1,112,132,277]`, an English–West African Sahel mix over **English (1)**, **Yoruba (112)**, **Hausa (132)**, and **Zarma Songhay (277)** instead of pure `[132]`, while `masa-chadic` now uses `[132,277,297]`, a Chadic–Sahel–Sango blend tying **Hausa (132)** into the **Zarma Songhay (277)** and **Sango (297)** corridor.
  - **2025‑12‑11 micro-pass (Masa North/South):** `masa-north` and `masa-south` now use `[112,132,297]` and `[132,146,277]` respectively instead of pure `[132]`, giving each dialect its own Hausa-anchored mix while `hausa` and other 132-based anchors remain untouched.
  - **2025‑12‑11 micro-pass (Masmaje / Massa):** `masmaje-language` now uses `[120,132,155]` (Ewe + Hausa + Chichewa) and `massa-chadic` uses `[112,120,132,149]` (Yoruba + Ewe + Hausa + Zulu) instead of pure `[132]`, further shrinking the pure-`[132]` Hausa/Chadic macro-cluster.

- **Pan-African 112–156 blob cleanup**:
  - A broader sweep over West / Central / Southern African entries that previously shared short or identical `[112–156]` combinations now assigns **distinct multi-base signatures** anchored on realistic regional mixes (West African 112–120 plus Bantu 146–156).
  - Swahili **28** is now used primarily as a **trade / lexifier ingredient** rather than a default shared base for unrelated African lects, building on the Bantu split in §2.8.

Takeaway:

- The earlier **Hausa / Chadic base-132 cluster** and much of the ad-hoc **112–156 Pan-African blob** have been converted into **per-language unique base or mix signatures**, while staying within historically plausible African anchors.
- Remaining Sub-Saharan uniqueness debt is now concentrated in smaller Atlantic–Congo and Cushitic pockets and in languages that still ride on Swahili 28 or other macro lexifiers; those are surfaced by the mixer diagnostics and are candidates for future passes.

---

  ### 3.1 High-degree lexifiers in `language-mixer-map`

Based on `check-language-mixer-map-inconsistencies` runs, the following bases show up across many families/regions:

- **Malay (195)**
  - Used across a large swath of **Austronesian + Papuan contact zones** (Alor–Pantar, Greater Awyu, Asmat–Kamoro, etc.).
  - Acts as a general **Malay / trade-lexifier hub**.
- **Tok Pisin (263)**
  - Shared across numerous **Papuan** families as a contact lingua franca; it can be a plausible **ingredient** in mixes, but identical shared `bases[]` arrays are treated as uniqueness debt.
- **English (1)**
  - Reused for many **English-based pidgins and creoles** (Caribbean, Africa, Pacific); a first cleanup pass has already split several (`american-indian-pidgin-english`, `anguillian-creole`, `bislama`, `pijin`) onto unique 1-anchored mixes, but many other English-based entries still represent outstanding uniqueness debt.
- **French (2)** and **Portuguese (13)**
  - Similarly reused for French-/Portuguese-based creoles.
- **Tamil (199)**, **Telugu (200)**, **Bengali (201)**, **Assamese (257)**
  - Multiple Indo-Aryan / Dravidian clusters share these; some of the worst offenders (e.g. South Dravidian `[255]` tail and the Hindi-adjacent `[183,201]` cluster) have been split in recent passes, but substantial uniqueness debt remains (see §2.9).
- **Other hubs** seen in the sweeps: **Swahili (28)**, **Thai (251)**, **Lao (252)**, **Maori (196)**, **Samoan (197)**, **Fijian (198)**, **Sranan (291)**, **Greenlandic (305)**, **Neapolitan (306)**, **Occitan (232)**, **Sardinian (233)**, **Northern Sami (274)**, **Ainu (275)**, **Buryat (276)**, **Kalmyk (296)**, **Zarma (277)**, **Udmurt (283)**, etc.

Current stance:
- Many of these are **historically plausible lexifiers or macro-family seed anchors**, in the sense that they are reasonable seeds.
- However, under the per-language uniqueness rule, any language that still *shares* an identical lexifier base or `[bases]` array with others is carrying **uniqueness debt**. These hubs must be revisited and split until each dependent language has its own base or mix signature, with lexifiers kept only as ingredients rather than sole or fully shared bases.

### 3.2 Single-base macro-families

- **Uralic (base 9)**
  - Single Finnic/Uralic base covers Finnish, Karelian, Veps, multiple Sámi dialects, and more.
  - Under the stricter policy, any identical shared `[9]` base-set clusters are treated as **uniqueness debt** to be split into unique Uralic-appropriate mixes (or new bases). Reuse of 9 as an *ingredient* in otherwise unique mixes is fine; identical `[9]` signatures across multiple distinct languages are not.
- **Central Semitic (bases 18, 23, 42)**
  - Arabic / Mesopotamian / Levantine bases currently underpin many historical and modern Semitic ISOs and act as shared anchors.
  - Afroasiatic Worker-3 passes have already split most of those ISOs onto distinct `[bases]` mixes; the remaining handful of identical arrays (core standards and macro entries) are still treated as explicit **uniqueness debt** to be resolved in a later, more opinionated Semitic/Ethiopic tuning pass.
- **Romance dialect continuum**
  - Many Romance dialects (regional Spanish, Portuguese, French, Italian varieties, etc.) initially all mapped back to one of a few central bases; the multi-batch Worker-3 pass has already carved out unique `[bases]` for most of these mapped entries.
  - A small remainder of shared-base clusters (notably around bases 3, 13, 22, 43, and 44) is still tracked as uniqueness debt and should be cleared in a targeted Romance follow-up so that no two mapped Romance entries share an identical base or `[bases]` array.

As of the 2025‑12‑10 `/languages-unique*` passes (Workers 1–10, including Worker 7), most base-set clusters surfaced by `report-language-mixer-base-clusters.js` and `select-language-mixer-base-batch.js` have been de‑clustered; any remaining identical shared base-set clusters are treated as uniqueness debt under the stricter policy. New clusters will arise only as new languages are wired or existing mappings are changed.

---

## 4. Work not yet done / future passes

The following families / regions have **not yet received a full pass** for home-range, duplication, and mixer-map sanity. They almost certainly hide more “too generic” or “too shared” behavior.

- **Slavic & East European cluster**
  - Mapping and core bases have received a first pass (see **2.6**) and all Slavic entries now have globally unique `[bases]` arrays, but East Slavic splits, Sorbian, and border lects (Podlachian / West Polesian) still need refinement of `min/max/d` and/or dedicated bases as a follow-up quality/coverage pass.
- **South Asian (Indo-Aryan, Dravidian, related)**
  - Key Indo-Aryan and Dravidian standards now have documented bases and initial length checks (see **2.9**), but many Dravidian lects still sit on a handful of macro-family hubs (199/200/254/255) and Hindi/Bengali/Marathi/Punjabi and related creoles still need dedicated review.
- **Sub-Saharan Africa (Bantu, Atlantic–Congo, Cushitic, Chadic, etc.)**
  - Most bases exist but have not been systematically profiled for script, duplication, or length bands.
  - **East Asia (Sinitic, Japanese, Korean, Mongolic, and neighbors)**
  - Core Sinitic / Japonic / Koreanic standards (Mandarin, Japanese, Korean, Vietnamese, Cantonese) now have dedicated passes and cleaned mixer mappings, but **Mongolic and many smaller regional lects** have not yet been fully profiled for uniqueness, base choice, and length bands.
- **Americas beyond Nahuatl / Quechua / Aymara / Cherokee**
  - Many North and South American families still use “first-draft” bases.
- **Papuan & Austronesian beyond Malay / Tok Pisin / core oceanic Lexifiers**
  - Still a rich area for future passes: the second-pass work in §2.12, subsequent Worker-3/8/9 collision cleanups, and a targeted diagnostics sweep over Malay 195 / Tok Pisin 263 / Pacific 197–198 hubs have already moved many Papuan and Eastern Indonesian macros off pure Malay/Tok Pisin/197–198 hubs and onto regional bases with unique mixes and confirmed there are currently no remaining Papuan/Austronesian shared `[bases]` clusters; the remaining work here is deeper quality/coverage tuning so that long-tail Papuan and Pacific Austronesian families are fully profiled for home-range, base choice, and per-language uniqueness.

---

## 5. Planned next steps when resuming

When this work resumes, a practical order of operations:

1. **Lock in use-case length bands**
   - For each `Names.*` call site (burgs, states, cultures, map names, religions, markers), define bands:
     - Map / world names: slightly longer than base means.
     - Capitals vs towns / villages: tuned around base medians with size-based offsets.
     - Cultures / peoples: mid-length, avoiding extreme tails.
     - Religions / deities: allowed to run slightly long for grandeur.
   - Implement via **central constants or helpers** rather than ad-hoc numbers.
   - ✅ **Implementation status (2025-12-11):** `modules/names-generator.js` now exposes `Names.getUseCaseRange(base, useCase)`, and the main generation paths for towns, states, capitals, rivers, deities/religions, and random labels (including the Labels Editor’s state / generic label generator) all route through this helper instead of hard-coded `min/max` ranges. Remaining direct `Names.getCulture` calls without a use-case range are either legacy or intentionally generic (e.g. quick burg renames) and can be audited later if stricter banding is desired.

2. **Family-by-family passes using the tools**
   - For each macro-family or region:
     - Run `profile-language-mixes.js` focused on that family/region.
     - Run `check-language-mixer-map-inconsistencies.js --family=...` and/or `--region=...`.
     - Use `check-namebase-lengths.js` to verify `min/max` vs seeds.
   - Adjust per-base `min/max` and, where necessary, `d`.

3. **Tackle known hubs explicitly**
   - Decide, per hub base (e.g. Malay 195, Tok Pisin 263, English 1, French 2, Portuguese 13, etc.), whether it is:
     - a plausible **seed anchor / lexifier ingredient** to keep as one component in mixes, or
     - an over-broad base that should be **split** (new bases + remaps) so that each dependent language can reach a globally unique `bases[]` signature without borrowing unrelated flavor.

4. **Add or split bases where contrast is weak**
   - Where one base is covering too many stylistically distinct languages, consider:
     - Adding a new base seeded from a more local set of city names.
     - Remapping a subset of ISOs to that new base in `language-mixer-map.json`.

5. **Finalize documentation**
   - Once more families are tuned, extend this document with:
     - A short **per-family summary** (status, key bases, known hubs).
     - A clear list of **seed anchors/lexifiers used as ingredients** vs areas of remaining uniqueness debt.
   - **Recommended workflow:** For each family or region, perform a **family-by-family uniqueness pass** using `/language-uniqueness` and `/languages-unique2–10` to identify and split shared-base clusters, followed by **targeted cluster cleanup** via `/decluster-language-bases` to address any remaining uniqueness debt.

6. **Grow coverage via Wikipedia language lists**
   - Use the registry in §8 as the single source of truth for which Wikipedia-derived list JSONs exist, how to re-run `report-wikipedia-list-coverage.js` / `update-wikipedia-list-coverage-in-devplan.js`, and what "fully represented" means.
   - When creating or extending a regional list JSON, update it, re-run coverage, and refresh the corresponding §8.x snapshot so future passes know exactly which lists are fully wired.
   - Treat each new language with the same per-language rigor (seed curation, base choice, `min/max/d` tuning, and mixer-map QA); avoid bulk-adding large blocks of languages onto a single hub base without review.

---

## 6. Quick checklist for whoever picks this up

- [ ] Re-run `check-namebase-lengths.js` to ensure `Names.getBase` sandbox behavior is still correct.
- [ ] For your target family/region, run:
  - [ ] `node tools/profile-language-mixes.js --family=...` (or `--region=...`).
  - [ ] `node tools/check-language-mixer-map-inconsistencies.js --family=...`.
- [ ] Decide **per base**:
  - [ ] Are `min/max` aligned with seed p25–p75?
  - [ ] Does `d` allow appropriate geminates without over-duplication?
  - [ ] Is this base overused across unrelated ISOs?
- [ ] Apply changes incrementally (one family / region per commit) and reprofile.

This file should be updated as major families are completed so it remains the single entry point for the language system’s overall status.

---

## 7. Planned tooling extensions (Markov, similarity, and UX helpers)

These are higher-level tools and helpers that sit on top of the existing Markov bases / mixer and are intended to make language work faster, safer, and more consistent across the app. Map- and simulation-side nearest-neighbor uses (e.g. smoothing helpers, label-density suggestions) are documented separately in [Evolving Simulation – Design Choices §3](Evolving-Simulation-Choices.md#3-culture--religion-diffusion).

### 7.1 Language similarity search (k-NN on language features)

**Goal:** Quickly suggest plausible base languages or related mixes when adding or reviewing ISO entries, and surface "nearby" languages for design and debugging.

**Scope / behavior:**

- Build a simple feature vector for each language / mix, drawing from:
  - Family, subfamily, region, script, and tags already in `language-mixes.json`.
  - Basic phonotactic stats (if available): character / bigram frequencies, syllable shapes, length distribution summary.
- Provide a small helper API / CLI, e.g. `getNearestLanguages(iso, k=10)`.
- Use it in tooling first (Node scripts under `tools/`) before any in-UI use:
  - Suggest base(s) when a new ISO is missing `bases` in `language-mixer-map.json`.
  - Help spot suspicious mappings by listing "nearest neighbors" that use very different bases.

**Implementation sketch:**

- Reuse `profile-language-mixes.js` logic to emit a JSON snapshot of language features.
- Implement a tiny k-NN helper (brute force is fine at current scales) that:
  - Normalizes categorical features (e.g. big bonus for same family, smaller bonus for same region).
  - Optionally blends in numeric stats (length means / stddevs) when those are available.
- Keep the first version deterministic and transparent; log intermediate scores for debugging.

**Open questions / risks:**

- Definition of "similar" is fuzzy (historical vs phonetic vs aesthetic); we should document which notion the distance is actually approximating.
- Feature extraction costs need to stay low enough that running this on every tuning pass is cheap.
- Should not auto-edit configs; only propose suggestions that a human accepts or rejects.

### 7.2 Markov on languages / names from user-supplied samples

**Goal:** Allow users (and future internal tooling) to spin up a custom name style from a short list of examples and optionally map that style back onto existing bases.

**Scope / behavior:**

- Provide a way (via an in-app editor and/or CLI tool) to:
  - Paste a list of names.
  - Train a small per-session Markov chain on those names.
  - Preview a batch of generated samples for QA.
- Optionally, compare the resulting Markov stats to the existing base library using the similarity helper to suggest likely underlying base(s) for permanent wiring.
- Persist only when explicitly requested into a new base entry and/or a new ISO mapping; otherwise treat as an ephemeral generator.

**Implementation sketch:**

- Wrap existing `Names` / Markov logic in a helper that can build a temporary chain from a raw list of strings.
- Enforce simple safety checks:
  - Minimum number of samples before training (e.g. 20+).
  - Length / character sanity bounds to avoid pathological chains.
- Provide a text-based preview tool under `tools/` and later a thin UI on top of the existing language editor.

**Open questions / risks:**

- Overfitting tiny or low-quality sample lists; mitigated via minimum N and clear preview tooling.
- Deciding when a user-defined style should become a first-class base vs stay as local flavor.
- Avoiding drift from the historical/typological intent of existing bases when we remap ISOs to new custom styles.

### 7.3 Multi-word Markov: compound names, phrases, and titles

**Goal:** Extend the language system beyond single tokens into short phrases (dynasties, titles, compound toponyms) while keeping structure readable and controllable.

**Scope / behavior:**

- Focus first on structured patterns where we already have clear slots:
  - City names with descriptors ("New X", "X-on-the-Y").
  - Realm / dynasty / house names.
  - Simple religious / cult names.
- Use Markov primarily at the **morpheme or stem level**, with templates providing the overall shape.

**Implementation sketch:**

- Add small per-family template banks (e.g. `{Title} {Name}`, `{Name} of {Region}`) in config.
- For each slot that needs a free-form stem, call into `Names` / mixer to generate a culturally appropriate base form.
- Optionally introduce a separate, lighter-weight Markov layer over morpheme lists (prefixes / suffixes) where that adds value.

**Open questions / risks:**

- Pure word-level Markov risks producing ungrammatical or awkward phrases; we should bias heavily toward template-driven generation.
- Needs UX decisions about where these phrases surface (e.g. new map naming options, dynasty generator tools, etc.).

### 7.4 UX helpers driven by nearest neighbors

**Goal:** Use local and global neighbor information to make map editing smoother without changing core simulation logic.

**Scope / behavior (initial targets):**

- **Label density suggester:**
  - Analyze current map (burg count, area, zoom behavior, chosen style) and propose a default label density / size profile.
  - Reuse a small set of hand-tuned presets and choose between them by nearest-neighbor on map statistics.
- **Neighbor-aware brush smoothing:**
  - When applying culture/biome/etc. brushes, look at the N neighboring cells and gently steer new values toward local consensus.
  - Present as an opt-in mode (e.g. "Smooth to neighbors" toggle) rather than always-on behavior.

**Implementation sketch:**

- Define a compact "map feature vector" (land fraction, number of burgs, climate band distribution, average culture count, etc.) and use the same k-NN helper pattern as for languages to pick presets.
- For brushes, reuse the existing cell adjacency graph and perform a cheap majority/weighted-average pass over immediate neighbors to compute a target value.

**Open questions / risks:**

- Needs careful UX so that helpers feel like suggestions, not fights against direct user control.
- Smoothing must be conservative by default to avoid erasing deliberate high-contrast edits.

---

## 8. Wikipedia language list coverage registry

This section tracks the Wikipedia-derived language lists that drive language catalog and mixer coverage. For each list we record its JSON path, source URL, what part of the system it informs, and how to re-run the coverage / base-uniqueness helpers. The registry also notes **planned** list JSONs so regional coverage goals stay visible before the corresponding files exist.

Coverage numbers are refreshed by `tools/mixer-core/update-wikipedia-list-coverage-in-devplan.js`; do **not** hand-edit the per-list `Snapshot from last run` blocks.

Important distinction:

- The snapshot’s `fully wired` count is a **coverage** metric only: an item is counted as `fully wired` when it exists in both `config/language-mixes.json` and `config/language-mixer-map.json`.
- The project goal of a list being **fully represented** is stricter: coverage **plus** globally unique `bases[]` (base-uniqueness) **plus** race reachability.

Per-list base-uniqueness can be summarized via `tools/mixer-core/report-wikipedia-list-base-uniqueness.js` (and the `Nonunique Bases` metric written into the snapshot block). Per-list race reachability can be checked via `tools/mixer-races/report-wikipedia-list-race-coverage.js`. See [§5.6 Grow coverage via Wikipedia language lists](#5-planned-next-steps-when-resuming) for the precise definition of "fully represented".

In this project, coverage for a list JSON is computed over **all** in-scope items; `skip: true` is reserved for global exceptions such as sign languages and truly unreconstructible extinct entries, which are excluded from coverage percentages. Base-uniqueness and race-coverage status are enforced via the global mixer and race tools described elsewhere in this document (including the base-cluster diagnostics and the per-list base-uniqueness helper) rather than being repeated per list in §8. Snapshot blocks may optionally include `unique bases` / `clustered bases` counts from `report-wikipedia-list-base-uniqueness.js` and/or a `Nonunique Bases` line produced by the coverage helpers (`report-wikipedia-list-coverage.js` / `update-wikipedia-list-coverage-in-devplan.js`), alongside the existing wiring legend.

### 8.1 Languages of Africa – major languages subset

- **JSON file:** `tools/mixer-meta/wikipedia-languages-of-africa-major.json`
- **Title:** `Wikipedia: Languages of Africa – major languages subset`
- **Source:** <https://en.wikipedia.org/wiki/Languages_of_Africa>
- **Scope:** Hand-picked major African languages from the "Languages of Africa" article; focuses on high-impact Afroasiatic and Niger–Congo languages.
- **Primary families / regions touched:** Sub-Saharan Africa (Bantu, Atlantic–Congo, Cushitic, Chadic) and Afroasiatic macro entries; see [§2.8 Sub-Saharan Africa (first Bantu split)](#28-sub-saharan-africa-first-bantu-split) and related African notes.
- **Extended long-tail driver:** `tools/mixer-catalog/add-african-languages.js` contains an `AFRICA_ROWS` array derived from the long `Language / Family / speakers / status` table in the same Wikipedia article. It backfills any of those rows that are missing from `config/language-mixes.json`, inferring `category` / `family` / `region` from the Wikipedia family column.

- **Coverage tracking:** this subset is a **view over the full Languages-of-Africa table**, not an independent driver. All coverage status and wiring/uniqueness metrics for these languages are tracked via the full-table JSON in §8.1b (`wikipedia-languages-of-africa-full.json`); we no longer maintain a separate 33-item coverage snapshot for this subset.

### 8.1b Languages of Africa – full table snapshot (AFRICA_ROWS)

- **JSON file:** `tools/mixer-meta/wikipedia-languages-of-africa-full.json`
- **Title:** `Wikipedia: Languages of Africa – full table snapshot`
- **Source:** <https://en.wikipedia.org/wiki/Languages_of_Africa>
- **Scope:** Full language-level snapshot of the long `Language / Family / speakers / status` table in the "Languages of Africa" article. Every row from that table is encoded once in this JSON via its Wikipedia name, using the same `AFRICA_ROWS` source data that drives `add-african-languages.js`.
- **Primary families / regions touched:** All African families represented in the table (Niger–Congo, Afroasiatic, Nilo-Saharan, Mande, Ubangian, Khoe–Kwadi, Kx'a, Tuu, etc.) across the whole continent; this is the canonical **"all languages on the Languages-of-Africa list"** coverage driver.

- **How to re-run coverage:**
  - `node tools/mixer-core/report-wikipedia-list-coverage.js tools/mixer-meta/wikipedia-languages-of-africa-full.json`

- **Status tier:** **In progress (full table)** – this JSON tracks **every language row** from the Wikipedia table; coverage and base-uniqueness snapshots for this full list should be refreshed after each major African mixer pass.
- **Last run:** 2025-12-12

- **Snapshot from last run (all list items):**
  - `fully wired:` 277
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 0
  - `Nonunique Bases:` 274
  - `clustered bases:` 0
  - `zeroRaceCount:` 0

- **Notes / next steps:**
  - Treat this JSON as the authoritative representation of the entire `Languages of Africa` table: any additions or removals in the Wikipedia article should be mirrored into `AFRICA_ROWS` (via `add-african-languages.js`) and then into this JSON via the generator, so the full-table coverage report stays 1:1 with the article.
  - Use the **major-languages subset** in §8.1 as a compact checklist for headline African standards, but rely on this full-table snapshot when you want to reason about coverage and uniqueness for **all** languages listed in the article, not just the big ones.

### 8.2 List of languages by number of native speakers (seed subset)

- **JSON file:** `tools/mixer-meta/wikipedia-list-languages-by-native-speakers.json`
- **Title:** `Wikipedia: List of languages by number of native speakers (seed subset)`
- **Source:** <https://en.wikipedia.org/wiki/List_of_languages_by_number_of_native_speakers>
- **Scope:** A curated subset of high-speaker languages from the global "List of languages by number of native speakers" article, used as a headline driver for worldwide coverage.
- **Primary families / regions touched:** Global macro-families (Indo-European, Sinitic, Japonic, Koreanic, Afroasiatic, Dravidian, Austronesian, etc.); ties into multiple summaries in [§2 Families / bases already reviewed](#2-families--bases-already-reviewed).

- **How to re-run coverage:**
  - `node tools/mixer-core/report-wikipedia-list-coverage.js tools/mixer-meta/wikipedia-list-languages-by-native-speakers.json`

- **Status tier:** **In progress (full article)**
- **Last run:** 2025-12-10

- **Snapshot from last run (all list items):**
  - `fully wired:` 176
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 0
  - `Nonunique Bases:` 168

- **Notes / next steps:**
  - Treat this subset as the primary checklist for headline global coverage; when expanding the JSON with additional rows from the Wikipedia table, re-run coverage and base-uniqueness, then refresh the snapshot here.
  - As of the latest run, all 173 list items are fully wired (catalog + mixer-map); any remaining shared `bases[]` signatures among distinct non-skipped items are treated as remaining uniqueness debt for a future micro-pass.
  - 2025-12-11 micro-pass: refactored the native-speakers helper to use canonical ISOs (e.g., `swe`, `ilocano`) and repaired the list after an accidental Cebuano displacement; catalog ISO duplicates are now cleared via unique alias/subset ISO codes, leaving only normalized-name clusters as remaining diagnostic output.

### 8.3 List of languages by number of native speakers – CIA World Factbook 2018 subset

- **JSON file:** `tools/mixer-meta/wikipedia-list-languages-by-native-speakers-cia-2018.json`
- **Title:** `Wikipedia: List of languages by number of native speakers – CIA World Factbook 2018 subset`
- **Source:** <https://en.wikipedia.org/wiki/List_of_languages_by_number_of_native_speakers>
- **Scope:** Alternate subset of the same Wikipedia article, reflecting the CIA World Factbook 2018 numbers; used as an additional cross-check on coverage for key global languages.
- **Primary families / regions touched:** Overlaps heavily with §8.2 but may differ in language ordering and a few inclusions; again spans multiple macro-families.

- **How to re-run coverage:**
  - `node tools/mixer-core/report-wikipedia-list-coverage.js tools/mixer-meta/wikipedia-list-languages-by-native-speakers-cia-2018.json`

- **Status tier:** **In progress (full article)**
- **Last run:** 2025-12-10

- **Snapshot from last run (all list items):**
  - `fully wired:` 11
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 0
  - `Nonunique Bases:` 11

- **Notes / next steps:**
  - Use as a sanity check against the seed subset in §8.2; discrepancies or additional languages here can signal further work needed.
  - As with other lists, explicitly note any remaining unwired languages or planned JSON expansions so that "fully represented" status remains well defined.

### 8.4 Languages of South Asia – regional subset

- **JSON file:** `tools/mixer-meta/wikipedia-languages-of-south-asia.json`
- **Title:** `Wikipedia: Languages of South Asia – regional subset`
- **Source:** <https://en.wikipedia.org/wiki/Languages_of_South_Asia>
- **Scope:** Regional overview of major languages and families across South Asia (Indo-Aryan, Dravidian, Iranian, Nuristani, Tibeto-Burman, etc.).
- **Primary families / regions touched:** South Asia (Indo-Aryan, Dravidian, and neighbors); see [§2.9 South Asia (Indo-Aryan / Dravidian)](#29-south-asia-indo-aryan--dravidian) and the South Asia items in §4.

- ✅ **Status tier:** **Complete**
- **Last run:** 2025-12-10

- **Snapshot from last run (all list items):**
  - `fully wired:` 18
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 0
  - `Nonunique Bases:` 16

- **How to re-run coverage:**
  - `node tools/mixer-core/report-wikipedia-list-coverage.js tools/mixer-meta/wikipedia-languages-of-south-asia.json`

- **Notes / next steps:**
  - Use this list as a driver for Indo-Aryan / Dravidian completeness checks in South Asia and to highlight any further missing catalog or mixer entries.

### 8.5 Indigenous languages of the Americas – macro-family subset

- **JSON file:** `tools/mixer-meta/wikipedia-indigenous-languages-of-the-americas.json`
- **Title:** `Wikipedia: Indigenous languages of the Americas – macro-family subset`
- **Source:** <https://en.wikipedia.org/wiki/Indigenous_languages_of_the_Americas>
- **Scope:** High-level representation of major indigenous language families and isolates across North, Central, and South America (e.g. Algic, Na-Dene, Uto-Aztecan, Quechuan, Arawakan/Tupi–Guarani).
- **Primary families / regions touched:** Americas (indigenous & contact zones); see [§2.11 Americas (indigenous & contact zones)](#211-americas-indigenous--contact-zones).
  - Treat this list as a compact checklist for key indigenous families (Nahuatl, Quechua, Guarani, Aymara, Mapudungun, Tikuna, Na-Dene macros, Salishan, Wayuu, Cherokee, etc.).
  - When adding new indigenous languages or families, consider expanding this JSON and re-running coverage to ensure each new item has both catalog and mixer entries.

- **Snapshot from last run (all list items):**
  - `fully wired:` 154
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 89
  - `ambiguous:` 0
  - `Nonunique Bases:` 235

- **How to re-run coverage:**
  - `node tools/mixer-core/report-wikipedia-list-coverage.js tools/mixer-meta/wikipedia-indigenous-languages-of-the-americas.json`

### 8.6 Languages of Oceania – Papuan & Pacific subset

- **JSON file:** `tools/mixer-meta/wikipedia-languages-of-oceania.json`
- **Title:** `Wikipedia: Languages of Oceania – Papuan & Pacific subset`
- **Source:** <https://en.wikipedia.org/wiki/Languages_of_Oceania>
- **Scope:** Overview of Papuan and Austronesian languages across Melanesia, Micronesia, and Polynesia, including Trans–New Guinea and Oceanic branches.
- **Primary families / regions touched:** Papuan & Pacific Austronesian region; see [§2.12 Papuan & Pacific Austronesian (second-pass)](#212-papuan--pacific-austronesian-second-pass).

- ✅ **Status tier:** **Complete**
- **Last run:** 2025-12-10

- **Snapshot from last run (all list items):**
  - `fully wired:` 23
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 0
  - `Nonunique Bases:` 22

- **How to re-run coverage:**
  - `node tools/mixer-core/report-wikipedia-list-coverage.js tools/mixer-meta/wikipedia-languages-of-oceania.json`

- **Notes / next steps:**
  - Use this list as a driver for further Papuan and Oceanic coverage beyond the current macro bases (360–371) and lexifier hubs.
  - When the JSON is expanded or refined, run coverage again to confirm that all new Papuan/Oceanic items have both catalog and mixer entries.

### 8.7 Languages of Europe – full table snapshot

- **JSON file:** `tools/mixer-meta/wikipedia-languages-of-europe.json`
- **Title:** `Wikipedia: Languages of Europe – full table snapshot`
- **Source:** <https://en.wikipedia.org/wiki/Languages_of_Europe>
- **Scope:** Overview of major language families and key standard languages across Europe (Romance, Germanic, Slavic, Celtic, Hellenic/Greek, Albanian, Armenian, Baltic, Uralic, Basque, and others).
- **Primary families / regions touched:** European families documented in [§2 Families / bases already reviewed](#2-families--bases-already-reviewed) (Romance, Germanic, Slavic & East European cluster, Celtic branches, Uralic entries, etc.).

- **Status tier:** **In progress (full table snapshot)**
- **Last run:** 2025-12-10

- **Snapshot from last run (all list items):**
  - `fully wired:` 168
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 0
  - `Nonunique Bases:` 157

- **How to re-run coverage:**
  - `node tools/mixer-core/report-wikipedia-list-coverage.js tools/mixer-meta/wikipedia-languages-of-europe.json`

- **Notes / next steps:**
  - When extending or revisiting European families, update the JSON subset from the article above and re-run coverage.
  - Use coverage reports to cross-check that each major European standard language has both catalog and mixer entries and that coverage is balanced across Western, Central, Northern, and Eastern Europe.

### 8.8 Languages of West Asia – regional subset

- **JSON file:** `tools/mixer-meta/wikipedia-languages-of-west-asia.json`
- **Title:** `Wikipedia: Languages of West Asia – regional subset`
- **Source:** <https://en.wikipedia.org/wiki/West_Asia>
- **Scope:** Overview of major language families and key languages across West Asia (Anatolia, the Levant, Mesopotamia, the Arabian Peninsula, the Caucasus, and Iran), including Semitic, Iranian, Turkic, Kartvelian, Armenian, and related branches.
- **Primary families / regions touched:** West Asian families and neighbors documented in [§2 Families / bases already reviewed](#2-families--bases-already-reviewed), including Central Semitic, Iranian, Caucasian, and adjacent Indo-European and Turkic clusters.

- ✅ **Status tier:** **Complete**
- **Last run:** 2025-12-10

- **Snapshot from last run (all list items):**
  - `fully wired:` 14
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 0
  - `Nonunique Bases:` 14

- **How to re-run coverage:**
  - `node tools/mixer-core/report-wikipedia-list-coverage.js tools/mixer-meta/wikipedia-languages-of-west-asia.json`

- **Notes / next steps:**
  - When focusing on West Asian families, you can refine or expand this JSON subset and re-run coverage.
  - Use coverage reports to highlight any new gaps in Semitic, Iranian, Caucasian, and Turkic clusters, especially where languages are still riding shared macro hubs or lack mixer mappings.

### 8.9 Languages of North America – regional subset

- **JSON file:** `tools/mixer-meta/wikipedia-languages-of-north-america.json`
- **Title:** `Wikipedia: Languages of North America`
- **Source:** <https://en.wikipedia.org/wiki/Languages_of_North_America>
- **Scope:** Regional overview of major languages and families across North America (English, Spanish, French, Na-Dene / Athabaskan, Algonquian, Eskimo–Aleut, etc.), with a focus on representative standards and macro entries.
- **Primary families / regions touched:** North American indigenous & contact zones; ties into [§2.11 Americas (indigenous & contact zones)](#211-americas-indigenous--contact-zones) and the Na-Dene / Algonquian / Eskimo–Aleut notes there.

- ✅ **Status tier:** **Complete**
- **Last run:** 2025-12-10

- **Snapshot from last run (all list items):**
  - `fully wired:` 12
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 0
  - `Nonunique Bases:` 11

- **How to re-run coverage:**
  - `node tools/mixer-core/report-wikipedia-list-coverage.js tools/mixer-meta/wikipedia-languages-of-north-america.json`

- **Notes / next steps:**
  - Treat this list as a compact checklist for North American standards and macro entries (English, Spanish, French, Navajo, Cree, Ojibwe, Cherokee, Aleut, Yupik, Inuit, Athabaskan, Apache).
  - When adding new North American languages or refining Na-Dene / Athabaskan coverage, consider expanding this JSON and re-running coverage so each new entry has both catalog and mixer mappings.

### 8.10 Languages of Southeast Asia – regional subset

- **JSON file:** `tools/mixer-meta/wikipedia-languages-of-southeast-asia.json`

### 8.11 Languages of Asia – official languages table

- **JSON file:** `tools/mixer-meta/wikipedia-languages-of-asia-official-languages.json`
- **Title:** `Wikipedia: Languages of Asia – official languages table`
- **Source:** <https://en.wikipedia.org/wiki/Languages_of_Asia>
- **Scope:** Snapshot of the country-level official-languages table from the "Languages of Asia" article. Each distinct official or co-official language name in the table appears once in this JSON as a checklist entry, without attempting to re-encode per-country status.
- **Primary families / regions touched:** Pan-Asian macro coverage (Indo-European, Afroasiatic, Turkic, Dravidian, Sino-Tibetan, Austroasiatic, Austronesian, Koreanic, Japonic, etc.), overlapping with the global speaker-count lists (§8.2–§8.3) and the South Asia / East Asia mixer work in §2.7 and §2.9.

- **How to re-run coverage:**
  - `node tools/mixer-core/report-wikipedia-list-coverage.js tools/mixer-meta/wikipedia-languages-of-asia-official-languages.json`

- **Status tier:** **In progress (full table)** – this JSON tracks every language row from the Asia official-languages table; coverage snapshots should be refreshed after each major Asia mixer pass.

### 8.12 East Asian languages – classification proposals (macro helper)

- **JSON file:** `tools/mixer-meta/wikipedia-east-asian-languages-classifications.json`
- **Title:** `Wikipedia: East Asian languages – classification proposals`
- **Source:** <https://en.wikipedia.org/wiki/East_Asian_languages>
- **Scope:** Macro-family and proposal-level nodes (Starosta, van Driem, Larish, and related Sino-Austronesian/Formosan branches) from the "East Asian languages" article. All rows are marked `skip: true` and serve purely as a typological map over families and proposed macro-groups; they are not counted as coverage items.
- **Primary families / regions touched:** East Asian macro zone (Sino-Tibetan, Austroasiatic, Austronesian, Kra–Dai, Hmong–Mien, Koreanic, Japonic) plus Formosan branch labels and Sino-Austronesian proposals; complements the concrete Formosan helpers and East Asia mixer notes in §2.7.

- **Coverage / uniqueness role:** **Classification-only helper** – used as a structural index and for human reasoning about macro proposals. All concrete language names referenced here are backed by non-skip helpers (Formosan lists and the Gongduk helper in §8.19); this JSON itself is excluded from coverage percentages and base-uniqueness targets.

### 8.13 Languages of China – spoken languages snapshot

- **JSON file:** `tools/mixer-meta/wikipedia-languages-of-china-spoken-languages.json`
- **Title:** `Wikipedia: Languages of China – spoken languages snapshot`
- **Source:** <https://en.wikipedia.org/wiki/Languages_of_China>
- **Scope:** Full snapshot of the "Spoken languages" section in the "Languages of China" article, including families, branches, and named lects (Sinitic varieties, Tibeto-Burman branches, Turkic, Mongolic, Tungusic, Koreanic, Indo-European, Formosan, Tsat, etc.). Each family/branch or named language in that section appears once as a row.
- **Primary families / regions touched:** East and Inner Asia (Sino-Tibetan, Turkic, Mongolic, Tungusic, Koreanic, Indo-European, Austronesian, plus Formosan and mixed lects) as actually spoken in China; ties into the East Asia bases in §2.7.

- **How to re-run coverage:**
  - `node tools/mixer-core/report-wikipedia-list-coverage.js tools/mixer-meta/wikipedia-languages-of-china-spoken-languages.json`

- **Status tier:** **In progress (full section)** – this JSON tracks every language row in the spoken-languages table; use it to drive Chinese and minority-language coverage, and refresh snapshots after major East Asia passes.

- **Snapshot from last run (all list items):**
  - `fully wired:` 164
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 0
  - `Nonunique Bases:` 158

- **Status notes:** Coverage is now complete for this list (`fully wired` = 100% of considered). Next work is base-uniqueness declustering (still high `Nonunique Bases`) and confirming/adjusting race reachability where needed. ✅ 2025-12-12 uniqueness micro-pass (verified): declustered the Koreanic `bases=[10]` mega-cluster (kept `kor` as the anchor while moving dialect/lect entries onto unique `[10,...]` mixes); per-list base-set uniqueness moved from `clustered bases=60` to `clustered bases=58` and `run-language-mixer-suite` is green (**0** failures).

- ✅ 2025-12-12 uniqueness micro-pass (verified): additional declustering batches reduced per-list base-set `clustered bases` from **58** to **50**, then to **47** (suite still green, 0 failures).

- ✅ 2025-12-12 uniqueness micro-pass (verified): declustered the `mang` item off the shared `[179,251]` base-set, reducing per-list base-set `clustered bases` from **47** to **46** (suite still green, 0 failures).

- ✅ 2025-12-12 uniqueness micro-pass (verified): broke the remaining Mongolic collision by moving `torgut` off the shared `[276,296,381]` base-set, reducing per-list base-set `clustered bases` from **46** to **44** (suite still green, 0 failures).

- ✅ 2025-12-12 uniqueness micro-pass (verified): resolved the Hlai `bases=[318]` cluster (Hlai now `clusterSize=1` in the China list), reducing per-list base-set `clustered bases` from **44** to **43** (suite still green, 0 failures).

- ✅ 2025-12-12 uniqueness micro-pass (verified): resolved the `bases=[11,67,68]` size-3 collision cluster by moving `nao-klao` and `shao-jiang-min` onto unique `[11,67,68,...]` mixes (kept `jiaoliao-mandarin` as the anchor). Current China per-list base-set snapshot: `unique bases=130`, `clustered bases=35`, `Nonunique Bases=159`; `run-language-mixer-suite` is green (**0** failures).

- ✅ 2025-12-12 uniqueness micro-pass (verified): declustered the Eastern Yugur size-4 collision by keeping `eastern-yugur` as the `bases=[296,381]` anchor and moving `altai-uriankhai`, `oirat-mongolian`, and `rouran` onto unique `[296,381,...]` mixes. Suite remained green.

- ✅ 2025-12-12 uniqueness micro-pass (verified): declustered the `bases=[11,67,68]` cluster (`jiaoliao-mandarin`, `nao-klao`, `shao-jiang-min`) by keeping `jiaoliao-mandarin` as anchor and moving `nao-klao` and `shao-jiang-min` onto unique `[11,67,68,...]` mixes. Suite remained green.

- ✅ 2025-12-12 uniqueness micro-pass (verified): resolved the Mandarin alias + anchor collision by keeping `mandarin` as pure `bases=[11]`, moving `maojia` and `waxiang` off the anchor onto unique `[11,...]` mixes, and marking the duplicate China-list `Standard Chinese` (iso=`mandarin`) row as `skip: true`. Current China per-list base-set snapshot: `unique bases=134`, `clustered bases=30`, `Nonunique Bases=158`; `run-language-mixer-suite` is green (**0** failures).

### 8.14 Languages of Bangladesh – regional snapshot

- **JSON file:** `tools/mixer-meta/wikipedia-languages-of-bangladesh.json`
- **Title:** `Wikipedia: Languages of Bangladesh – Indo-Aryan and non-Indo-Aryan snapshot`
- **Source:** <https://en.wikipedia.org/wiki/Languages_of_Bangladesh>
- **Scope:** Snapshot of the detailed Indo-Aryan and non-Indo-Aryan language sections from the "Languages of Bangladesh" article, including Bengali-branch standards, tribal Indo-Aryan lects, Austroasiatic, Dravidian, and Tibeto-Burman languages explicitly listed there.
- **Primary families / regions touched:** South Asia (Indo-Aryan, Austroasiatic, Dravidian, Tibeto-Burman) as realized in Bangladesh; complements §2.9 and the South Asia regional list in §8.4.

- **How to re-run coverage:**
  - `node tools/mixer-core/report-wikipedia-list-coverage.js tools/mixer-meta/wikipedia-languages-of-bangladesh.json`

- **How to re-run base-uniqueness:**
  - `node tools/mixer-core/report-wikipedia-list-base-uniqueness.js tools/mixer-meta/wikipedia-languages-of-bangladesh.json`

- **How to re-run full suite:**
  - `node tools/mixer-core/run-language-mixer-suite.js`

- ✅ **Status tier:** **Complete**
- **Last run:** 2025-12-12

- **Snapshot from last run (considered items only):**
  - `fully wired:` 39 (100.0%)
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 0
  - `skipped:` 3
  - `Nonunique Bases:` 39

- **Base-set uniqueness (full items only):**
  - `unique bases:` 39
  - `clustered bases:` 0

### 8.15 Languages of India – census tables snapshot

- **JSON file:** `tools/mixer-meta/wikipedia-languages-of-india-census.json`
- **Title:** `Wikipedia: Languages of India – census tables snapshot`
- **Source:** <https://en.wikipedia.org/wiki/Languages_of_India>
- **Scope:** Name-only snapshot of the languages and mother tongues enumerated in the 2011 Census tables in the "Languages of India" article (first/second/third-language counts and the detailed mother-tongue tables). Each distinct language or mother-tongue name in those excerpts appears once in this JSON.
- **Primary families / regions touched:** South Asia (Indo-Aryan, Dravidian, Tibeto-Burman, Austroasiatic, and contact varieties) as represented in the Indian census; complements §2.9 and the South Asia regional subset in §8.4, but follows the census rather than the regional overview groupings.

- **How to re-run coverage:**
  - `node tools/mixer-core/report-wikipedia-list-coverage.js tools/mixer-meta/wikipedia-languages-of-india-census.json`

- **How to re-run base-set uniqueness:**
  - `node tools/mixer-core/report-wikipedia-list-base-uniqueness.js tools/mixer-meta/wikipedia-languages-of-india-census.json`

- ✅ **Status tier:** **Coverage complete; uniqueness pending**
- **Last run:** 2025-12-13

- **Snapshot from last run (considered items only):**
  - `fully wired:` 90 (100.0%)
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 0
  - `skipped:` 3
  - `Nonunique Bases:` 87

- **Base-set uniqueness (full items only):**
  - `unique bases:` 41
  - `clustered bases:` 49

### 8.16 Languages of Nepal – census tables snapshot

- **JSON file:** `tools/mixer-meta/wikipedia-languages-of-nepal-census.json`
- **Title:** `Wikipedia: Languages of Nepal – census tables snapshot`
- **Source:** <https://en.wikipedia.org/wiki/Languages_of_Nepal>
- **Scope:** Snapshot of the 2011 and 2021 census tables in the "Languages of Nepal" article, including both first-language and second-language tables. Each language or mother-tongue name in the pasted census tables appears once as a row.
- **Primary families / regions touched:** Himalayan South Asia (Indo-Aryan, Tibeto-Burman, Austroasiatic, Dravidian, and contact varieties) in Nepal; complements the Nepal-related notes under §2.9 and §2.7.

- **How to re-run coverage:**
  - `node tools/mixer-core/report-wikipedia-list-coverage.js tools/mixer-meta/wikipedia-languages-of-nepal-census.json`

- **Status tier:** **In progress (full table)** – treat this JSON as the canonical representation of the Nepal census excerpt; use coverage reports to drive catalog/mixer additions for under-documented Nepali languages.

### 8.17 Languages of Pakistan – established languages table

- **JSON file:** `tools/mixer-meta/wikipedia-languages-of-pakistan-established.json`
- **Title:** `Wikipedia: Languages of Pakistan – established languages`
- **Source:** <https://en.wikipedia.org/wiki/Languages_of_Pakistan>
- **Scope:** Snapshot of the "Established languages" table from the "Languages of Pakistan" article. Each named established language or variety in that table appears once as an item; province-level breakdown is not repeated in the JSON.
- **Primary families / regions touched:** West and South Asia (Indo-Aryan, Iranian, Dravidian, Turkic, Sino-Tibetan, and isolates) as realized in Pakistan; complements §8.8 and the South Asia work in §2.9.

- **How to re-run coverage:**
  - `node tools/mixer-core/report-wikipedia-list-coverage.js tools/mixer-meta/wikipedia-languages-of-pakistan-established.json`

- ✅ **Status tier:** **Complete**
- **Last run:** 2025-12-12

- **Snapshot from last run (considered items only):**
  - `fully wired:` 78 (100.0%)
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 0
  - `skipped:` 1

### 8.18 Global language families – macro classification snapshot

- **JSON file:** `tools/mixer-meta/wikipedia-language-families-global.json`
- **Title:** `Wikipedia: List of language families – global snapshot`
- **Source:** <https://en.wikipedia.org/wiki/List_of_language_families>
- **Scope:** Macro-family list derived from the global "List of language families" article. Each row in the spoken-language-families table is represented once as a `skip: true` classification item in this JSON; no member languages are enumerated here.
- **Primary families / regions touched:** All major language families across Africa, Eurasia, the Americas, and Oceania (Afroasiatic, Niger–Congo branches, Nilo-Saharan groupings, Indo-European, Uralic, Turkic, Sino-Tibetan, Austronesian, Papuan groupings, Pama–Nyungan, American families, etc.).

- **Coverage / uniqueness role:** **Classification-only helper** – used as a global macro-family index. Since it encodes families rather than languages, it is excluded from coverage percentages and base-uniqueness targets; concrete languages are tracked via the per-region and per-family helpers elsewhere in §8.

### 8.19 Gongduk language – Bhutan Sino-Tibetan microfamily sentinel

- **JSON file:** `tools/mixer-meta/wikipedia-gongduk-language.json`
- **Title:** `Wikipedia: Gongduk language – Bhutan Sino-Tibetan microfamily representative`
- **Source:** <https://en.wikipedia.org/wiki/Gongduk_language>
- **Scope:** Singleton helper for the Gongduk language of Bhutan, used as a concrete representative for the Gongduk microfamily referenced in East Asian/Sino-Tibetan classification proposals.
- **Primary families / regions touched:** Sino-Tibetan / East Himalayan fringe; complements the East Asian classification helper in §8.12 and the East Asia coverage in §2.7.

- **How to re-run coverage:**
  - `node tools/mixer-core/report-wikipedia-list-coverage.js tools/mixer-meta/wikipedia-gongduk-language.json`

- **Status tier:** **In progress (single-language helper)** – coverage here is trivial but this JSON ensures Gongduk is treated as a concrete language row, not just a classification-only node.

### 8.20 Malayo-Polynesian & Oceanic named languages – Blust (1999) snapshot

- **JSON file:** `tools/mixer-meta/wikipedia-malayo-polynesian-oceanic-languages-blust-1999.json`
- **Title:** `Wikipedia: Malayo-Polynesian and Oceanic named languages – Blust (1999) snapshot`
- **Source:** <https://en.wikipedia.org/wiki/Malayo-Polynesian_languages>; <https://en.wikipedia.org/wiki/Oceanic_languages>
- **Scope:** Small helper listing the explicitly named languages that appear inside the Blust (1999) Malayo-Polynesian and Oceanic subgroup trees (e.g. Umiray Dumaget, Manide–Alabat, Ati, Klata, Enggano, Rejang, Sundanese, Javanese, Madurese, Palauan, Chamorro, Kowiai, Yapese, Rotuman). These rows back the skip-marked Blust subgroup JSONs so that each named language also has a non-skip helper entry.
- **Primary families / regions touched:** Malayo-Polynesian and Oceanic Austronesian coverage in Island Southeast Asia and the Pacific; complements the Oceania regional subset in §8.6 and the Austronesian work in §2.12.

- **How to re-run coverage:**
  - `node tools/mixer-core/report-wikipedia-list-coverage.js tools/mixer-meta/wikipedia-malayo-polynesian-oceanic-languages-blust-1999.json`

- **Status tier:** **In progress (named-language subset)** – this helper exists to ensure that languages mentioned only in classification trees are still represented as normal coverage items.

### 8.31 Uralic languages – seed subset (historical view)

- **JSON file:** *(historical seed JSON, now removed; this entry is a view only – coverage and wiring are tracked via the full-family JSON in §8.31b)*
- **Title:** `Wikipedia: List of Uralic languages – seed subset`
- **Source:** <https://en.wikipedia.org/wiki/Uralic_languages>
- **Scope:** Seed subset of Uralic languages drawn from the broader family list (Finnish, Estonian, Karelian, Northern Sami, Erzya, Moksha, Komi, Udmurt, Mari, Hungarian).
- **Primary families / regions touched:** Uralic branches across Northern and Eastern Europe (Finnic, Sami, Mordvinic, Permic, Mari, Ugric), complementing the Europe and Russia seeds in §8.7 and §8.17 and the Uralic notes in §2.x.

- **Coverage tracking:** This seed subset is a convenience view over the broader `List of Uralic languages` article. Coverage and wiring/uniqueness metrics are tracked via the full-family entry in §8.31b (`wikipedia-uralic-languages-full.json`); we no longer maintain a separate per-subset coverage snapshot here.

### 8.31b Uralic languages – full family list

- **JSON file:** `tools/mixer-meta/wikipedia-uralic-languages-full.json`
- **Title:** `Wikipedia: List of Uralic languages – full family list`
- **Source:** <https://en.wikipedia.org/wiki/List_of_Uralic_languages>
- **Scope:** Full set of Uralic languages and major lects that have their own Wikipedia language or dialect entries in the `List of Uralic languages` article (Samoyedic, Ob‑Ugric, Permic, Mari, Mordvinic, Finnic, Sami, plus a few unclassified extinct lects).
- **Primary families / regions touched:** Entire Uralic family across Northern and Eastern Europe and Western Siberia; overlaps with the Europe, Russia, and phoneme-count lists elsewhere in §8.

- **How to re-run coverage:**
  - `node tools/mixer-core/report-wikipedia-list-coverage.js tools/mixer-meta/wikipedia-uralic-languages-full.json`

- **Status tier:** **In progress (full article)** – this JSON tracks all named Uralic lects in the list; proto and unclassified/extinct-without-attestation entries are marked `skip: true` and excluded from coverage percentages.
- **Snapshot from last run (all list items):**
  - `fully wired:` 78
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 0
  - `Nonunique Bases:` 78

### 8.32 Dictionary word-count languages – seed subset (historical snapshot)

- **JSON file:** *(historical seed JSON, now removed; this entry is an archived view only and does not drive coverage helpers)*
- **Title:** `Wikipedia: List of languages by number of words according to authoritative dictionaries – seed subset`
- **Source:** <https://en.wikipedia.org/wiki/List_of_languages_by_number_of_words_according_to_dictionaries>
- **Scope:** Seed subset of languages from the dictionary word-count list, focusing on major standards with large authoritative dictionaries across multiple families (English, German, Russian, French, Spanish, Italian, Chinese, Japanese, Arabic, Turkish).
- **Primary families / regions touched:** Global macro-families (Indo-European, Sinitic, Japonic, Afroasiatic, Turkic), providing a typological lens on lexical inventory size rather than direct coverage drivers.

- **Coverage / archival status:** This entry is an archived snapshot of a historical version of the `List of languages by number of words according to authoritative dictionaries` article. The original table is no longer present on Wikipedia, so we do not maintain a separate full-list JSON or auto-updated coverage snapshot here. Treat this seed JSON as a qualitative reference only; structural coverage work is driven instead by the active speaker-count and other Wikipedia language lists in §8.

### 8.36 English-based pidgins – seed subset (view over full list)

- **JSON file:** *(historical seed JSON, now removed; this entry is a convenience view only – coverage and wiring are tracked via the full-list JSON in §8.36b)*
- **Title:** `Wikipedia: List of English-based pidgins – seed subset`
- **Source:** <https://en.wikipedia.org/wiki/List_of_English-based_pidgins>
- **Scope:** Seed subset of English-based pidgins drawn from the corresponding Wikipedia list (Tok Pisin, Bislama, Nigerian Pidgin, Krio, Hawaiian Pidgin, Singlish, Jamaican Patois, Cook Islands Māori Pidgin).
- **Primary families / regions touched:** English-lexifier contact varieties across the Pacific, Atlantic, and Africa (Tok Pisin, Bislama, Krio, Jamaican Patois, Nigerian Pidgin, etc.), complementing the broader creole/mixed/pidgin seed in §8.13.

- **Coverage tracking:** This seed subset is a convenience view over the broader `List of English-based pidgins` article. Coverage and wiring/uniqueness metrics are tracked via the full-article entry in §8.36b (`wikipedia-list-english-based-pidgins-full.json`); we no longer maintain a separate per-subset coverage snapshot here.

### 8.36b English-based pidgins – full article list

- **JSON file:** `tools/mixer-meta/wikipedia-list-english-based-pidgins-full.json`
- **Title:** `Wikipedia: List of English-based pidgins – full article list`
- **Source:** <https://en.wikipedia.org/wiki/List_of_English-based_pidgins>
- **Scope:** Full set of English-lexifier pidgins and pidgin/creole contact lects listed in the article (English-based contact languages in Africa, the Pacific, the Americas, and elsewhere) that have some documentation as stable contact languages.
- **Primary families / regions touched:** Global, with strong coverage in West Africa, the Caribbean, and the Pacific; overlaps the broader creole/mixed language work in §8.13.

- **How to re-run coverage:**
  - `node tools/mixer-core/report-wikipedia-list-coverage.js tools/mixer-meta/wikipedia-list-english-based-pidgins-full.json`

- **Status tier:** **In progress (full article)** – this JSON tracks all named English-based pidgins in the current article. It is a typological driver for English-lexifier contact coverage and does not override the global uniqueness rules for bases.
- **Snapshot from last run (all list items):**
  - `fully wired:` 30
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 0
  - `Nonunique Bases:` 30

### 8.33 Phoneme-count languages – seed subset (view over full list)

- **JSON file:** *(historical seed JSON, now removed; this entry is a typological view only – coverage and wiring are tracked via the full-article JSON in §8.33b)*
- **Title:** `Wikipedia: List of languages by number of phonemes – seed subset`
- **Source:** <https://en.wikipedia.org/wiki/List_of_languages_by_number_of_phonemes>
- **Scope:** Seed subset of languages from the phoneme-count list, sampling extremes and mid-range systems (Rotokas, Pirahã, Hawaiian, Japanese, Spanish, English, German, Russian, Mandarin Chinese, Taa).
- **Primary families / regions touched:** Global cross-family sample (Papuan, Austronesian, Japonic, Indo-European, Afroasiatic, etc.), intended primarily as a typological reference for future phonology-aware tuning rather than a direct coverage driver.
 
- **Coverage tracking:** This seed subset is a typological view over the `List of languages by number of phonemes` article (extremes + mid-range systems). Coverage and wiring/uniqueness metrics are tracked via the full-article entry in §8.33b (`wikipedia-languages-by-phoneme-count-full.json`); we no longer maintain a separate per-subset coverage snapshot here.

### 8.33b Phoneme-count languages – full article list

- **JSON file:** `tools/mixer-meta/wikipedia-languages-by-phoneme-count-full.json`
- **Title:** `Wikipedia: List of languages by number of phonemes – full article list`
- **Source:** <https://en.wikipedia.org/wiki/List_of_languages_by_number_of_phonemes>
- **Scope:** Full list of languages currently enumerated in the `List of languages by number of phonemes` article (standard dialects only), including both low-phoneme and high-phoneme systems (Arabic, Archi, Rotokas, Ubykh, Vietnamese, etc.).
- **Primary families / regions touched:** Cross-family sample spanning Afroasiatic, Indo-European, Uralic, Austronesian, Sino-Tibetan, Koreanic, Japonic, Nilo-Saharan, North Bougainville, Northwest Caucasian, and others; used as a typological lens rather than a primary coverage driver.

- **How to re-run coverage:**
  - `node tools/mixer-core/report-wikipedia-list-coverage.js tools/mixer-meta/wikipedia-languages-by-phoneme-count-full.json`

- **Status tier:** **In progress (full article)** – this JSON tracks every language row in the current Wikipedia phoneme-count list; since it is typological, there is no separate uniqueness-target here beyond the global base-uniqueness rules.
- **Snapshot from last run (all list items):**
  - `fully wired:` 72
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 0
  - `Nonunique Bases:` 65

- ✅ **2025-12-12 status:** Coverage for this list is now fully wired (**72/72**). Added missing ISO bindings in `tools/mixer-meta/wikipedia-languages-by-phoneme-count-full.json` and appended the required catalog + mixer-map entries (append-only invariant preserved). Suite + devplan snapshot refreshed.

### 8.34 Mutually intelligible languages – seed subset (view over full list)

- **JSON file:** *(historical seed JSON, now removed; this entry is a focused view only – coverage and wiring are tracked via the full-article JSON in §8.34b)*
- **Title:** `Wikipedia: List of mutually intelligible languages – seed subset`
- **Source:** <https://en.wikipedia.org/wiki/List_of_mutually_intelligible_languages>
- **Scope:** Seed subset of mutually intelligible standards drawn from the broader list (Swedish, Norwegian, Danish, Czech, Slovak, Serbian, Croatian, Hindi, Urdu, Portuguese), used as a qualitative check on where bases or mixes might reasonably be shared or closely related.
- **Primary families / regions touched:** Germanic and Slavic branches of Indo-European plus Hindustani and Lusophone standards, overlapping with European and South Asian coverage elsewhere in §2.x and §8.

- **Coverage tracking:** This seed subset is a focused view over the broader `List of mutually intelligible languages` article (headline Germanic/Romance/Slavic/Hindustani pairs). Coverage and wiring/uniqueness metrics are tracked via the full-article entry in §8.34b (`wikipedia-mutually-intelligible-languages-full.json`); we no longer maintain a separate per-subset coverage snapshot here.

### 8.34b Mutually intelligible languages – full article list

- **JSON file:** `tools/mixer-meta/wikipedia-mutually-intelligible-languages-full.json`
- **Title:** `Wikipedia: List of mutually intelligible languages – full article list`
- **Source:** <https://en.wikipedia.org/wiki/List_of_mutually_intelligible_languages>
- **Scope:** Full set of languages currently named in the `List of mutually intelligible languages` article, across all families (Afroasiatic, Atlantic–Congo, Austronesian, Indo-European, Kra–Dai, Sino-Tibetan, Turkic, Uralic, Tungusic, etc.), treating each language that appears in at least one mutual-intelligibility pair or cluster as a row in this JSON.
- **Primary families / regions touched:** Cross-family sample spanning Europe, the Middle East, South Asia, Southeast Asia, and Africa; used as a typological guardrail for where shared bases or very-close mixes might be acceptable.

- **How to re-run coverage:**
  - `node tools/mixer-core/report-wikipedia-list-coverage.js tools/mixer-meta/wikipedia-mutually-intelligible-languages-full.json`

- **Status tier:** **In progress (full article)** – this JSON tracks all languages mentioned in the current mutual-intelligibility list; uniqueness decisions still follow the global base-uniqueness rules, with this list acting as a reminder where near-identical bases or mixes may be justified.
- **Snapshot from last run (all list items):**
  - `fully wired:` 107
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 0
  - `Nonunique Bases:` 96
- **Base-set uniqueness details (full items):**
  - `unique bases:` 98
  - `clustered bases:` 26
  - `clustered full items:` 26
  - `cluster size histogram:` size2=17, size3=5, size4+=4
  - `clustered isos:` aht(37), eyak(37), kalaallisut(37), tfn(37), arp(3), cho(3), cree(3), navajo(3), purepecha(3), ayo(2), cay(2), cro(2), ems(2), gub(2), gum(2), iku(2), kanamari(2), kashinawa(2), kwi(2), mixe(2), mohawk(2), mot(2), qanjobal(2), wayuu(2), yup(2), zoq(2)

### 8.35 Official languages by institution – seed subset (view over full list)

- **JSON file:** *(historical seed JSON, now removed; this entry is a convenience view only – coverage and wiring are tracked via the full-article JSON in §8.35b)*
- **Title:** `Wikipedia: List of official languages by institution – seed subset`
- **Source:** <https://en.wikipedia.org/wiki/List_of_official_languages_by_institution>
- **Scope:** Seed subset of institution-level official languages drawn from the article (UN, EU, AU, etc.), focusing on globally central standards (English, French, Spanish, Arabic, Russian, Chinese, German, Portuguese, Italian, Japanese).
- **Primary families / regions touched:** Global macro-families with strong institutional presence (Indo-European, Sinitic, Afroasiatic, etc.), overlapping with the country/territory seed in §8.22 and the speaker-count seeds in §8.2–§8.3 and §8.20.

- **Coverage tracking:** This seed subset is a convenience view over the broader `List of official languages of international organizations` article. Coverage and wiring/uniqueness metrics are tracked via the full-article entry in §8.35b (`wikipedia-list-official-languages-by-institution-full.json`); we no longer maintain a separate per-subset coverage snapshot here.

### 8.35b Official languages by institution – full article list

- **JSON file:** `tools/mixer-meta/wikipedia-list-official-languages-by-institution-full.json`
- **Title:** `Wikipedia: List of official languages by institution – full article list`
- **Source:** <https://en.wikipedia.org/wiki/List_of_official_languages_of_international_organizations>
- **Scope:** Full set of languages that appear as official or working languages in the `List of official languages of international organizations` article (UN, AU, EU, ASEAN, OAS, etc.). Each distinct language name used in the tables is represented once in this JSON.
- **Primary families / regions touched:** Global macro-families with strong institutional presence (Indo-European, Sinitic, Afroasiatic, Niger–Congo, Austronesian, etc.), overlapping heavily with the country/territory list and the speaker-count lists.

- **How to re-run coverage:**
  - `node tools/mixer-core/report-wikipedia-list-coverage.js tools/mixer-meta/wikipedia-list-official-languages-by-institution-full.json`

- **Status tier:** ✅ **Complete (full article)** – verified `fully wired=34/34` and list-base-set uniqueness now reports `clustered bases=0` for the list’s full items.
- **Snapshot from last run (all list items):**
  - `fully wired:` 34
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 0
  - `Nonunique Bases:` 33

- **Uniqueness notes:** Under the stricter "linguistically defensible" policy, any `Nonunique Bases` count here indicates remaining uniqueness debt in the list items (excluding any `skip: true` entries). Large lexifiers or regional hubs may still appear as **ingredients** in mixes, but identical shared `bases[]` arrays among distinct non-skipped languages are not treated as acceptable end state.

### 8.37 Lingua francas – full article list

- **JSON file:** `tools/mixer-meta/wikipedia-list-lingua-francas-full.json`
- **Title:** `Wikipedia: List of lingua francas – full article list`
- **Source:** <https://en.wikipedia.org/wiki/List_of_lingua_francas>
- **Scope:** Full list of languages explicitly called out as lingua francas in the article (Africa, Asia, Europe, pre-Columbian Americas, plus pidgins/creoles), with one entry per language (e.g. Arabic, Hausa, Hindustani, Indonesian, English, French, Quechua, Tok Pisin, etc.).
- **Primary families / regions touched:** Cross-family sample spanning Afroasiatic, Niger–Congo, Indo-European, Dravidian, Sinitic, Japonic, Koreanic, Austronesian, Papuan, and indigenous American families, plus several major pidgins/creoles.

- **How to re-run coverage:**
  - `node tools/mixer-core/report-wikipedia-list-coverage.js tools/mixer-meta/wikipedia-list-lingua-francas-full.json`

- **Status tier:** **In progress (full article)** – this JSON tracks every language heading in the `List of lingua francas` article. Sign languages (e.g. Plains Sign Language / "Hand Talk") are present in the JSON as `skip: true` entries and are excluded from coverage percentages per the global sign-language exception.
- **Snapshot from last run (all list items):**
  - `fully wired:` 69
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 0
  - `Nonunique Bases:` 66

- **Uniqueness notes:** Under the stricter "linguistically defensible" policy, any `Nonunique Bases` count here indicates remaining uniqueness debt in the list items (excluding any `skip: true` entries). Lexifiers and regional hubs may still appear as **ingredients** in mixes, but identical shared `bases[]` arrays among distinct non-skipped languages are not treated as acceptable end state.

### 9. Mixer restore snapshots
 - ✅ **2025-12-12 verification:** Current `config/language-mixer-map.json` and `config/language-mixes.json` contain all `iso` entries from the `config/*before-*.json` snapshot files (`language-mixer-map.before-restore.json`, `language-mixer-map.before-fix.json`, `language-mixes.before-restore.json`); snapshot ISO diff shows `missing=0` for each.


### 8.99 Auto-registered wiki lists (untriaged)

- **Status:** Auto-populated registry entries for wiki JSONs that exist on disk but have not been triaged into the curated sections above.
- **Note:** Snapshot blocks are maintained by tooling; do not hand-edit counts.

#### Wikipedia: Australian creoles

- **JSON file:** `tools/mixer-meta/wikipedia-australian-creoles.json`
- **Source:** https://en.wikipedia.org/wiki/Australian_Aboriginal_languages
- **Status tier:** **Untriaged (auto-registered)**
- **Snapshot from last run (all list items):**
  - `fully wired:` 0
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 1
  - `ambiguous:` 0
  - `Nonunique Bases:` 1
- **Base-set uniqueness details (full items):**
  - `unique bases:` 34
  - `clustered bases:` 0
  - `clustered full items:` 0
  - `cluster size histogram:` size2=0, size3=0, size4+=0
  - `clustered isos:` (none)

#### Wikipedia: Australian language families and isolates

- **JSON file:** `tools/mixer-meta/wikipedia-australian-families-and-isolates.json`
- **Source:** https://en.wikipedia.org/wiki/Australian_Aboriginal_languages
- **Status tier:** **Untriaged (auto-registered)**
- **Snapshot from last run (all list items):**
  - `fully wired:` 1
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 31
  - `ambiguous:` 0
  - `Nonunique Bases:` 31
- **Base-set uniqueness details (full items):**
  - `unique bases:` 1
  - `clustered bases:` 0
  - `clustered full items:` 0
  - `cluster size histogram:` size2=0, size3=0, size4+=0
  - `clustered isos:` (none)

#### Wikipedia: Australian language groupings - Bowern (2011)

- **JSON file:** `tools/mixer-meta/wikipedia-australian-languages-bowern-2011.json`
- **Source:** https://en.wikipedia.org/wiki/Australian_Aboriginal_languages
- **Status tier:** **Untriaged (auto-registered)**
- **Snapshot from last run (all list items):**
  - `fully wired:` 1
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 0
  - `Nonunique Bases:` 1
- **Base-set uniqueness details (full items):**
  - `unique bases:` 1
  - `clustered bases:` 0
  - `clustered full items:` 0
  - `cluster size histogram:` size2=0, size3=0, size4+=0
  - `clustered isos:` (none)

#### Wikipedia: Australian Aboriginal languages with >100 speakers (NILS/census)

- **JSON file:** `tools/mixer-meta/wikipedia-australian-languages-living-2019.json`
- **Source:** https://en.wikipedia.org/wiki/Australian_Aboriginal_languages
- **Status tier:** **Untriaged (auto-registered)**
- **Snapshot from last run (all list items):**
  - `fully wired:` 47
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 0
  - `Nonunique Bases:` 47
- **Base-set uniqueness details (full items):**
  - `unique bases:` 43
  - `clustered bases:` 3
  - `clustered full items:` 3
  - `cluster size histogram:` size2=0, size3=0, size4+=3
  - `clustered isos:` kunwinjku(5), maung(5), nunggubuyu(5)

#### Wikipedia: Formosan language families - Blust (1999)

- **JSON file:** `tools/mixer-meta/wikipedia-formosan-languages-blust-1999.json`
- **Source:** https://en.wikipedia.org/wiki/Formosan_languages
- **Status tier:** **Untriaged (auto-registered)**
- **Snapshot from last run (all list items):**
  - `fully wired:` 21
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 0
  - `Nonunique Bases:` 21
- **Base-set uniqueness details (full items):**
  - `unique bases:` 0
  - `clustered bases:` 0
  - `clustered full items:` 0
  - `cluster size histogram:` size2=0, size3=0, size4+=0
  - `clustered isos:` (none)

#### Wikipedia: Formosan language families - Li (2008)

- **JSON file:** `tools/mixer-meta/wikipedia-formosan-languages-li-2008.json`
- **Source:** https://en.wikipedia.org/wiki/Formosan_languages
- **Status tier:** **Untriaged (auto-registered)**
- **Snapshot from last run (all list items):**
  - `fully wired:` 21
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 0
  - `Nonunique Bases:` 21
- **Base-set uniqueness details (full items):**
  - `unique bases:` 0
  - `clustered bases:` 5
  - `clustered full items:` 5
  - `cluster size histogram:` size2=0, size3=0, size4+=5
  - `clustered isos:` bunun(13), paiwan(13), puyuma(13), ssf(13), sxr(13)

#### Wikipedia: Formosan and Austronesian branches - Sagart (2004, 2021)

- **JSON file:** `tools/mixer-meta/wikipedia-formosan-languages-sagart-2004-2021.json`
- **Source:** https://en.wikipedia.org/wiki/Formosan_languages
- **Status tier:** **Untriaged (auto-registered)**
- **Snapshot from last run (all list items):**
  - `fully wired:` 6
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 16
  - `ambiguous:` 0
  - `Nonunique Bases:` 22
- **Base-set uniqueness details (full items):**
  - `unique bases:` 0
  - `clustered bases:` 6
  - `clustered full items:` 6
  - `cluster size histogram:` size2=0, size3=0, size4+=6
  - `clustered isos:` bunun(13), paiwan(13), puyuma(13), rukai(13), ssf(13), sxr(13)

#### Wikipedia: List of constructed languages  seed subset

- **JSON file:** `tools/mixer-meta/wikipedia-list-constructed-languages.json`
- **Source:** https://en.wikipedia.org/wiki/List_of_constructed_languages
- **Status tier:** **Untriaged (auto-registered)**
- **Snapshot from last run (all list items):**
  - `fully wired:` 0
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 7
  - `ambiguous:` 0
  - `Nonunique Bases:` 7
- **Base-set uniqueness details (full items):**
  - `unique bases:` 0
  - `clustered bases:` 0
  - `clustered full items:` 0
  - `cluster size histogram:` size2=0, size3=0, size4+=0
  - `clustered isos:` (none)

#### Wikipedia: Creole, mixed, and pidgin languages  seed subset

- **JSON file:** `tools/mixer-meta/wikipedia-list-creoles-and-mixed-languages.json`
- **Source:** https://en.wikipedia.org/wiki/List_of_creole_languages
- **Status tier:** **Untriaged (auto-registered)**
- **Snapshot from last run (all list items):**
  - `fully wired:` 8
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 0
  - `Nonunique Bases:` 8
- **Base-set uniqueness details (full items):**
  - `unique bases:` 8
  - `clustered bases:` 0
  - `clustered full items:` 0
  - `cluster size histogram:` size2=0, size3=0, size4+=0
  - `clustered isos:` (none)

#### Wikipedia: Creole, mixed, and pidgin languages  seed subset

- **JSON file:** `tools/mixer-meta/wikipedia-list-creoles-and-mixed-languages.utf8.json`
- **Source:** https://en.wikipedia.org/wiki/List_of_creole_languages
- **Status tier:** **Untriaged (auto-registered)**
- **Snapshot from last run (all list items):**
  - `fully wired:` 8
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 0
  - `Nonunique Bases:` 8
- **Base-set uniqueness details (full items):**
  - `unique bases:` 8
  - `clustered bases:` 0
  - `clustered full items:` 0
  - `cluster size histogram:` size2=0, size3=0, size4+=0
  - `clustered isos:` (none)

#### Wikipedia: List of lingua francas  seed subset

- **JSON file:** `tools/mixer-meta/wikipedia-list-lingua-francas.json`
- **Source:** https://en.wikipedia.org/wiki/List_of_lingua_francas
- **Status tier:** **Untriaged (auto-registered)**
- **Snapshot from last run (all list items):**
  - `fully wired:` 10
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 0
  - `Nonunique Bases:` 9
- **Base-set uniqueness details (full items):**
  - `unique bases:` 10
  - `clustered bases:` 0
  - `clustered full items:` 0
  - `cluster size histogram:` size2=0, size3=0, size4+=0
  - `clustered isos:` (none)

#### Wikipedia: Malayo-Polynesian subgroups - Blust (1999)

- **JSON file:** `tools/mixer-meta/wikipedia-malayo-polynesian-subgroups-blust-1999.json`
- **Source:** https://en.wikipedia.org/wiki/Malayo-Polynesian_languages
- **Status tier:** **Untriaged (auto-registered)**
- **Snapshot from last run (all list items):**
  - `fully wired:` 0
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 0
  - `Nonunique Bases:` 0
- **Base-set uniqueness details (full items):**
  - `unique bases:` 0
  - `clustered bases:` 0
  - `clustered full items:` 0
  - `cluster size histogram:` size2=0, size3=0, size4+=0
  - `clustered isos:` (none)

#### Wikipedia: Oceanic subgroups – Blust (1999)

- **JSON file:** `tools/mixer-meta/wikipedia-oceanic-languages-blust-1999.json`
- **Source:** https://en.wikipedia.org/wiki/Oceanic_languages
- **Status tier:** **Untriaged (auto-registered)**
- **Snapshot from last run (all list items):**
  - `fully wired:` 0
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 0
  - `Nonunique Bases:` 0
- **Base-set uniqueness details (full items):**
  - `unique bases:` 0
  - `clustered bases:` 0
  - `clustered full items:` 0
  - `cluster size histogram:` size2=0, size3=0, size4+=0
  - `clustered isos:` (none)

#### Wikipedia: Papuan language families - Foley (2003)

- **JSON file:** `tools/mixer-meta/wikipedia-papuan-families-foley-2003.json`
- **Source:** https://en.wikipedia.org/wiki/Papuan_languages
- **Status tier:** **Untriaged (auto-registered)**
- **Snapshot from last run (all list items):**
  - `fully wired:` 0
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 11
  - `ambiguous:` 0
  - `Nonunique Bases:` 11
- **Base-set uniqueness details (full items):**
  - `unique bases:` 0
  - `clustered bases:` 0
  - `clustered full items:` 0
  - `cluster size histogram:` size2=0, size3=0, size4+=0
  - `clustered isos:` (none)

#### Wikipedia: Papuan language families and isolates - Glottolog 4.0

- **JSON file:** `tools/mixer-meta/wikipedia-papuan-families-glottolog-4.0.json`
- **Source:** https://en.wikipedia.org/wiki/Papuan_languages
- **Status tier:** **Untriaged (auto-registered)**
- **Snapshot from last run (all list items):**
  - `fully wired:` 4
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 130
  - `ambiguous:` 0
  - `Nonunique Bases:` 134
- **Base-set uniqueness details (full items):**
  - `unique bases:` 4
  - `clustered bases:` 0
  - `clustered full items:` 0
  - `cluster size histogram:` size2=0, size3=0, size4+=0
  - `clustered isos:` (none)

#### Wikipedia: Papuan language families and isolates - Palmer (2018)

- **JSON file:** `tools/mixer-meta/wikipedia-papuan-families-palmer-2018.json`
- **Source:** https://en.wikipedia.org/wiki/Papuan_languages
- **Status tier:** **Untriaged (auto-registered)**
- **Snapshot from last run (all list items):**
  - `fully wired:` 2
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 77
  - `ambiguous:` 0
  - `Nonunique Bases:` 79
- **Base-set uniqueness details (full items):**
  - `unique bases:` 2
  - `clustered bases:` 0
  - `clustered full items:` 0
  - `cluster size histogram:` size2=0, size3=0, size4+=0
  - `clustered isos:` (none)

#### Wikipedia: Papuan language families - Ross (2005)

- **JSON file:** `tools/mixer-meta/wikipedia-papuan-families-ross-2005.json`
- **Source:** https://en.wikipedia.org/wiki/Papuan_languages
- **Status tier:** **Untriaged (auto-registered)**
- **Snapshot from last run (all list items):**
  - `fully wired:` 0
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 32
  - `ambiguous:` 0
  - `Nonunique Bases:` 32
- **Base-set uniqueness details (full items):**
  - `unique bases:` 0
  - `clustered bases:` 0
  - `clustered full items:` 0
  - `cluster size histogram:` size2=0, size3=0, size4+=0
  - `clustered isos:` (none)

#### Wikipedia: Papuan language families - Usher & Suter (2024)

- **JSON file:** `tools/mixer-meta/wikipedia-papuan-families-usher-suter-2024.json`
- **Source:** https://en.wikipedia.org/wiki/Papuan_languages
- **Status tier:** **Untriaged (auto-registered)**
- **Snapshot from last run (all list items):**
  - `fully wired:` 1
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 26
  - `ambiguous:` 0
  - `Nonunique Bases:` 27
- **Base-set uniqueness details (full items):**
  - `unique bases:` 1
  - `clustered bases:` 0
  - `clustered full items:` 0
  - `cluster size histogram:` size2=0, size3=0, size4+=0
  - `clustered isos:` (none)

#### Wikipedia: Papuan language families - Wichmann (2013)

- **JSON file:** `tools/mixer-meta/wikipedia-papuan-families-wichmann-2013.json`
- **Source:** https://en.wikipedia.org/wiki/Papuan_languages
- **Status tier:** **Untriaged (auto-registered)**
- **Snapshot from last run (all list items):**
  - `fully wired:` 8
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 98
  - `ambiguous:` 0
  - `Nonunique Bases:` 106
- **Base-set uniqueness details (full items):**
  - `unique bases:` 8
  - `clustered bases:` 0
  - `clustered full items:` 0
  - `cluster size histogram:` size2=0, size3=0, size4+=0
  - `clustered isos:` (none)

#### Wikipedia: Papuan language families - Wurm (1975)

- **JSON file:** `tools/mixer-meta/wikipedia-papuan-families-wurm-1975.json`
- **Source:** https://en.wikipedia.org/wiki/Papuan_languages
- **Status tier:** **Untriaged (auto-registered)**
- **Snapshot from last run (all list items):**
  - `fully wired:` 0
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 19
  - `ambiguous:` 0
  - `Nonunique Bases:` 19
- **Base-set uniqueness details (full items):**
  - `unique bases:` 0
  - `clustered bases:` 0
  - `clustered full items:` 0
  - `cluster size histogram:` size2=0, size3=0, size4+=0
  - `clustered isos:` (none)
