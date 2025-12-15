# Changes vs Azgaar `master`

This document summarizes the main differences between this fork (branch `Burgers-Stuff-He-Did-To-Azgaars`) and upstream `Azgaar/Fantasy-Map-Generator` `master` as of the latest merge base.

The goal is to give a quick orientation for what has been added or changed, without duplicating all commit messages.

## Table of contents

- [1. High‑Level Overview](#1-high-level-overview)
- [2. New Planning & Design Documents](#2-new-planning--design-documents)
- [3. Language Mixer & Language Data](#3-language-mixer--language-data)
- [4. Fantasy Race System](#4-fantasy-race-system)
- [5. AI Text Generator & Namesbase Integration](#5-ai-text-generator--namesbase-integration)
- [6. UI & UX Adjustments](#6-ui--ux-adjustments)
- [7. Helper Tools & Maintenance Scripts](#7-helper-tools--maintenance-scripts)
- [8. Miscellaneous Changes](#8-miscellaneous-changes)
- [9. Conceptual Summary](#9-conceptual-summary)

---

## 1. High‑Level Overview

- **Language mixer system** for building synthetic languages and name sets by mixing real languages via the existing Markov generator.
- **Fantasy race system** integrated with cultures and map generation.
- **AI text generator integration** (OpenAI / Anthropic / Gemini / Ollama) wired into the UI and synced with the Namesbase editor.
- **Planning documents** for future systems: Underdark, Individuals, and Character generation.
- **Extensive language & namebase expansions** plus a toolbox of helper scripts for maintaining language mappings, coverage, and data quality.
- **Minor UI and tooling adjustments** to surface the above features.

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

- Mixer objective tuning (helper tooling): `tools/mixer-core/compare-mixer-nextgen-to-app.js` includes a set of experimental syllable-linguistic mixer variants (v17–v19) focused on improving realism metrics (seed-corpus trigram `bpc/ppl/js`) while preserving novelty (low `copy`). v20 was attempted and then removed; v19 is the current best-performing / stable cap.

  App test wiring (non-default): `modules/names-mixer.js` supports opting into the v19 mixed-name generator via `?mixer=v19` (or `localStorage.fmg-mixer-version = "v19"`). Defaults remain unchanged unless the override is set.

  Verified snapshot (seed=420, base=1-20, count=50):

  `syllLing_v19_realismObjective_lowPpl_lowJs: bpc=3.509 ppl=11.39 js=0.1671 oov=0.00% copy=0/50 (0.0%)`

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

## 5. AI Text Generator & Namesbase Integration

New AI workflow for generating descriptive text directly inside the app:

- **New UI module:**
  - `modules/ui/ai-generator.js` – central AI dialog and request pipeline.
- **Supported providers & models:**
  - OpenAI (Chat Completions; e.g. `gpt-4o-mini`, `gpt-4o`, etc.).
  - Anthropic (Messages API; several Claude models).
  - Google Gemini (models like `gemini-1.5-flash-latest`, with optional web access).
  - Ollama (local models via the Ollama HTTP API).
- **Features:**
  - Streaming responses with a shared system prompt ("I’m working on my fantasy map.").
  - Per‑provider API key storage in `localStorage`.
  - Temperature and model selection with persistence.
  - Optional **web access toggle** for Gemini requests.

**Namesbase editor integration:**

- The AI dialog’s controls synchronize with the Namesbase editor’s AI controls (model, key, temperature, web‑access flag), so both UIs share configuration.

Compared to upstream, this fork adds a full **multi‑provider AI text generation pipeline** and related UI.

---

## 6. UI & UX Adjustments

Selected UI changes on top of upstream behavior:

- **Burgs overview:**
  - `modules/ui/burgs-overview.js` enhanced with more grouping options (e.g. by state/language, culture/language, etc.) and improved legend / layout to better visualize language & race distributions.

- **Namesbase editor & tools wiring:**
  - `modules/ui/namesbase-editor.js`, `modules/ui/editors.js`, `modules/ui/tools.js`, `modules/ui/hotkeys.js`, and `modules/ui/layers.js` touched to:
    - Expose the language mixer, race editor, and AI generator.
    - Add or adjust hotkeys and layer visibility related to the new systems where appropriate.

- **Page shell / bootstrapping:**
  - `index.html`, `main.js`, and `old_index.html` updated to include the new dialogs/scripts and keep a copy of the old layout for reference.

These changes are mostly **additive wiring** for new systems; core map editing UX from upstream remains recognizable.

---

## 7. Helper Tools & Maintenance Scripts

A large set of maintenance scripts under `tools/` has been added or expanded. Highlights include:

- **Language family & mapping maintenance:**
  - `add-african-languages.js`, `add-trans-new-guinea-mixer.js`, `update-*.js` for specific families (Afroasiatic, Austroasiatic, Austronesian, Dravidian, Indo‑Aryan, Kartvelian, Niger‑Congo, Romance, Turkic, Uralic, etc.).
  - `fill-all-missing-mixes.js`, `fill-family-mixes.js`, `fill-mongolic-mixes.js`, `fill-sino-tibetan-mixes.js`, etc., to auto‑populate language mixer entries.

- **Quality & coverage reports:**
  - `check-language-mixer-coverage.js`, `check-special-families.js`.
  - `report-language-mixer-duplicates.js`, `report-language-mixer-name-counts.js`, `report-namebase-duplicates.js`.
  - `report-race-language-coverage.js`, `report-per-race-language-coverage.js`, and `report-race-language-palettes.js` to compare race profiles with language availability and palette breadth.

- **Mixer tooling & orchestrators:**
  - `generate-language-mixer.js` and `run-language-mixer-suite.js` to build/import/update language mixer data and run a full maintenance pipeline.
  - `run-language-mixer-health.js` as a **read‑only diagnostics orchestrator** (family drift, coverage, mapping failures, duplicate languages, base clusters). Exposed via the `mixer:health` npm script.
  - `dedupe-namebase-duplicates.js` and `fix-language-mixer-mappings.js` to clean and normalize data.

- **Multi-agent coordination helpers (new vs upstream):**
  - `tools/mixer-diagnostics/no-uniq-base-claim.js` (writes/updates `tools/mixer-diagnostics/_no_uniq_base_claims.json` under a lock)
  - `tools/mixer-diagnostics/decluster-claim.js` (writes/updates `tools/mixer-diagnostics/_decluster_claims.json` under a lock)
  - Workflows under `.windsurf/workflows/`, notably:
    - `no-unique-base2.md` (verification + handoff checklist)
    - `single-integrator-lane.md` (artifact regeneration discipline)

- **Race tooling & orchestrators:**
  - `run-race-language-suite.js` to run `check-race-language-profiles.js`, `report-per-race-language-coverage.js`, `report-race-language-coverage.js`, and `report-race-language-palettes.js` in one go. Exposed via the `mixer:race-suite` npm script.

- **Recommended QA cadence (this fork vs upstream):**
  - Run `pnpm run mixer:health` **after each substantial mixer edit or family batch** (e.g. a Romance or Uralic pass), and at least **once per mixer‑editing session** before committing.
  - Run `pnpm run mixer:race-suite` **after each change to raceLanguageProfiles or race definitions**, and at minimum **before any release** or major world‑building milestone that touches races.

Compared to upstream, this fork includes a **much richer internal toolbox** for keeping language and race data consistent, deduplicated, and well‑covered, plus explicit QA workflows wired into npm scripts.

---

## 8. Miscellaneous Changes

Smaller changes vs upstream include:

- **Documentation:**
  - Top of `README.md` updated with a brief summary of this fork’s goals and links to the new DEVplans docs.
- **Local server scripts:**
  - `run_php_server.bat` and `run_python_server.bat` tweaked for local workflow (ports/paths). Behavior is still "start a simple local web server" but tuned for this fork.
- **`package.json`:**
  - Light updates to scripts/dependencies to support the new workflow and tooling (while still remaining a static‑site style project).
- **Save/load format extensions:**
  - Save format supports extra trailing lines for additional data. In particular, newer saves can include `pack.races` and optionally `pack.cells.race`.

- **Heightmap templates:**
  - Added a new procedural `Barrier Islands` heightmap template in `config/heightmap-templates.js`, exposing a coastal layout with offshore barrier chains alongside the existing island/continent templates.
  - Added a new procedural `Bay` heightmap template in `config/heightmap-templates.js`, shaping a semi-enclosed sea with land-wrapped coasts and a narrow outer opening.

---

## 9. Conceptual Summary

Relative to upstream `master`, this fork focuses on:

- **Deeper world‑building knobs** (races, language diversity, planned Individuals/Underdark/Characters systems).
- **More flexible name generation** via the language mixer and greatly expanded language data.
- **AI‑assisted content creation** integrated directly into the UI.
- **Internal tooling** to keep the above systems maintainable over time.

This document should be updated if/when new large‑scope features land in this branch so downstream users can quickly see what diverges from Azgaar’s original generator.
