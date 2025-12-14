# Races & Languages – System Rules
_Back to devplan overview: [Changes vs Azgaar overview](Changes-vs-Azgaar-master.md)_

_Developer-facing summary of how fantasy races are defined, how they attach to cultures / world data, and how they select languages via the Markov mixer._

### Section index

- [0. Scope & goals](#0-scope--goals)
- [1. Core race definitions](#1-core-race-definitions)
- [2. From cultures to races](#2-from-cultures-to-races)
- [3. Race expansionism](#3-race-expansionism)
- [4. Race propagation through world data](#4-race-propagation-through-world-data)
- [5. Race language palettes & Markov mixer](#5-race-language-palettes--markov-mixer)
- [6. Visualization & analysis tools](#6-visualization--analysis-tools)
- [7. Integration with Individuals, Characters, and Evolving Simulation](#7-integration-with-individuals-characters-and-evolving-simulation)
- [8. Summary](#8-summary)
- [9. Current design choices](#9-current-design-choices)

---

## 0. Scope & goals

- **Describe the current, implemented rules** for:
  - What a “race” is in data terms.
  - How races are inferred from cultures and propagated to states / provinces / burgs / religions / cells.
  - How each race’s **language palette** is defined and used to generate names.
- This file is **descriptive**, not normative: it documents current behavior in this fork.

Key files:

- `modules/races.js`
- `modules/ui/burgs-overview.js`
- `config/language-mixes.json`
- `config/language-mixer-map.json`
- `tools/mixer-races/*.js`
- [Language mixer helper tools & workflows](../tools/HELPER-TOOLS.md)  especially the `mixer-races` QA helpers (`check-race-language-profiles.js`, `report-race-language-coverage.js`, `report-per-race-language-coverage.js`, `report-race-language-palettes.js`, `list-race-languages.js`).
- [Individuals System – Developer Guide](Individuals.md), [Characters System – Developer Guide](Characters.md), [Evolving Simulation – Developer Guide](Evolving-Simulation.md), [Evolving Simulation – Design Choices](Evolving-Simulation-Choices.md)

At a high level:
- [Language System Status – Markov & Mixer](Languages-Status.md) tracks the underlying language bases, mixer mappings, and tuning tools.
- This file explains how fantasy races sit on top of that language layer and how race + language tags are exposed to Individuals, Characters, and the Evolving Simulation.
- You should be able to understand race behaviour from this file alone; the other devplans are optional deep dives when you need more context.

---

## 1. Core race definitions

### 1.1 Race records in `pack.races`

- Races are stored in `pack.races` as objects with at least:
  - `i`: numeric race id (0 = `None`).
  - `name`: human-readable race name (e.g. `Elf`, `Orc`).
  - `color`: representative color, usually borrowed from a culture using that race.
  - `expansionism`: numeric factor controlling how aggressively the race’s cultures spread.
- Index `0` is always a sentinel race:
  - `i = 0`, `name = "None"`.
  - Used when a culture / state / province / burg / religion / cell has **no race** or falls back.

### 1.2 Fantasy race → namebase mapping (`fantasyRaceBases`)

- `modules/races.js` defines:

  ```js
  const fantasyRaceBases = {
    Human: [32],
    Elf: [33],
    "Dark Elf": [34],
    Dwarf: [35],
    Goblin: [36],
    Orc: [37],
    Giant: [38],
    Draconic: [39],
    Arachnid: [40],
    Serpent: [41],
    Halfling: [43],
    // ... many more fantasy races ...
  };
  ```

- Each entry maps a **race name** to one or more **namebase indices** (integers) into the global `nameBases[]` array (see `namebases-*.js`).
- These indices serve two roles:
  - **Race inference**: which race a culture “belongs to” (see §2).
  - **Fallback fantasy language**: what language to use when Markov mixing is unavailable (see §5.1, §5.4).

Design implication:

- The fantasy namebases are the **canonical bridge** between cultures and fantasy races.
- If you change `fantasyRaceBases`, you change both:
  - which cultures map to which races, and
  - what fallback language a race uses when mixer-based generation fails.

### 1.3 Language base uniqueness intent

- At the level of the **language mixer** and **namebases**, the long-term design intent is that each non-sentinel language (ISO entry or synthetic mixer language) has a **dedicated, linguistically appropriate base**: for a normal, non-hybrid language this usually means a **single-base** `[X]` array whose Markov chain is tuned to that language’s own seeds.
- Multi-base `[X,Y,...]` mixes are primarily reserved for **genuinely hybrid / contact / creole / mixed** languages and for a small number of explicitly broad macro entries; even then, each such language must still end up with a **globally unique** `bases[]` set.
- Bases and mixes should reflect the language’s own **family, region, and cultural context**, not generic or unrelated sources.
- In intermediate states, shared bases or heavy reuse may appear (e.g. while wiring new families or lexifier hubs), but under the current design these are always treated as **temporary per-language uniqueness debt**, not acceptable long-term behavior: in the end-state, no two languages should share an identical `bases[]` set, even when they are historically related.
- Paying down this uniqueness debt will routinely involve **introducing new bases** (for example, by splitting over-broad macro hubs into multiple more precise bases) in addition to reassigning mixes; those base-creation steps are coordinated with the language devplans rather than being left as perpetual shared clusters.
- All the race and culture mapping described in this document assumes that these underlying bases are accurate; passes over `language-mixer-map.json`, `language-mixes*.json`, and the mixer QA tools are used to enforce this over time by surfacing and burning down shared-base clusters.

Seed-uniqueness posture:

- The language layer also tracks seed-uniqueness thresholds as an explicit **quality goal** (tracked as debt while declustering), and they are **not** enforced as a suite “hard gate”.
- To measure current compliance and track progress, use:
  - `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --only-failures`

Routine checks:
- Seed-uniqueness goal compliance (explicit goal, not a suite “hard gate”):
  - `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --only-failures`

---

## 2. From cultures to races

### 2.1 Cultures and their language base

- Each culture in `pack.cultures` has a `base` field:
  - `culture.base` is an integer index into `nameBases[]`.
  - This determines the default Markov base for `Names.getCulture(cultureId)` and for labels.
- The race system treats this same `base` as an indicator of **which fantasy race** the culture feels like.

### 2.2 `getRaceNameForCulture(culture)`

- The function in `modules/races.js`:

  ```js
  function getRaceNameForCulture(culture) {
    if (!culture || !culture.i || culture.removed) return null;
    const base = culture.base;

    for (const [raceName, bases] of Object.entries(fantasyRaceBases)) {
      if (bases.includes(base)) return raceName;
    }

    return "Human";
  }
  ```

- Rules:
  - If the culture is invalid or removed → no race (`null`), later treated as race `0`.
  - Otherwise, look for the **first race** whose `fantasyRaceBases[raceName]` contains this `culture.base`.
  - If none match, the culture’s **default race** is `"Human"`.

Interpretation:

- A culture’s base name style is the **primary signal** for its fantasy race.
- "Human" is the catch-all for:
  - cultures that use generic human-like namebases.
  - any culture whose base isn’t explicitly mapped to a non-human race.

### 2.3 Race availability filters (`getRacesSetFilter` + `racesSet` UI)

- The UI exposes a `racesSet` selector with values like `classic`, `dark`, `primal`, `planar`, `eberron`, `fey`, `beastfolk`, `underdark`, `undead`, etc.
- `getRacesSetFilter(value)` returns a `Set` of **race names** permitted for that theme.
- Additionally, the `racesNumber` UI field can constrain the **maximum number of non-human races**.

Behavior in `initializeRacesForExpansion(options)`:

1. Determine whether this is the **first** race initialization for the world:
   - `isFirstInitialization = existingRaces.length <= 1`.
2. Compute whether the UI filters should be applied:
   - `forceFilterFromUi = !!(options && options.forceFilterFromUi)`.
   - `shouldApplyFilter = isFirstInitialization || forceFilterFromUi`.
3. If `shouldApplyFilter` is true:
   - Read `racesSet` → optional set of allowed race names.
   - Read `racesNumber` → `maxNonHumanRaces` (or `Infinity` if 0 / not set).
4. Build `allowedRaces` when `shouldApplyFilter` is true:
   - If a `racesSet` is chosen and `maxNonHumanRaces` is unlimited → `allowedRaces = racesSetFilter`.
   - If `maxNonHumanRaces` is finite:
     - Scan all cultures, compute `raceNeedCounts[raceName]` by counting how many cultures **would** use that race.
     - Sort races by count descending.
     - Keep only the top `maxNonHumanRaces` non-human races.
     - `allowedRaces` becomes that subset.
5. When assigning a culture’s race while `shouldApplyFilter` is true:
   - Start from `raceName = getRaceNameForCulture(culture)`.
   - If `raceName` is non-human and not in `allowedRaces` → **forced to `"Human"`**.

Later initializations:

- Existing `pack.races` entries are preserved (id, name, color, expansionism) and reused.
- New races are only introduced as needed for cultures that don’t yet have a race entry.

Typical callers:

- **New map generation**: calls `initializeRacesForExpansion()` once during the main pipeline; this is treated as first initialization and therefore always applies the current `racesSet` / `racesNumber` filters.
- **Races Editor → Recalculate**: calls `initializeRacesForExpansion({forceFilterFromUi: true})` before `Cultures.expand()` and `assignRaces()` so that changes to `racesSet` / `racesNumber` are re-applied.
- **Tools → Regenerate Cultures**: calls `initializeRacesForExpansion({forceFilterFromUi: true})` between `Cultures.generate()` and `Cultures.expand()`.
- **Cultures Editor → Recalculate Cultures**: calls `initializeRacesForExpansion({forceFilterFromUi: true})` before `Cultures.expand()` when recalc/auto-apply is triggered.

Result:

- The world ends up with:
  - A limited, theme-appropriate set of fantasy races (if the user constrained them), or
  - The full set implied by `fantasyRaceBases`.
- Human is the fallback and can become the **dominant race** in worlds with few explicit fantasy namebases.
- `racesSet` / `racesNumber` behave like **locking filters**: once set (and typically locked in the options UI), they are respected by all of the above flows that call `initializeRacesForExpansion`.

### 2.4 QA scenarios for `racesSet` / `racesNumber` and locking

The following smoke tests verify that the `Races set` and `Races number` UI fields (plus their lock icons) are correctly respected across generation and recalc flows:

- **New map generation**
  - Pick a clearly themed `racesSet` (e.g. `fey`) and a small `racesNumber` (e.g. 3), then lock both controls.
  - Generate several new maps.
  - Open the Races Editor and confirm that:
    - Only races from the chosen set appear as non-human.
    - The number of distinct non-human races on the map does not exceed `racesNumber`.

- **Races Editor → Recalculate**
  - On an existing fantasy map, change `racesSet` and/or `racesNumber` to a noticeably different configuration, then lock them.
  - Open the Races Editor and press **Recalculate**.
  - Verify that the non-human race list and per-race cell counts update to match the new filter (no "stray" races outside the selected set).

- **Tools → Regenerate Cultures**
  - With `racesSet` / `racesNumber` set and locked, open the Tools panel and use **Regenerate Cultures**.
  - After regeneration, confirm in the Races Editor and on the map layer that only allowed races are present and that previously filtered-out races have not reappeared.

- **Cultures Editor → Recalculate Cultures / auto-apply**
  - With `racesSet` / `racesNumber` configured, open the Cultures Editor.
  - Enable `auto-apply` or click **Recalculate** after changing expansionism / types.
  - Confirm that the resulting race distribution still respects the UI filters (no new non-human races outside the chosen set appear).

---

## 3. Race expansionism

### 3.1 `defineRaceExpansionism(name)`

- Expansionism is a per-race multiplier applied to culture expansion logic.
- The function uses:
  - `sizeVariety` UI slider → `variety` factor.
  - A per-race `base` value (hard-coded per race name).
  - A random factor around 1 scaled by `variety`.

Conceptually:

```js
let base = 1;
if (name === "Elf") base = 1.2;
else if (name === "Orc") base = 1.6;
else if (name === "Giant") base = 0.5;
// ...similar per-race base multipliers...
const randomFactor = (Math.random() * variety) / 2 + 1;
return rn(randomFactor * base, 1);
```

- Races with **larger base values** (e.g. `Orc`, `Half-Orc`, some beastfolk) tend to have more expansive cultures.
- Races with **smaller base values** (e.g. `Giant`, `Triton`, `Deepkin`, `Starspawn`) tend to be more localized.

### 3.2 Where expansionism is stored

- When a new race is introduced in `initializeRacesForExpansion`:
  - `expansionism = defineRaceExpansionism(raceName)`.
  - The value is stored on the race record: `races[raceId] = {i, name, expansionism}`.
- If an existing race already has an `expansionism` value, it is preserved.

Usage:

- Expansionism is consumed by the **culture / expansion** code (outside `modules/races.js`) to bias how far and fast races spread via cultures and states.

---

## 4. Race propagation through world data

### 4.1 Assignment entry point: `assignRaces()`

- `assignRaces()` is the main procedure that **propagates** races across the world.
- It assumes that `initializeRacesForExpansion` has already built or updated `pack.races` and `culture.race` for the current world (see §2.3), and then:
  1. Clears existing race data if fantasy races are disabled.
  2. Propagates race ids from cultures to states, provinces, burgs, religions, and cells.

#### 4.1.1 Clearing when fantasy races are off

- If `isFantasyCulturesSet()` is false:
  - `pack.races = []`.
  - Remove `race` fields from:
    - `pack.cultures`, `pack.states`, `pack.provinces`, `pack.burgs`, `pack.religions`.
  - No per-cell race array is generated.

#### 4.1.2 Initializing races from cultures

- If fantasy cultures are enabled:
  - `initializeRacesForExpansion()` builds or updates `pack.races` and sets `culture.race` for every culture.
  - Race colors are drawn from the colors of cultures that use that race.

### 4.2 Propagation rules

`assignRaces()` then defines a helper:

```js
function getRaceFromCultureId(cultureId) {
  const culture = pack.cultures && pack.cultures[cultureId];
  return culture && culture.race ? culture.race : 0;
}
```

And applies it as follows:

- **States** (`pack.states`):
  - `state.race = getRaceFromCultureId(state.culture)`.
- **Provinces** (`pack.provinces`):
  - Derive from parent state:
    - `province.race = state && state.race ? state.race : 0`.
- **Burgs** (`pack.burgs`):
  - `burg.race = getRaceFromCultureId(burg.culture)`.
- **Religions** (`pack.religions`):
  - `religion.race = getRaceFromCultureId(religion.culture)`.
- **Cells** (`pack.cells`):
  - A new `Uint16Array` `pack.cells.race` is created:
    - For each cell index `i`:
      - `cultureId = pack.cells.culture[i]`.
      - `raceId = pack.cultures[cultureId]?.race || 0`.
      - `pack.cells.race[i] = raceId`.

Semantics:

- **Culture is the primary carrier of race**.
- All higher-level aggregates (state, province, religion) and lower-level geometry (cells) inherit race from the underlying culture.
- `0` means "no race" / fallback; `>0` indexes into `pack.races`.

---

## 5. Race language palettes & Markov mixer

### 5.1 Fallback fantasy language per race

- The first-level, always-available language for a race is its **fantasy base**:
  - `fantasyRaceBases[raceName] = [baseId1, baseId2, ...]`.
  - `generateRaceLanguageNames` uses the **first** base as fallback:

    ```js
    const bases = fantasyRaceBases[raceName];
    const baseIndex = bases[0];
    for (let i = 0; i < count; i++) {
      result.push(Names.getBase(baseIndex));
    }
    ```

- This ignores culture; it is a **race-centric fantasy language flavor**.
- It is used whenever:
  - The language mixer catalog or mappings are unavailable, or
  - The race’s language profile yields **no eligible ISOs**, or
  - Mixer calls fail for any reason.

### 5.2 Race language profiles (`raceLanguageProfiles`)

- `modules/races.js` defines:

  ```js
  const raceLanguageProfiles = {
    Elf: {
      categories: ["Celtic", "Uralic"],
      families: ["Celtic", "Uralic", "Sami"]
    },
    "Dark Elf": {
      categories: ["Slavic", "Germanic", "Romance"],
      families: ["Slavic", "Germanic", "Romance", "Baltic"]
    },
    // ...profiles for most non-human races...
    AnyLanguage: {
      categories: [],
      families: []
    },
    Human: {
      categories: [],
      families: []
    }
  };
  ```

- Fields:
  - `categories`: array of language **categories** (e.g. `"Romance"`, `"Germanic"`, `"Sino-Tibetan"`).
  - `families`: array of language **families** (e.g. `"Celtic"`, `"Bantu"`, `"Na-Dene"`).
- Semantics:
  - A language in `language-mixes.json` is **eligible** for the race if **either**:
    - `lang.category ∈ categories`, or
    - `lang.family ∈ families` (falling back to `lang.category` if `family` is absent).
  - If both category and family match, family gets a higher weight.
- Sentinel races:
  - `Human` and `AnyLanguage` have empty arrays; tools treat these as intentional **"no-op" / fallback** entries.

### 5.3 Building ISO weights (`getRaceLanguageIsoWeights`)

- `getRaceLanguageIsoWeights(raceName)` builds a **weighted ISO map** from a race profile:

  1. Load mixer catalog: `config/language-mixes.json` into `window.languageMixerCatalog`.
  2. Build `categorySet` and `familySet` from profile.
  3. For each entry `lang` in the catalog:
     - Skip if `!lang` or `!lang.iso`.
     - Skip if `lang.tags` contains `"family"` (these are macro entries).
     - Determine `category = lang.category` and `effectiveFamily = lang.family || lang.category`.
     - `catOk = categorySet.size && categorySet.has(category)`.
     - `famOk = familySet.size && effectiveFamily && familySet.has(effectiveFamily)`.
     - If neither `catOk` nor `famOk` → skip.
     - `weight = 0; if (catOk) weight += 1; if (famOk) weight += 2;`.
     - Add `weight` to `isoWeights[lang.iso]`.
  4. Return `isoWeights` if non-empty, else `null`.

Notes:

- Category and family matches are additive; races lean **strongly** into languages whose families match, while still including some cross-category flavors.
- Tools in `tools/mixer-races` reimplement this logic for reporting.

### 5.4 Generating names via the mixer (`generateRaceLanguageNames`)

- Main entry point for race-centric name samples:

  ```js
  function generateRaceLanguageNames(raceName, options) {
    const count = (options && options.count) || 40;

    const canMix = raceName !== "Human" && typeof Names !== "undefined" && Names.getMixedByIso;
    const isoWeights = canMix ? getRaceLanguageIsoWeights(raceName) : null;

    if (isoWeights && Names && typeof Names.getMixedByIso === "function") {
      try {
        const names = Names.getMixedByIso(isoWeights, {count});
        if (Array.isArray(names) && names.length) return names;
      } catch (error) {
        // fall through to fallback
      }
    }

    // Fallback: classic fantasy base for the race
    // (see §5.1)
  }
  ```

Rules:

- **Humans**:
  - `canMix` is explicitly `false` for `"Human"`.
  - Humans do **not** get a global race-level mixed language; they rely on per-culture bases.
- **Non-human races**:
  - Use `raceLanguageProfiles` → `getRaceLanguageIsoWeights` → `Names.getMixedByIso`.
  - Names are drawn from a weighted pool of real-world or synthetic mixer languages.
  - If anything fails or yields no names, fall back to the race’s fantasy namebase.

How this relates to map names:

- Normal map features (burgs, states, etc.) still use `Names.getCulture(cultureId)` based on `culture.base`.
- `generateRaceLanguageNames` is a **race-level tool** for exploring or defining race-specific language flavors (e.g. for lore, descriptors, or dev tooling).
- ✅ **2025-12-14 wiring update (race → culture language):** during `initializeRacesForExpansion`, each non-human culture can now be assigned a generated namebase `Race <RaceName> (Mixer)` created via `Names.getMixedByIso`.
  - This makes fantasy races produce genuinely novel mixed languages in normal map naming flows (via `culture.base`).
  - Humans remain unchanged (no race-level mixed base; they keep per-culture bases).
  - Race identity is preserved because `getRaceNameForCulture` recognizes both the classic fantasy base indices and the generated `Race <RaceName> (Mixer)` bases.
  - State-name suffix logic treats `Race <RaceName> (Mixer)` as a fantasy base (no generic suffix).

---

## 6. Visualization & analysis tools

### 6.1 Burgs overview & bubble chart (`modules/ui/burgs-overview.js`)

- The Burgs Overview dialog lists burgs with:
  - State, province, culture, population, etc.
- The **bubble chart** ("Burgs bubble chart") supports multiple grouping modes:
  - By state / culture / province.
  - By **language** (underlying `culture.base` → namebase index).
  - By **race** (via `burg.race` / `culture.race`).
  - By combined pairs such as `stateLanguage`, `cultureLanguage`, `provinceLanguage`, and `raceLanguage`.

Key points:

- Burg nodes carry:
  - `languageBase` (same as `culture.base`).
  - `raceOriginal` (from `burg.race` or `culture.race`).
- Helper functions build synthetic "language" and "race" category nodes based on these fields.
- Combined groupings (`raceLanguage`, etc.) derive from **both** the race and the language base.

Effect:

- You can visually inspect how races and languages **co-distribute** across burgs:
  - Which races dominate which languages.
  - Where multi-language races or multi-race languages appear.

### 6.2 Mixer–races QA scripts (`tools/mixer-races/*.js`)

These scripts enforce invariants and report coverage:

- **`check-race-language-profiles.js`**
  - Extracts `raceLanguageProfiles` from `modules/races.js`.
  - Ensures:
    - No race uses wildcard `"*"` in `categories` or `families`.
    - No two non-sentinel races share an identical `(categories, families)` set.
  - `Human` and `AnyLanguage` are allowed to share an **empty** profile.

- **`report-race-language-coverage.js`**
  - Compares `raceLanguageProfiles` against `config/language-mixes.json` and `config/language-mixer-map.json`.
  - Reports:
    - How many catalog languages are eligible for at least one race.
    - Which catalog languages are **unused** by any race.
    - Among unused languages, which already have valid mixer mappings (good candidates for new races or profile tweaks).

- **`report-per-race-language-coverage.js`**
  - For each race, counts how many catalog languages it can reach.
  - Reports percentage coverage of the **non-macro** catalog.
  - Warns if any race reaches 100% coverage (too generic).

- **`report-race-language-palettes.js`**
  - Uses the same matching logic as `getRaceLanguageIsoWeights`.
  - For each race, reports:
    - ISO count.
    - Number of distinct regions, categories, families represented.
  - Helps tune how broad or narrow each race’s palette feels.

Together, these tools:

- Keep race palettes **distinct** and **non-universal**.
- Highlight both overused and underused mixer languages.

---

## 7. Integration with Individuals, Characters, and Evolving Simulation

### 7.1 Individuals

From [Individuals System – Developer Guide](Individuals.md):

- `IndividualBase` includes:
  - `raceId: string` (intended to align with the race system).
  - `cultureId`, `religionId`, `classScore`, etc.
- Individuals are resolved from seeds plus overrides; race/culture are part of their **demographic identity**.

Intended mapping:

- `raceId` on individuals should correspond to **race ids** from `pack.races` (`assignRaces()` output).
- Individuals inherit race from their home culture / cell, which already encodes `pack.cells.race` and `culture.race`.

### 7.2 Characters (D&D / d20 layer)

From [Characters System – Developer Guide](Characters.md):

- Characters are **views** over Individuals for specific RPG systems.
- Race / culture / religion fields are inputs to:
  - Race selection in the rules module (`races.json` per system).
  - Class, archetype, and aptitude decisions.

Implication:

- The fantasy race system documented here is the **upstream source** of a person’s race for character generation.
- Language flavor for a character’s homeland can draw from either:
  - Culture-based languages (via `culture.base`), or
  - Race-centric palettes (via `generateRaceLanguageNames`) when a race-specific language is desired.

### 7.3 Evolving Simulation & Underdark

- The Evolving Simulation (wars, rulers, borders, trade, etc.) and Underdark systems treat:
  - `race`, `culture`, `religion` as **tags** on states, provinces, burgs, and regions.
- Underdark-specific race sets (`getRacesSetFilter("underdark")`) provide presets of races that fit deep-world themes.

Design intent:

- Historical and Underdark systems can use race and language tags to:
  - Drive different expansion or conflict behaviors.
  - Bias where certain races’ cultures or cult centers appear.
  - Provide hooks for story / lore generation tied to race-specific language flavors.
- For the evolving simulation specifically, early versions should treat race as a **light modifier** rather than a primary driver: existing race expansionism values and a small number of hazard/weight multipliers can depend on race, but core war, trade, and culture/religion diffusion rules remain primarily culture/state/religion-driven. Stronger race coupling can be added later if it proves useful.

---

## 8. Summary

- **Race identity** is derived first from **culture language bases** via `fantasyRaceBases`.
- Races propagate deterministically to **states, provinces, burgs, religions, and cells**.
- Each non-human race has a **raceLanguageProfile** that selects a weighted subset of language-mixer entries (by category/family).
- Name generation for a race:
  - Uses **Markov-mixed languages** from those profiles when possible.
  - Falls back to the race’s dedicated **fantasy namebase** otherwise.
- Humans are treated specially:
  - No global race-level mixer.
  - Rely on **culture-specific** bases for their diversity.
- A suite of **mixer-races tools** enforces that race palettes are explicit, non-wildcard, and non-identical, and reports coverage / breadth.

This document should be updated whenever:

- `fantasyRaceBases` changes,
- `raceLanguageProfiles` are retuned,
- or additional race–language behaviors are introduced in UI or simulation systems.

---

## 9. Current design choices

- **raceLanguageProfiles tuning**
  - Choice: whether to retune `raceLanguageProfiles` so each race lines up more tightly with the desired flavor (for example, Elves more Uralic/Celtic, Orcs more Slavic/Bantu, etc.).

- **Human race language**
  - (Recommendation): Keep Humans culture-based for now; only add a Human profile if you find you need a single, lore-specific “human lingua franca”.

- **Expansionism tuning**
  - (Recommendation): Leave expansionism values as-is until you start implementing the evolving simulation; then tune them in context with wars, borders, and other world-history behavior.

- **Individuals / Characters wiring**
  - (Recommendation): Defer wiring until Individuals v1 is implemented; then use the rules in this document as the canonical spec for mapping `cells.race` / `culture.race` into Individuals and Characters.

- **Language coverage roadmap**
  - Race–language behavior assumes the underlying language system will keep expanding coverage via the plan in [Language System Status – Markov & Mixer §5](Languages-Status.md#5-planned-next-steps-when-resuming), including growing coverage via Wikipedia’s language lists with the same per-language rigor.

- **Tiny isolates and exotic micro-bases (e.g. Hadza / Sandawe click isolates)**
  - (Current practice): Even extremely small or typologically exotic languages that have their own namebases (like Hadza and Sandawe click bases) should be **fully wired** on the mixer side: each gets a catalog entry, a dedicated base or unique `bases[]` mix, and must still pass global base-uniqueness checks.
  - (Current practice): On the race side, these isolates are attached only to a very small number of thematically appropriate non-human races rather than being added to broad human palettes. For example, `Gnoll` currently includes `Hadza isolate` and `Sandawe isolate` in its `families` filter to surface those click isolates without making them globally common.
  - (Recommendation): Future tiny / fringe isolates that gain dedicated bases should follow the same pattern: fully wired in the mixer, but either left race-unused or attached sparingly to a small set of monster / beastfolk races where the flavor fits, instead of inflating generic race language coverage.

- **Races-set locking & recalc flows**
  - (Current behavior): `initializeRacesForExpansion(options)` now supports a `forceFilterFromUi` flag that re-applies the current `racesSet` / `racesNumber` filters even after the first initialization. New map generation calls the initializer once with default options; Races Editor **Recalculate**, Tools **Regenerate Cultures**, and Cultures Editor **Recalculate Cultures** all call `initializeRacesForExpansion({forceFilterFromUi: true})` before culture expansion and `assignRaces()`.
  - (Current behavior): `assignRaces()` no longer calls `initializeRacesForExpansion` internally; it only propagates existing `culture.race` values to states, provinces, burgs, religions, and cells.
  - (Recommendation): Any future flow that regenerates or substantially reshapes cultures and is expected to respect `racesSet` / `racesNumber` should follow the same pattern: explicitly invoke `initializeRacesForExpansion({forceFilterFromUi: true})` before `Cultures.expand()` and `assignRaces()`, or document why that flow intentionally ignores the filters.

- **Arcana Unearthed race integration**
  - This fork currently wires a small set of **Arcana Unearthed** ancestries as full fantasy races in `modules/races.js`:
    - Player-facing AU ancestries: `Loresong Faen`, `Quickling Faen`, `Spryte`, `Litorian`, `Mojh`, `Sibeccai`, `Verrik`.
    - AU-flavored antagonist / monster races: `Dramojh`, `Ratmen`, `Chorram`, `Shadow Troll`.
  - These races each have:
    - A `fantasyRaceBases` entry, usually reusing existing smallfolk / fey, leonine, draconic, jackal/beastfolk, psionic, goblinoid, or giant/troll bases rather than introducing new fantasy bases.
    - A `raceLanguageProfiles` entry that biases them toward appropriate mixer palettes (Celtic/Uralic small-fey, African macro-families for leonine / jackal folk, East-Asian + Indo-Iranian for Mojh / Dramojh, Indo-Aryan / Iranian / Afroasiatic for Verrik, Slavic/Germanic/Romance/Romani for Ratmen, etc.).
  - `getRacesSetFilter("arcanaUnearthed")` defines a dedicated AU race preset containing AU PC races **plus** Dramojh / Ratmen / Chorram / Shadow Troll, and the same AU races are also blended into existing themed sets (`fey`, `beastfolk`, `primal`, `dark`, `planar`, `underdark`) where their flavor fits.
  - For a detailed content-level breakdown of these AU races and their intended niches, see [Content – Arcana Unearthed Races](Content.md), especially §7 “Implementation status in this fork”.
