# Softmods – Planned Loader Design

_Back to devplan overview: [Changes vs Azgaar overview](Changes-vs-Azgaar-master.md)_

Developer-facing sketch of a **softmod** system that can import bundles of data
(races, languages, palettes, presets, etc.) from a single file, without
hard-wiring them into the core app. Arcana Unearthed (AU) content has been
moved into `mods/arcana-unearthed/` as the first example payload.

---

## 1. Goals

- Allow users to **drop in** a single data file (or small folder) that defines:
  - Fantasy races and their namebase mappings.
  - Race–language palettes.
  - Race-set contributions (which themed presets they join).
  - Future: languages, cultures, states, history seeds, icons, etc.
- Keep the **core app**:
  - Legally safer (no 3PP IP wired by default).
  - Stable and testable without any mods present.
- Make it easy to:
  - Enable/disable a mod for a given world.
  - Inspect what a mod defines.

---

## 2. Data format for a softmod bundle

Initial plan: **one or more JS modules per mod** (Node/JS friendly), e.g.
`mods/arcana-unearthed/races-au.js`, exporting a single object like:

```js
{
  races: ["Loresong Faen", ...],
  fantasyRaceBases: {RaceName: [baseIds...]},
  raceLanguageProfiles: {RaceName: {categories:[], families:[]}},
  raceSetContributions: {presetName: [RaceName, ...]},
  raceExpansionismBase: {RaceName: baseMultiplier},
  modMetadata: {...},            // optional per-mod metadata
  cultureSeeds: [...],           // optional culture blueprints
  stateSeeds: [...],             // optional state / polity blueprints
  historySeeds: [...],           // optional history-event templates
  // later: languages, standalone culture packs, icons, etc.
}
```

AU’s extracted file (`mods/arcana-unearthed/races-au.js`) already follows this
pattern under the names:

- `auRaces`
- `auFantasyRaceBases`
- `auRaceLanguageProfiles`
- `auRaceSetContributions`
- `auRaceExpansionismBase`

A future **mod bundler** can wrap these into a single export.

Current loader prototype (Node-only, see `tools/softmods/softmod-race-loader.js`)
expects **race bundles** to live under each enabled mod directory as
`mods/<modId>/races*.js` files. Every such file is required and normalized as a
race bundle; multiple bundles per mod are merged together before being applied
to the core race data.

For **languages**, a parallel Node-only prototype (`tools/softmods/softmod-language-loader.js`)
expects optional **language bundles** under each mod as `mods/<modId>/languages*.js` files.
Each such file may export:

- `languagesCatalog` – an array of catalog entries compatible with
  `config/language-mixes.json` (fields like `iso`, `name`, `category`,
  `family`, `region`, `tags`, etc.).
- `languagesMap` – an array of mixer-map entries compatible with
  `config/language-mixer-map.json` (objects with `iso` and `bases[]`).
- `postMixedLanguages` – optional high-level language descriptors for
  **post-mixed use** (fields like `id`, `name`, `baseIso`, `tags`), intended
  for future culture/state/history integration.

The language loader merges these into in-memory copies of the base catalog and
mixer-map with the same safety rules as races: core entries win on `iso`
collisions, and mod entries only ever **add** new languages/isomaps. A test
CLI (`tools/softmods/test-softmods-languages.js`) demonstrates this behavior
using the Blue Rose dummy mod (which defines `languages-blue-rose.js`).

---

## 3. Loader entry points

Planned loading points in the existing codebase:

- **Races** (`modules/races.js`):
  - Before using `fantasyRaceBases`, `raceLanguageProfiles`, and
    `getRacesSetFilter`, call a `loadSoftmods()` hook that:
    - Scans `mods/**/` for enabled bundles.
    - Merges their `fantasyRaceBases` into the core map (checking for name
      collisions).
    - Merges `raceLanguageProfiles` (overlays or warns on conflicts).
    - Extends `getRacesSetFilter` by adding mod races to existing presets or
      defining new presets.
    - Applies `raceExpansionismBase` overrides when creating new races.

- **Languages** (`config/language-*.json`, mixer tools, `modules/language-softmods.js`):
  - A browser-side hook (`window.applyLanguageSoftmods`) can extend the
    preloaded language catalog (`window.languageMixerCatalog`) and
    mixer-map (`window.languageMixerMap`) with mod-defined languages and
    mappings, plus optional `window.postMixedLanguages` descriptors, by merging
    bundles exported from Node-only tooling.
  - The hook is defined but not invoked by default; future builds can pass in
    a `window.languageSoftmodBundles` array and call the helper during app
    initialization when it is legally and structurally safe to do so.

The loader should be **idempotent** per world init: load once, cache the merged
structures, avoid double-adding races or languages.

---

## 4. Enabling / disabling mods

Short-term plan (developer-facing):

- A small JSON config, e.g. `mods/mods.json`:

```json
{
  "enabled": ["arcana-unearthed"]
}
```

- Loader resolves `mods/<modId>/*.js` and imports or ignores them accordingly.

Long-term plan (UI-facing):

- A **Mods** section in the options UI:
  - List discovered mods (+ basic metadata from each bundle).
  - Checkboxes to enable/disable per world.
  - Display conflicts or warnings (e.g. two mods defining the same race name).

---

## 5. Safety & conflicts

- **Name collisions**:
  - If a mod defines a race that already exists in core, prefer **core** and
    log a warning, unless an explicit "override" flag is present in the mod.

- **Expansionism & palettes**:
  - If both core and a mod define `raceLanguageProfiles[race]`, either:
    - Merge (union categories/families), or
    - Prefer mod and log that the palette was overridden.

- **Failure modes**:
  - If a mod bundle fails to load or validate, the loader should:
    - Skip that mod.
    - Log an error to console / dev tools.
    - Continue with remaining mods and core data.

---

## 6. Current status

- All Arcana Unearthed race data has been **extracted from core** into
  `mods/arcana-unearthed/races-au.js` and is **not wired** into `modules/races.js`
  or the races UI.
- Core race behavior and presets now function **without** any AU content.
- This file documents the intended future step: a generic softmod loader that
  can read bundles like the AU file and merge them into the live data model
  (races, languages, etc.) on demand.

---

## 7. Arcana Unearthed mod scope (Choice 2)

For this fork, Arcana Unearthed lives purely as a **softmod example** with the
following scope:

- **Included races** (11 total):
  - `Loresong Faen`, `Quickling Faen`, `Spryte`
  - `Litorian`, `Mojh`, `Sibeccai`, `Verrik`
  - `Dramojh`, `Ratmen`, `Chorram`, `Shadow Troll`
- **Included data in `mods/arcana-unearthed/races-au.js`:**
  - Namebase mappings (`auFantasyRaceBases`).
  - Race–language palettes (`auRaceLanguageProfiles`).
  - Race-set contributions (`auRaceSetContributions`), defining:
    - An AU-only set `arcanaUnearthed` that contains all AU races.
    - Blended additions into existing presets: `dark`, `primal`, `planar`,
      `fey`, `beastfolk`, `underdark`.
  - Expansionism tweak values (`auRaceExpansionismBase`) for Dramojh, Ratmen,
    Chorram, and Shadow Troll.
  - Additional AU metadata and seeds exported as:
    - `auModMetadata` – id/label/tags/license info for the AU bundle.
    - `auCultureSeeds` – culture blueprints keyed to AU races.
    - `auStateSeeds` – example AU-flavored polities.
    - `auHistorySeeds` – high-level history events (Dramojh fall, Diamond
      Throne rise, etc.).

**Out of scope for this AU mod (for now):**

- AU-specific **languages, cultures, states, history templates, or UI presets**.
- Any wiring of AU content into **core code** (`modules/races.js`, the main UI,
  or save formats) until a generic softmod loader exists.

Implementation detail: the entire `mods/` folder is listed in `.gitignore`, so
AU content remains **user-local** and is not shipped as part of public builds.
