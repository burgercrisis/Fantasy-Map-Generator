# Characters System – Developer Guide
_Back to devplan overview: [Changes vs Azgaar overview](Changes-vs-Azgaar-master.md)_

This document outlines the plan for implementing the **D&D / d20 character & NPC system** on top of the Individuals system. It is intentionally high-level and code-oriented, so future work sessions can implement it in phases without re-designing the feature.

This layer provides full rules support (starting with D&D 3.5) with the option to switch to 5e, Pathfinder 1e, Pathfinder 2e, or a generic d20-like mode.

Related devplans:
- [Individuals System – Developer Guide](Individuals.md) – core people model that Characters extends.
- [Races & Languages – System Rules](Races-Languages-Rules.md) – how race and language tags are assigned in world data and can feed into character flavor.
- [Evolving Simulation – Developer Guide](Evolving-Simulation.md) – evolving history layer that uses Individuals for rulers and events; Characters can be attached to notable Individuals from that history.
- [Language mixer helper tools & workflows](../tools/HELPER-TOOLS.md) – CLI helpers and QA workflows for the language mixer and race language palettes.

### Section index

- [0. Goals & Constraints](#0-goals--constraints)
- [1. High-Level Architecture](#1-high-level-architecture)
- [2. Data Files Layout (Rules & Characters)](#2-data-files-layout-rules--characters)
- [3. Mapping Individuals → Characters (Occupation/ClassScore → Class/Level)](#3-mapping-individuals--characters-occupationclassscore--classlevel)
- [4. Abilities, Saves, Skills – ID Strategy](#4-abilities-saves-skills--id-strategy)
- [5. Quick View vs Full View](#5-quick-view-vs-full-view)
- [6. Core APIs (Conceptual)](#6-core-apis-conceptual)
- [7. Implementation Roadmap](#7-implementation-roadmap)

---

## 0. Goals & Constraints

- Build a **rules-layer** on top of Individuals:
  - Every `Individual` may have **zero or more character profiles** for specific rulesets.
  - Individuals remain the canonical people in the world; characters are *views* into them.
- Support a **full ruleset**, not just minimal statblocks:
  - Abilities, HP, AC, saves, skills, feats, spells, equipment, etc.
  - Provide both a **quick view** (summary statblock) and a **full view**.
- Support multiple d20-family systems:
  - Primary: **D&D 3.5**.
  - Also: **D&D 5e**, **Pathfinder 1e**, **Pathfinder 2e**, and **generic d20**.
  - Use a **pluggable rules module** per system: `dnd35`, `dnd5e`, `pf1`, `pf2`, `d20`.
- Keep everything **deterministic** via seeds:
  - Character details are derived from:
    - `personId` (from Individuals),
    - `systemId`,
    - world / settlement / culture context, and
    - system rules JSON.
  - Edits are stored as overrides.
- Use **data-driven rules**:
  - Represent PHB + DMG content structurally in JSON (classes, races, feats, spells, etc.).
  - Avoid hardcoding rule data in JS.
- Keep the design **extendable**:
  - It should be easy to add deeper simulation (PC vs NPC differences, encounter builders, etc.) later.

---

## 1. High-Level Architecture

### 1.1 Relationship to Individuals

- Base layer: **Individuals** (see [Individuals System – Developer Guide](Individuals.md)).
  - Each Individual has:
    - `id` (personId),
    - race/culture/occupation/classScore, importance tier, etc.
- Character layer adds **system-specific character profiles**:
  - For each `(personId, systemId)` pair, we can derive or store a `CharacterProfile`.

Conceptually:

```ts
type SystemId = "dnd35" | "dnd5e" | "pf1" | "pf2" | "d20";

interface CharacterProfileId {
  personId: PersonId;  // from Individuals
  systemId: SystemId;
}

interface CharacterProfileCore {
  systemId: SystemId;

  level: number;
  classes: { classId: string; level: number }[];
  abilityScores: { [abilityId: string]: number };  // STR/DEX/...

  maxHP: number;
  currentHP?: number;

  saves: { [saveId: string]: number };              // Fort/Ref/Will or equivalents
  ac?: number;                                      // armor class or system-specific defense
  attackBonus?: number;                             // primary attack bonus (summary)

  skills: { [skillId: string]: number };            // ranks/bonuses, system-specific skill IDs
  feats?: string[];
  traits?: string[];

  equipmentIds?: string[];                          // references into gear tables
  spellcasting?: any;                               // structured per system later

  notes?: string;
}

interface CharacterProfileOverride {
  id: CharacterProfileId;
  overrides: Partial<CharacterProfileCore> & {
    notes?: string;
    tags?: string[];
  };
}
```

### 1.2 Rules Modules

We keep each ruleset in a separate **RulesModule**:

```ts
interface RulesModule {
  systemId: SystemId;

  // Generate a procedural baseline character from an Individual
  generateCharacter(
    person: IndividualBase,
    worldContext: any,
    rng: any
  ): CharacterProfileCore;

  // Optionally recompute derived numbers from a core profile
  computeDerived(
    profile: CharacterProfileCore,
    worldContext: any
  ): CharacterProfileCore;

  // Summarize to a quick-view statblock
  summarizeProfile(
    profile: CharacterProfileCore
  ): any; // small summary object for UI
}

const rulesModules: { [systemId: string]: RulesModule } = {
  // dnd35, dnd5e, pf1, pf2, d20
};
```

- **Deterministic seed** per character profile:
  - `characterSeed = hash64(personId, systemId)`.
  - All per-system RNG pulls come from this, plus contextual inputs.

---

## 2. Data Files Layout (Rules & Characters)

### 2.1 Rules data per system

Each system gets its own rules directory under `rules/` (or similar):

- `rules/dnd35/abilities.json`
- `rules/dnd35/saves.json`
- `rules/dnd35/skills.json`
- `rules/dnd35/races.json`
- `rules/dnd35/classes.json`
- `rules/dnd35/feats.json`
- `rules/dnd35/spells.json`
- `rules/dnd35/npc-archetypes.json`   // bridge from Individuals
- `rules/dnd35/archetypes.json`       // archetype definitions

Future:

- Similar folders for `dnd5e`, `pf1`, `pf2`, `d20`.

**Guiding principles:**

- IDs are **stable strings** (e.g. `"fighter"`, `"wizard"`, `"hide"`).
- Files are **pure data**: definitions, numeric progressions, tags, prerequisites.
- Per-system `RulesModule` consumes these JSONs and does math / generation.

### 2.2 Character storage per world & system

Per-world storage under `data/worlds/<worldId>/characters/`:

- `data/worlds/<worldId>/characters/dnd35/<settlementId>-characters.json`
- `data/worlds/<worldId>/characters/pf1/<settlementId>-characters.json`
- etc.

Each file stores overrides and lightweight indexes for that system + settlement:

```ts
interface SettlementCharactersFile {
  version: number;
  worldId: WorldId;
  settlementId: SettlementId;
  systemId: SystemId;

  profiles: { [personId: PersonId]: CharacterProfileOverride };

  editedProfileIds: PersonId[];
  importantProfileIds?: PersonId[];

  indexes?: {
    byClassId?: { [classId: string]: PersonId[] };
    byLevelBand?: { [band: string]: PersonId[] };
  };

  meta?: {
    lastModified?: number;
  };
}
```

This mirrors the Individuals per-settlement overrides pattern and can be expanded later.

---

## 3. Mapping Individuals → Characters (Occupation/ClassScore → Class/Level)

The Individuals layer provides:

- `raceId`, `cultureId`, `religionId`.
- `occupationId`.
- `classScore` (0 = homeless, 1 ~ upper-middle, >1 wealth/power).
- `importanceTier` (background, tracked, storyCritical).

We use a **bridge config** per system to map these into character archetypes.

### 3.1 NPC archetype bridge

Example: `rules/dnd35/npc-archetypes.json`:

```jsonc
{
  "city-guard": [
    {
      "when": {
        "classScoreMin": 0.3,
        "classScoreMax": 0.9,
        "importanceTier": "background"
      },
      "archetypeId": "dnd35:warrior-2",
      "weight": 3
    },
    {
      "when": {
        "classScoreMin": 0.9,
        "classScoreMax": 1.5,
        "importanceTier": "tracked"
      },
      "archetypeId": "dnd35:fighter-3",
      "weight": 1
    }
  ]
}
```

And `rules/dnd35/archetypes.json`:

```jsonc
{
  "dnd35:warrior-2": {
    "systemId": "dnd35",
    "raceTags": ["human", "human-like"],
    "classLevels": [{ "classId": "warrior", "level": 2 }],
    "role": "guard"
  },
  "dnd35:fighter-3": {
    "systemId": "dnd35",
    "raceTags": ["human"],
    "classLevels": [{ "classId": "fighter", "level": 3 }],
    "role": "elite-guard"
  }
}
```

At generation time, the rules module:

1. Reads the Individual:
   - `occupationId`, `classScore`, `importanceTier`, `raceId`, etc.
2. Looks up candidate archetypes for that occupation.
3. Filters by `when` conditions.
4. Uses `characterSeed` to choose an archetype by weight.
5. Builds the full character (ability scores, feats, skills, spells) based on:
   - chosen archetype,
   - rules data for classes/races/etc.,
   - tags and aptitudes derived from the Individual.

This tightly couples normal-world data to RPG presentations, without baking any of it into code.

---

## 4. Abilities, Saves, Skills – ID Strategy

We need stable IDs that map well across systems and align with Individuals.

### 4.1 Abilities

Use shared IDs:

- `STR`, `DEX`, `CON`, `INT`, `WIS`, `CHA`.

Per-system `abilities.json` defines display names and any system-specific tweaks.

### 4.2 Saves

Use canonical IDs:

- `FORT`, `REF`, `WILL`.

Per-system `saves.json` defines how they work:

```jsonc
{
  "FORT": { "name": "Fortitude", "ability": "CON" },
  "REF":  { "name": "Reflex",    "ability": "DEX" },
  "WILL": { "name": "Will",      "ability": "WIS" }
}
```

For 5e/PF2, the rules module can treat saves differently internally but still expose a summary compatible with these IDs for quick view.

### 4.3 Skills

Each system gets its own `skills.json` with system-specific skill IDs:

```jsonc
{
  "hide": {
    "name": "Hide",
    "ability": "DEX",
    "tags": ["stealth", "agility"]
  },
  "knowledge-arcana": {
    "name": "Knowledge (Arcana)",
    "ability": "INT",
    "tags": ["arcane", "lore"]
  }
}
```

Individuals (or their occupation/race/culture configs) can expose **aptitude tags** like:

- `"stealth"`, `"martial"`, `"social"`, `"arcane"`, `"divine"`, `"wilderness"`.

Rules modules then bias skill distributions to favor skills whose `tags` intersect the person’s aptitudes.

---

## 5. Quick View vs Full View

### 5.1 Quick view summary

The quick view is a compact object derived from `CharacterProfileCore`:

```ts
interface CharacterQuickView {
  systemId: SystemId;
  level: number;
  classes: { classId: string; level: number }[];
  raceId: string;

  // Combat snapshot
  maxHP: number;
  ac?: number;
  attackBonus?: number;
  saves: { [saveId: string]: number };

  // Flavor tags
  roleTags?: string[];      // e.g. ["guard", "boss", "caster"]
  keyFeats?: string[];      // small subset
  keySpells?: string[];     // small subset
}
```

Each system’s `summarizeProfile` produces this based on its own details.

### 5.2 Full view

The full view exposes the entire `CharacterProfileCore` and optionally system-specific extras.

- UIs can toggle between **quick** and **full**.
- Encounter tools/UI can mostly work with quick views, using full profiles only when necessary.

---

## 6. Core APIs (Conceptual)

### 6.1 Read APIs

```ts
// Resolve a character profile from seeds + overrides
function getCharacterProfile(
  personId: PersonId,
  systemId: SystemId
): CharacterProfileCore | null;

// Quick view
function getCharacterQuickView(
  personId: PersonId,
  systemId: SystemId
): CharacterQuickView | null;

// List characters in a settlement for a given system
interface CharacterQueryOptions {
  minLevel?: number;
  maxLevel?: number;
  classIds?: string[];
  importanceAtLeast?: ImportanceTier;
}

function getCharactersInSettlement(
  settlementId: SettlementId,
  systemId: SystemId,
  options?: CharacterQueryOptions
): CharacterQuickView[]; // or full profiles if needed
```

### 6.2 Edit APIs

```ts
// Patch core character fields (level, feats, skills, etc.)
function editCharacterProfile(
  personId: PersonId,
  systemId: SystemId,
  patch: Partial<CharacterProfileCore> & { notes?: string; tags?: string[] }
): void;

// Clear overrides, revert to pure procedural character for that system
function clearCharacterProfile(
  personId: PersonId,
  systemId: SystemId
): void;
```

All edits are deterministic deltas on top of seed-based generation, similar to the Individuals overrides system.

---

## 7. Implementation Roadmap

**Phase A – Scaffolding**
- Create `modules/characters/` with:
  - System registry (`rulesModules`),
  - stub `getCharacterProfile`, `getCharacterQuickView`, `editCharacterProfile`, `clearCharacterProfile`.
- Set up per-system `rules/` directories with empty/stub JSON files for `dnd35`.

**Phase B – D&D 3.5 Core Rules (Minimal Subset)**
- Implement core JSONs for `dnd35`:
  - `abilities.json`, `saves.json`, `races.json`, `classes.json` (PHB subset),
  - `skills.json` (partial but representative).
- Implement `dnd35` `RulesModule` that:
  - Uses `npc-archetypes.json` + `archetypes.json` to pick a build based on Individual’s occupation/classScore/importanceTier.
  - Generates ability scores, class levels, HP, AC, saves, skills.
  - Exposes a `summarizeProfile` for quick views.

**Phase C – Characters Storage & Overrides**
- Implement `SettlementCharactersFile` load/save with versioning.
- Wire `getCharacterProfile` to:
  - Generate procedural base via `RulesModule`.
  - Merge in `CharacterProfileOverride` from disk.
- Maintain `editedProfileIds` and optional `importantProfileIds` indexes.

**Phase D – UI & Tools (Optional)**
- Build dev/GM UI to:
  - Browse Individuals per settlement.
  - Generate/view 3.5 character sheets.
  - Edit key stats/feats/spells for important NPCs.

**Phase E – Additional Systems**
- Add `dnd5e`, `pf1`, `pf2`, `d20`:
  - For each, add rules JSONs and a `RulesModule` implementing generation + summary.
  - Reuse Individuals data and archetype bridge where meaningful.

---

This guide is planning-only; no runtime code should be implemented until you explicitly start working on these phases.
