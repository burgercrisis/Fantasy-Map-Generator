# Changes vs Azgaar `master`

This document summarizes the main differences between this fork (branch `Burgers-Stuff-He-Did-To-Azgaars`) and upstream `Azgaar/Fantasy-Map-Generator` `master` as of the latest merge base.

The goal is to give a quick orientation for what has been added or changed, without duplicating all commit messages.

## Table of contents

- [1. High‑Level Overview](#1-high-level-overview)
- [2. New Planning & Design Documents](#2-new-planning--design-documents)
- [3. Language Mixer & Language Data](#3-language-mixer--language-data)
- [4. Fantasy Race System](#4-fantasy-race-system)
- [5. UI & UX Adjustments](#5-ui--ux-adjustments)
- [6. Helper Tools & Maintenance Scripts](#6-helper-tools--maintenance-scripts)
- [7. Miscellaneous Changes](#7-miscellaneous-changes)
- [8. Conceptual Summary](#8-conceptual-summary)

---

## 1. High‑Level Overview

- **Language mixer system** for building synthetic languages and name sets by mixing real languages via the existing Markov generator.
- **Fantasy race system** integrated with cultures and map generation.
- **Planning documents** for future systems: Underdark, Individuals, and Character generation.
- **Extensive language & namebase expansions** plus a toolbox of helper scripts for maintaining language mappings, coverage, and data quality.
- **Minor UI and tooling adjustments** to surface the above features.
- **AI generator removal:** the previous AI text generator (OpenAI / Anthropic / Gemini / Ollama) and the extra `Barrier Islands` / `Bay` heightmap templates have been removed and the affected code paths reverted to the upstream-equivalent v1.108-era state.

- **Language mixer coordination + regeneration discipline** (multi-agent): language mixer changes are tracked as deltas under `tools/mixer-deltas/*.json` and validated via `pnpm run mixer:*` scripts. In multi-agent contexts, a **single-integrator lane** is used so only the integrator runs `pnpm run mixer:apply-deltas` (to regenerate committed artifacts).

- **Races ↔ cultures decoupling (in progress):** the current direction is to treat race as a **cell-level layer** (`pack.cells.race`) and make entity naming race-aware on a per-cell basis.

---

## 2. New Planning & Design Documents

New high‑level design docs under `DEVplans/`:

- **[Underdark Feature – Developer Guide](Underdark.md)**  
  Describes the plan for adding an Underdark layer / subsystem to the world (structure, integration points, future UI).

- **[Individuals System – Developer Guide](Individuals.md)**  
  Developer guide for a scalable Individuals & Population system (IDs/seeding, schemas, overrides, time evolution, APIs, roadmap).

- **[Characters System – Developer Guide](Characters.md)**  
  Planning document for a deeper character system tied into Individuals (incl. D&D / Pathfinder style character generation hooks).

These are additive; upstream does not ship these design docs.

---

## 3. Language Mixer & Language Data

New functionality to procedurally **mix languages** and generate novel name styles:

- **Config & data files** (large changes):
  - `config/language-mixer-map.js` and `config/language-mixer-map.json`
  - `config/language-mixes-all.js` and `config/language-mixes.json`
- **Generator logic:**
  - `modules/names-mixer.js` – core mixer logic over Azgaar’s Markov system.
  - Updates to `modules/names-generator.js` and `modules/namebases-*.js` (real, fantasy, creole, all) to plug the mixer into existing name generation.
- **Data expansions:**
  - Many new languages and families (e.g. additional Romance, Uralic, Creole, Hmong‑Mien, Sinitic, African languages, etc.).
  - Improved coverage and fallback rules so more cultures/races have appropriate name pools.

Current maintenance model (vs upstream):

- **Append-only registries**: `config/language-mixes.json` and `config/language-mixer-map.json` are treated as append-only language registries (no deletion).
- **Delta-first workflow**: changes are expressed as delta JSON files under `tools/mixer-deltas/*.json` and then applied/validated through:
  - `pnpm run mixer:apply-deltas` (writes/regenerates artifacts)
  - `pnpm run mixer:check-deltas` (read-only validation)
  - `pnpm run mixer:guardrails` / `pnpm run mixer:health` / targeted diagnostics

Multi-agent coordination notes (current repo practice):

- **Single-integrator lane**: in multi-agent contexts, only the integrator runs `pnpm run mixer:apply-deltas` to regenerate:
  - `config/language-mixer-map.json`
  - `config/language-mixer-map.js`
  - `tools/mixer-deltas/_compiled-dedicated-pins.json`

- **Claim logs + helpers** are used to avoid overlap when burning down uniqueness debt (see §7).

Behavioral impact vs upstream:

- More **language diversity** and finer mapping between cultures/races and name sets.
- Ability to define **synthetic mixed languages** for worlds that don’t map cleanly to any single real‑world language.

- Mixer objective tuning (helper tooling): `tools/mixer-core/compare-language-generators.js` is used to evaluate and compare different mixer generation approaches. `modules/names-mixer.js` supports opting into the v19 mixed-name generator via `?mixer=v19` (or `localStorage.fmg-mixer-version = "v19"`). Defaults remain unchanged unless the override is set.

---

## 4. Fantasy Race System

New race system layered on top of/alongside cultures:

- **New modules:**
  - `modules/races.js` – race definitions, relationships to cultures, and generation logic.
  - `modules/dynamic/editors/races-editor.js` – UI/editor for configuring and exploring races.
- **Integration points:**
  - Changes in `modules/cultures-generator.js` and related files so that expansionism, culture generation, and naming can respect race information.

Current status (vs upstream):

- **Cell-level race persistence (implemented):** `pack.cells.race` is persisted in saves when present and correctly sized. It is saved as an optional trailing line in `.map` and loaded back when present.
- **Per-cell race-aware naming (implemented):** `modules/names-generator.js` exposes `Names.getBaseForCell(cell, cultureId)` and various name generation call sites pass an explicit base index so generated names can follow the cell’s race (when it resolves to a race mixer base).
- **Culture base sync to dominant race (implemented, current behavior):** `modules/races.js` includes `syncCultureBasesToDominantRace()` (invoked from `assignRaces`) to keep `culture.base` aligned with the dominant race derived from `cells.race`.

In-progress / refactor direction:

- The race system is being refactored toward **decoupling** races from cultures (Choice A): treat `pack.cells.race` as authoritative and avoid using `culture.race` as the source of truth. See `DEVplans/Races-Cultures-Decoupling.md` for the current plan and status.

Effects vs upstream:

- Worlds can distinguish **fantasy races** in addition to cultures.
- Race settings influence **name selection** (race-aware base resolution), enabling campaign‑setting‑style worlds.
- `race.expansionism` exists and is editable, but **culture expansion currently uses `culture.expansionism` directly** (no current multiplier from `race.expansionism` in `Cultures.expand`); changing how race expansion affects culture spread is part of the decoupling/refactor work.

---

## 5. UI & UX Adjustments

Selected UI changes on top of upstream behavior:

- **Burgs overview:**
  - `modules/ui/burgs-overview.js` enhanced with more grouping options (e.g. by state/language, culture/language, etc.) and improved legend / layout to better visualize language & race distributions.

- **Namesbase editor & tools wiring:**
  - `modules/ui/namesbase-editor.js`, `modules/ui/editors.js`, `modules/ui/tools.js`, `modules/ui/hotkeys.js`, and `modules/ui/layers.js` touched to:
    - Expose the language mixer and race editor.
    - Add or adjust hotkeys and layer visibility related to the new systems where appropriate.

- **Page shell / bootstrapping:**
  - `index.html`, `main.js`, and `old_index.html` updated to include the new dialogs/scripts and keep a copy of the old layout for reference.

These changes are mostly **additive wiring** for new systems; core map editing UX from upstream remains recognizable.

---

## 6. Helper Tools & Maintenance Scripts

A large set of maintenance scripts under `tools/` has been added or expanded. Highlights include:

- **Language family & mapping maintenance:**
  - `tools/mixer-catalog/add-lexifier.js` — auto-populate language mixer entries.
  - `tools/mixer-catalog/fill-family-mixes.js` — fill missing family-level mixes.
  - `tools/mixer-meta/_meta-fill-missing-mixes.js` — meta-level missing mix filler.
  - `tools/mixer-diagnostics/retune-african-mappings.js` — retune African language mappings.
  - `tools/mixer-diagnostics/restore-lost-language-mappings.js` — restore lost mappings.
  - `tools/mixer-core/normalize-language-names.js` — normalize language name formatting.

- **Quality & coverage reports:**
  - `tools/mixer-core/check-mixer-health.js` — unified health checker (coverage, failures, duplicates, base clusters, family drift). Exposed via `pnpm run mixer:health` (full) and `pnpm run mixer:coverage` (quick).
  - `tools/mixer-core/check-language-mixer-guardrails.js` — structural guardrails. Exposed via `pnpm run mixer:guardrails`.
  - `tools/mixer-diagnostics/check-special-families.js` — validate special family mappings.
  - `tools/mixer-diagnostics/report-language-mixer-duplicates.js` — find duplicate mixer entries.
  - `tools/mixer-core/report-language-mixer-name-counts.js` — report name counts per base.
  - `tools/mixer-namebases/report-namebase-duplicates.js` — find duplicate namebase entries.
  - `tools/mixer-races/report-race-language-coverage.js` — race ↔ language coverage analysis. Exposed via `pnpm run mixer:race-coverage`.
  - `tools/mixer-races/list-race-languages.js` — list catalog languages per race.

- **Mixer tooling & orchestrators:**
  - `tools/mixer-core/generate-language-mixer.js` — build/import/update language mixer data. Exposed via `pnpm run generate:language-mixer`.
  - `tools/mixer-core/run-language-mixer-suite.js` — full maintenance pipeline.
  - `tools/mixer-core/diff-language-families.js` — diff family assignments. Exposed via `pnpm run diff:families`.
  - `tools/mixer-core/apply-mixer-deltas.js` — apply delta JSON files to regenerate artifacts. Exposed via `pnpm run mixer:apply-deltas`.
  - `tools/mixer-namebases/dedupe-namebase-duplicates.js` — deduplicate namebase entries.
  - `tools/fixes/fix-language-mixer-mappings.js` — clean and normalize mixer mappings.
  - `tools/mixer-core/dedupe-language-mixer-map.js` — deduplicate mixer map entries.
  - `tools/mixer-diagnostics/clean-language-mixer-map.js` — clean mixer map data.

- **Multi-agent coordination helpers (new vs upstream):**
  - `tools/mixer-diagnostics/create-no-uniq-base-claim.js` — writes claim entries for uniqueness debt tracking.
  - `tools/mixer-diagnostics/decluster-claim.js` — writes decluster claims under a lock.
  - `tools/mixer-diagnostics/find-no-uniq-base-candidates.js` — find candidates lacking unique bases.
  - `tools/mixer-diagnostics/list-no-uniq-base-candidates.js` — list those candidates.
  - `tools/mixer-diagnostics/suggest-unique-base-sets.js` — suggest base set improvements.
  - `tools/mixer-diagnostics/enhance-language-uniqueness.js` — enhance uniqueness across mappings.

- **Race tooling & orchestrators:**
  - `tools/mixer-races/run-race-language-suite.js` — runs `check-race-language-profiles.js`, `list-race-languages.js`, and `report-race-language-coverage.js` in one go. Exposed via `pnpm run mixer:race-suite`.
  - `tools/mixer-races/check-race-language-profiles.js` — validate raceLanguageProfiles invariants.

- **Recommended QA cadence (this fork vs upstream):**
  - Run `pnpm run mixer:health` **after each substantial mixer edit or family batch** (e.g. a Romance or Uralic pass), and at least **once per mixer‑editing session** before committing.
  - Run `pnpm run mixer:race-suite` **after each change to raceLanguageProfiles or race definitions**, and at minimum **before any release** or major world‑building milestone that touches races.

Compared to upstream, this fork includes a **much richer internal toolbox** for keeping language and race data consistent, deduplicated, and well‑covered, plus explicit QA workflows wired into npm scripts.

---

## 7. Miscellaneous Changes

Smaller changes vs upstream include:

- **Documentation:**
  - Top of `README.md` updated with a brief summary of this fork’s goals and links to the new DEVplans docs.
  - 2025-12-18: `README.md` planned section now includes direct links to additional DEVplans docs (heightmap planning, options min–max sliders, races↔cultures decoupling).
- **Local server scripts:**
  - `run_php_server.bat` and `run_python_server.bat` tweaked for local workflow (ports/paths). Behavior is still "start a simple local web server" but tuned for this fork.
- **`package.json`:**
  - Light updates to scripts/dependencies to support the new workflow and tooling (while still remaining a static‑site style project).
- **State name sanitization fix (2025-12-19):**
  - Fixed generation of state names containing unexpected digits and pipe characters (e.g., "Buwal58u5 |Empire", "Kingdom of |Bolze75unia") by adding sanitization logic in `modules/names-generator.js`, `modules/names-mixer.js`, `modules/races.js`, and `modules/cultures-generator.js` to strip digits, |, _unq\d+, _u\d+, and _ from generated names.

- **Heightmap templates:**
  - `config/heightmap-templates.js` is kept at the v1.108-era Azgaar set (14 templates: Volcano, High Island, Low Island, Continents, Archipelago, Atoll, Mediterranean, Peninsula, Pangea, Isthmus, Shattered, Taklamakan, Old World, Fractious). The previously added `Barrier Islands`, `Bay`, and other later templates are not present.

---

## 8. Conceptual Summary

Relative to upstream `master`, this fork focuses on:

- **Deeper world‑building knobs** (races, language diversity, planned Individuals/Underdark/Characters systems).
- **More flexible name generation** via the language mixer and greatly expanded language data.
- **Internal tooling** to keep the above systems maintainable over time.

This document should be updated if/when new large‑scope features land in this branch so downstream users can quickly see what diverges from Azgaar’s original generator.
