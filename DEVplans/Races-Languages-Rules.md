# Races & Languages – System Rules

_Developer-facing summary of how fantasy races are defined, how they attach to cultures / world data, and how they select languages via the Markov mixer._

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
- `DEVplans/Individuals.md`, `DEVplans/Characters.md`, `DEVplans/Evolving-Simulation*.md`

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

- At the level of the **language mixer** and **namebases**, the design intent is that each language (ISO entry or synthetic mixer language) ultimately has a **unique, linguistically appropriate base or tuned mix**.
- Bases and mixes should reflect the language’s own **family, region, and cultural context**, not generic or unrelated sources.
- Shared bases or heavy reuse are allowed **only when historically or typologically justified** (e.g. closely related dialect clusters or deliberate conlangs / creoles); otherwise, suspicious shared-base clusters should be treated as data debt to fix.
- All the race and culture mapping described in this document assumes that these underlying bases are accurate; passes over `language-mixer-map.json`, `language-mixes*.json`, and the mixer QA tools are used to enforce this over time.

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

Behavior on first initialization (`initializeRacesForExpansion`):

1. Determine whether this is the **first** race initialization for the world:
   - `isFirstInitialization = existingRaces.length <= 1`.
2. If first-time:
   - Read `racesSet` → optional set of allowed race names.
   - Read `racesNumber` → `maxNonHumanRaces` (or `Infinity` if 0 / not set).
3. Build `allowedRaces`:
   - If a `racesSet` is chosen and `maxNonHumanRaces` is unlimited → `allowedRaces = racesSetFilter`.
   - If `maxNonHumanRaces` is finite:
     - Scan all cultures, compute `raceNeedCounts[raceName]` by counting how many cultures **would** use that race.
     - Sort races by count descending.
     - Keep only the top `maxNonHumanRaces` non-human races.
     - `allowedRaces` becomes that subset.
4. When assigning a culture’s race **during first initialization**:
   - Start from `raceName = getRaceNameForCulture(culture)`.
   - If `raceName` is non-human and not in `allowedRaces` → **forced to `"Human"`**.

Later initializations:

- Existing `pack.races` entries are preserved (id, name, color, expansionism) and reused.
- New races are only introduced as needed for cultures that don’t yet have a race entry.

Result:

- The world ends up with:
  - A limited, theme-appropriate set of fantasy races (if user constrained them), or
  - The full set implied by `fantasyRaceBases`.
- Human is the fallback and can become the **dominant race** in worlds with few explicit fantasy namebases.

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

- `assignRaces()` is the main procedure that assigns races across the world.
- It does:
  1. Clear existing race data if fantasy races are disabled.
  2. Initialize races for expansion (`initializeRacesForExpansion`).
  3. Propagate race ids from cultures to states, provinces, burgs, religions, and cells.

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
- `generateRaceLanguageNames` is a **race-level tool** for exploring or defining race-specific language flavors (e.g. for lore, descriptors, or dev tooling), not a replacement for culture-based naming.

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

From `DEVplans/Individuals.md`:

- `IndividualBase` includes:
  - `raceId: string` (intended to align with the race system).
  - `cultureId`, `religionId`, `classScore`, etc.
- Individuals are resolved from seeds plus overrides; race/culture are part of their **demographic identity**.

Intended mapping:

- `raceId` on individuals should correspond to **race ids** from `pack.races` (`assignRaces()` output).
- Individuals inherit race from their home culture / cell, which already encodes `pack.cells.race` and `culture.race`.

### 7.2 Characters (D&D / d20 layer)

From `DEVplans/Characters.md`:

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
