# Language Mixer Rules (Authoritative)
_Back to devplan overview: [Changes vs Azgaar overview](Changes-vs-Azgaar-master.md)_

_This document is the **normative rule set** for the language mixer layer itself: what is considered “correct”, what invariants must hold, and what workflows are expected when editing language data. It is intended to prevent re-reverse-engineering and to keep future work consistent._

### Section index

- [0. Scope & non-goals](#0-scope--non-goals)
- [1. Authoritative sources of truth](#1-authoritative-sources-of-truth)
- [2. Core concepts & terminology](#2-core-concepts--terminology)
- [3. Hard invariants (must always hold)](#3-hard-invariants-must-always-hold)
- [4. Quality rules (should hold; tracked as debt if violated)](#4-quality-rules-should-hold-tracked-as-debt-if-violated)
- [5. Standard workflows](#5-standard-workflows)
- [6. Enforcement & tooling](#6-enforcement--tooling)
- [7. Current design choices (open questions)](#7-current-design-choices-open-questions)

---

## 0. Scope & non-goals

**Scope**

- Defines what “correct” means for:
  - `config/language-mixes.json` (mixer catalog)
  - `config/language-mixer-map.json` (ISO → `bases[]` mapping)
  - the generated bundles `config/language-mixes-all.js` and `config/language-mixer-map.js`
  - the runtime mixer API used by the UI (`Names.getMixedByIso`, etc.)
  - helper scripts under `tools/mixer-core/**`, `tools/mixer-catalog/**`, and `tools/mixer-diagnostics/**`

**Non-goals**

- This doc does **not** describe race integration. For race usage of mixer languages, see:
  - [Races & Languages – System Rules](Races-Languages-Rules.md)
- This doc does **not** try to track progress family-by-family. For current status/backlog, see:
  - [Language System Status – Markov & Mixer](Languages-Status.md)

---

## 1. Authoritative sources of truth

### 1.1 Runtime behavior

- **`modules/names-mixer.js`** is the authoritative implementation of the mixer runtime:
  - `Names.getMixedBaseMany(baseIndices, options)`
  - `Names.getMixedByIso(isoWeights, options)`
- **`modules/names-generator.js`** remains the authoritative implementation of the *single base* Markov generator.

### 1.2 Data sources

- **Catalog:** `config/language-mixes.json`
  - Defines which languages appear in the mixer UI and their metadata.
- **Mapping:** `config/language-mixer-map.json`
  - Defines how each `iso` resolves to local namebases (`bases[]`).

### 1.3 Generated bundles

The browser prefers the JS bundles below (loaded into `window.*`):

- `config/language-mixes-all.js` → `window.languageMixerCatalog`
- `config/language-mixer-map.js` → `window.languageMixerMap`

These are **derived artifacts** and must be regenerated after any catalog/map edits.

---

## 2. Core concepts & terminology

- **ISO**
  - In this project, `iso` is an identifier key for a mixer language. It is often a real ISO code (e.g. `rus`) but can also be a synthetic project key (e.g. `-foo-dialect`).
- **Catalog entry**
  - A row in `config/language-mixes.json`, with fields like:
    - `name`, `iso`, `region`, `category`, `family`, optional `lexifier`, optional `tags`, optional `wikipedia`
- **Mapping entry**
  - A row in `config/language-mixer-map.json`:
    - `{ "iso": string, "bases": number[] }`
- **Base / namebase / base index**
  - A Markov seed source defined in `modules/namebases-*.js`, referenced by numeric index `i`.
- **Family macro (catalog-only concept)**
  - Some catalog entries are *organizational macros* and are marked with `tags: ["family"]`.
  - These are expected to be skipped by the UI and by “failure” checks.
- **Uniqueness debt**
  - Cases where two or more distinct mixer languages share the same `bases[]` set.
  - This is considered temporary debt to be burned down, not an acceptable end-state.

---

## 3. Hard invariants (must always hold)

### 3.1 Append-only registries (no deletion)

- `config/language-mixes.json` and `config/language-mixer-map.json` are **append-only language registries**.
- Once an `iso` exists in either file, it must **not be deleted**.
- If an earlier revision had an ISO that is now missing, treat it as **data loss** and restore it from history.

### 3.2 Mapping determinism

- A given `iso` must have **one effective mapping** to `bases[]`.
- Duplicate ISO rows in `config/language-mixer-map.json` are not allowed (or must be resolved immediately).

### 3.3 Base index validity

- Every number in any `bases[]` array must correspond to a real base index present in `modules/namebases-real.js`, `modules/namebases-fantasy.js`, or `modules/namebases-creole.js`.
- A mapping entry with `bases: []` is treated as **broken** for local generation (allowed only as a temporary “unresolved placeholder” during triage, but it must be fixed before considering the work complete).

### 3.4 Catalog/map consistency expectations

- Every **non-family** catalog entry (no `tags: ["family"]`) is expected to have a usable mapping entry.
  - If not, that’s a correctness failure for local generation.

### 3.5 Tooling safety baseline

- Any script that rewrites the catalog or map must preserve the append-only invariant.
- If a helper script would drop an existing ISO during a rewrite, it must **refuse to write**.

### 3.6 No-rollback decision gate (process rule)

- No work may be discarded or rolled back unless the user explicitly instructs a revert/restore with an exact file list.
- If a change looks like “churn” (e.g., UTF-8 BOM, CRLF, timestamps), the only allowed responses are:
  - Fix encoding/format **in-place** without removing content, or
  - Keep it as-is and continue, or
  - Leave it uncommitted and ask the user what to do.
- Commits are owned by the user/integrator. Agents must not run or propose `git commit`; instead provide a handoff (files changed, suggested commit messages, and staging guidance).

---

## 4. Quality rules (should hold; tracked as debt if violated)

### 4.1 Per-language uniqueness goal

- Goal: no two distinct mixer languages should share an identical `bases[]` array.
- If identical sharing exists, it must be treated as **uniqueness debt** and burned down over time by introducing new dedicated bases

### 4.1b Option 2: per-language globally-unique base index ("unique words" anchor)

- In addition to `bases[]`-set uniqueness, each **non-family** mixer language should have at least one **globally unique base index** (an `i` value referenced by exactly one non-family ISO in `config/language-mixer-map.json`).
- Rationale: related languages can share ingredients, but each language should still have a dedicated anchor representing words / spellings / phonotactics that are unique to that language.
- Practical implementation pattern:
  - Add a dedicated namebase in `modules/namebases-real.js` with a new unique `i`.
  - Append that `i` to the language’s `bases[]` mapping.

Important nuance:

- A base index being globally unique guarantees a unique *pointer*.
- To better match the “unique words” intent, the dedicated base’s seed list (`b`) should ideally include at least some language-specific seed items (i.e., not only reusing seed strings that already exist in other bases). If this is not possible immediately, a derived seed list (copied/curated from the language’s existing mapped bases) is acceptable as a placeholder, but should be treated as quality debt until language-specific seeds are introduced.

Compliance thresholds for the dedicated base seed list:

- **Strict uniqueness:** at least **1** seed token that is unique to the ISO under strict string equality.
- **Normalized uniqueness:** at least **10** seed tokens that are unique to the ISO after normalization.
  - Normalization is defined as: lowercasing + removing diacritics + removing whitespace/punctuation (letters/numbers preserved).

Enforcement posture:

- These seed-uniqueness thresholds are an explicit **quality goal** and are tracked as **uniqueness debt** while the repo is being declustered.
- They are **not** currently enforced as a suite “hard gate”.
- To measure current compliance and track progress, use:
  - `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --only-failures`

### 4.2 Linguistic plausibility

- `bases[]` should be individually plausible (for each individual language/dialect) with respect to:
  - region,
  - linguistics,
  - known lexifiers / contact influences (especially for creoles and mixed languages).

### 4.3 Catalog metadata consistency

- Catalog fields should be consistent and usable for filtering:
  - `region` should be set (unless truly unknown)
  - `category` should be set
  - `family` should be set (can equal `category` if no finer family is known)
- Avoid ambiguous naming collisions in the catalog; if two entries would display the same name, disambiguate in `name` (e.g. `(alias)`, `(macro entry)`, `(native-speakers subset)`), without deleting entries.

### 4.4 “Finish the wiring” expectation

- When adding new languages, prefer fully wiring them so they are actually usable:
  - catalog entry + mapping entry + bundle regeneration + health checks.
- Avoid leaving large batches half-present in the catalog with no mapping unless the explicit goal of that batch is triage.

---

## 5. Standard workflows

All commands should be run from the repo root. Prefer **pnpm**.

### 5.1 Add or import languages (normal case)

1. Add or update catalog entries in `config/language-mixes.json`.
2. Add or update mapping entries via delta files under `tools/mixer-deltas/*.json`:
  - Use `dedicatedPins` and/or `appendBases` for incremental changes.
  - Use `setBases` (alias: `replaceBases`) when you need an exact `bases[]` array (declustering).
3. Apply deltas (writes committed artifacts + regenerates bundles):
  - `pnpm run mixer:apply-deltas`
4. Verify failures/coverage are acceptable for the batch:
  - `pnpm exec -- node tools/mixer-core/check-language-mixer-coverage.js`
  - `pnpm exec -- node tools/mixer-core/check-language-mixer-failures.js`
5. Only run `run-language-mixer-suite.js` if explicitly requested (it can cause cross-worker churn by rewriting mappings).

### 5.2 Fix “catalog has entries missing from map”

1. Run:
   - `pnpm exec -- node tools/mixer-core/check-language-mixer-coverage.js`
   - `pnpm exec -- node tools/mixer-core/check-language-mixer-failures.js`
2. If the missing mappings are expected to be auto-inferrable, run:
   - `pnpm exec -- node tools/mixer-core/fix-language-mixer-mappings.js`
3. For any remaining unresolved ISOs:
   - Add `iso -> base` under `dedicatedPins` in `tools/mixer-deltas/*.json`
   - Run `pnpm run mixer:apply-deltas`
   - Dedicated pins are compiled into `tools/mixer-deltas/_compiled-dedicated-pins.json` and loaded automatically by `tools/mixer-core/fix-language-mixer-mappings.js`.

### 5.3 Preserve intended mappings against auto-fix rewriting

- If `fix-language-mixer-mappings.js` (or a suite run) repeatedly rewrites a manually curated `bases[]` back to a generic default:
  - add an explicit override to `tools/mixer-core/fix-language-mixer-mappings.js`:
    - `explicitIsoBasesMap` for multi-base mixes, or
    - `explicitIsoBaseMap` for single-base mappings
  - include any related alias/subset ISOs that get “normalized” to match it.
  - Re-run `pnpm run mixer:apply-deltas` to ensure committed artifacts are regenerated.

- Safety note (2025-12-14): `tools/mixer-core/fix-language-mixer-mappings.js` will refuse to write `config/language-mixer-map.json` if any ISO pinned in `explicitIsoDedicatedBaseMap` would end up missing its pinned dedicated base, or if the pinned base index does not exist in the valid namebase indices.

- Pin early (multi-agent safe): if you assign a dedicated base index to any ISO, add it via a delta file:
  - Add `iso -> base` under `dedicatedPins` in `tools/mixer-deltas/*.json`
  - Run `pnpm run mixer:apply-deltas`
  - Dedicated pins are compiled into `tools/mixer-deltas/_compiled-dedicated-pins.json` and loaded automatically by `tools/mixer-core/fix-language-mixer-mappings.js`.

### 5.4 Burn down uniqueness debt (declustering)

1. Use the base cluster report to find collisions:
   - `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-base-clusters.js`
2. For each cluster, choose a strategy:
  - Add a dedicated base (new index) if the language deserves a stable anchor.
  - Otherwise adjust `bases[]` mixes to be unique *and* plausible.
3. Apply the mapping changes via delta `setBases` (and/or `dedicatedPins`) and run:
  - `pnpm run mixer:apply-deltas`
4. Re-run diagnostics to confirm the collision is gone.

### 5.5 Quick manual sanity checks (optional but recommended)

- Use the sample generator to spot-check new mappings:
  - `pnpm exec -- node tools/mixer-core/generate-language-samples.js --iso=<iso> --per-base=10 --seed=1`
- For blending quality regressions:
  - `pnpm exec -- node tools/mixer-core/compare-mixer-nextgen-to-app.js --iso=<iso> --count=40 --seed=1`
- Track seed-uniqueness goal compliance (explicit goal, not a suite hard gate):
  - `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --only-failures`

### 5.6 Multi-agent `NO_UNIQ_BASE2` guardrails (status)

- Use `.windsurf/workflows/no-unique-base2.md` as the canonical checklist.
- During that workflow: do **not** run `git` commands, and do **not** paraphrase the workflow into “equivalent” commands.
- Prefer `pnpm exec -- node ...` invocation form so script arguments are not swallowed by pnpm.
- Prefer a diagnostic-first worker loop (suite last):
  - `pnpm run mixer:guardrails`
  - batch-scoped `report-language-mixer-seed-uniqueness.js --only-failures --only-isos=...`
  - `check-language-mixer-coverage.js` + `check-language-mixer-failures.js`
  - then `run-language-mixer-suite.js --no-wiki-devplan`
- If `fix-language-mixer-mappings.js` fails-fast due to missing dedicated base definitions, restore/add the missing base indices in `modules/namebases-*.js` before proceeding.

---

## 6. Enforcement & tooling

Primary entry points:

- `tools/mixer-core/run-language-mixer-suite.js`
  - The main “do the right things” runner (fix → coverage → failures → generate bundles).
- `tools/mixer-core/run-language-mixer-health.js`
  - Read-only health snapshot (diff families, coverage, failures, duplicate names, base clusters).

Core checks:

- `tools/mixer-core/check-language-mixer-coverage.js`
- `tools/mixer-core/check-language-mixer-failures.js`
- `tools/mixer-diagnostics/check-language-mixer-map-duplicate-isos.js`
- `tools/mixer-diagnostics/report-language-mixer-base-clusters.js`
- `tools/check-language-mixer-map-inconsistencies.js`

Guardrails:

- `pnpm run mixer:guardrails` (fails on UTF-8 BOM in key JSON files and refuses changes that would drop existing ISOs vs `HEAD`)

Reference index:

- `tools/HELPER-TOOLS.md` is the canonical “what script does what” index.

---

## 7. Design choices

- **Strict uniqueness vs historically acceptable clusters**
  - Policy here is strict: identical `bases[]` sharing is treated as debt.
  - Keep pushing toward zero identical collisions
  - Each language should have at least one base *that is unique to it*
  - Any bases shared between languages should be considered *additional* for the purpose of *expansiveness* but still be treated to nearly just as high standards of linguistic accuracy and precision

- **Dedicated base creation threshold**
  - Always prioritize expressing uniqueness through new bases dedicated individually towards linguistic accuracy to the best of the ability online research and knowledge allows.

- **Family macro semantics**
  - `tags: ["family"]` entries are required to have mappings, these will be used later.

- **How “synthetic ISO keys” should be formatted**
  - Naming rules for synthetic ISO keys should be formalized as `["language"]` an if there are multiple languages with distinctive names, `["language"]-["family"]`