# Individuals System  Developer Guide
_Back to devplan overview: [Changes vs Azgaar overview](Changes-vs-Azgaar-master.md)_

This document outlines the plan for implementing the **Individuals & Population** system in the Fantasy Map Generator. It is intentionally high-level and code-oriented, so future work sessions can implement it in phases without re-designing the feature.

For language mixer helper scripts and workflows  especially the race language coverage/palette reporters such as `report-race-language-coverage.js` and `report-race-language-palettes.js` that shape upstream flavor for Individuals  see [tools/HELPER-TOOLS.md](../tools/HELPER-TOOLS.md).

### Section index

- [0. Goals & Constraints](#0-goals--constraints)
- [1. High-Level Architecture](#1-high-level-architecture)
- [2. IDs & Seeding](#2-ids--seeding)
- [3. Data Schemas (Conceptual)](#3-data-schemas-conceptual)
- [4. Per-Settlement Overrides Files](#4-per-settlement-overrides-files)
- [5. Time & Evolution](#5-time--evolution)
- [6. Indexing & Hard Fields](#6-indexing--hard-fields)
- [7. Public API Surface (v1)](#7-public-api-surface-v1)
- [8. Implementation Roadmap (Phases)](#8-implementation-roadmap-phases)

---

## 0. Goals & Constraints

- Represent **millions of individuals** (people) in a world without storing them all.
- Use **deterministic seeding** so each person is reproducible from:
  - world seed + map settings,
  - genealogical seeds (parents, family),
  - local context (settlement, household).
- Allow a **lightly evolving simulation**:
  - People have `birthYear` / `deathYear?` and age.
  - Time advances in **discrete jumps** (e.g. +5 years at user request).
  - On each jump, we simulate births / deaths / key promotions (not deep per-year sim).
- Allow **editing**:
  - Each individual can be overridden (moved, renamed, notes, class changes, etc.).
  - Edited values override seeded values while still allowing most fields to stay procedural.
- Keep changes **forward-compatible**:
  - Design seeds, schemas, and APIs so we can later add richer dynasty trees, more indexes, and deeper sim without breaking saves.

---

## 1. High-Level Architecture

### 1.1 Core concepts

- **Individual**: a single person in the world, mostly computed from seeds.
- **Family**: a dynasty/lineage with shared traits; lightweight records.
- **Household**: a co-resident unit (one building/house), possibly hosting multiple families.
- **Overrides**: per-person deltas that supersede procedural values.
- **Indexes**: small helper structures to quickly find people (per-settlement, later extendable).

### 1.2 New modules (proposed)

Names are tentative; actual filenames can follow existing project conventions.

- `modules/population/individuals-core.js`
  - Seed helpers (`makePersonId`, seeded RNG wrappers).
  - Resolution logic for individuals from seeds + overrides.
- `modules/population/overrides.js`
  - Load / save per-settlement overrides files.
  - Apply patches and keep in-memory indexes in sync.
- `modules/population/families.js`
  - Manage simple `Family` records and lookups.
- `modules/population/time.js`
  - `advanceWorldYears(deltaYears)`, world `currentYear` integration.
  - High-level population update pass (births, deaths, promotions).

No implementation is required yet; this guide is to define responsibilities and interfaces.

---

## 2. IDs & Seeding

### 2.1 Person IDs and seeds

- **Type**: `PersonId` is a **64-bit hash** stored as a **hex string**, e.g. `"a3b4c5d6e7f89012"`.
- `PersonId` and **person seed** are the same value.
- Use a **non-cryptographic 64-bit hash** (e.g. xxHash / Murmur variant or an existing stable hash in the project).

All callers must obtain person IDs through a small helper (implementation details hidden):

```js
// Pseudocode / signature only
function makePersonId(fatherId, motherId, birthOrder) {
  // returns 64-bit hash as hex string
}
```

In general we use:

- `personId = hash64(fatherId, motherId, birthOrder)`
- For founder / ancestor roots, use a combination of:
  - `familyId`,
  - generation index or birth year,
  - a local birth order.

### 2.2 Other seeds

- `FamilyId`: same style as `PersonId` (64-bit hex), derived from world seed + culture/state + regional info.
- `HouseholdId`: string id stable within a world (could be numeric or hex).

---

## 3. Data Schemas (Conceptual)

Types below are **specification**, not final code. They can be implemented as JS, TS, or plain JSON structures.

### 3.1 `IndividualBase`

Resolved per person (from seeds + overrides).

```ts
type PersonId = string;      // 64-bit hex hash
type FamilyId = string;
type HouseholdId = string;
type SettlementId = string;
type WorldId = string;

type ImportanceTier = "background" | "tracked" | "storyCritical";

interface IndividualBase {
  // Identity & context
  id: PersonId;              // == seed-derived personId
  worldId: WorldId;
  settlementId: SettlementId; // origin / home settlement
  householdId: HouseholdId;
  familyId: FamilyId;
  mode: "procedural" | "mixed" | "authored";

  // Time
  birthYear: number;
  deathYear?: number | null; // null/undefined => not dead / unknown
  isAlive: boolean;          // derive from years + currentYear or store

  // Demographics
  sex: "m" | "f" | "nb" | "other";
  raceId: string;
  cultureId: string;
  religionId?: string | null;

  // Socio-economic
  classScore: number;        // 0 = homeless, 1 ~ upper-middle baseline
  occupationId: string;      // keys into occupation taxonomy
  familyRole: "head" | "spouse" | "child" | "relative" | "servant" | "other";

  // Genealogy (parents always resolvable, grandparents best-effort)
  parents: [PersonId | null, PersonId | null];

  // Locations
  homeLocation: {
    settlementId: SettlementId;
    householdId: HouseholdId;
  };
  currentLocation?: {
    settlementId: SettlementId;
    buildingId?: string;
    x?: number;
    y?: number;
  };

  // Meta
  importanceTier: ImportanceTier;
}
```

Optional modules (not part of the base for v1): traits, skills, appearance, backstory, relationships graph, etc.

### 3.2 `PersonOverride`

Only what is edited; keys present here override procedural values.

```ts
interface PersonOverride {
  id: PersonId;

  // Any subset of IndividualBase fields, plus local metadata
  overrides: Partial<IndividualBase> & {
    notes?: string;
    tags?: string[];
  };

  importanceTier?: ImportanceTier; // if omitted, infer or default

  meta?: {
    createdAt?: number; // timestamp
    createdBy?: string; // tool/user id
  };
}
```

**Hard fields (not normally editable via UI / generic tools):**

- `id` / seed
- `worldId`
- `familyId`
- `parents` (only editable via dedicated family tools, if ever)

### 3.3 `Household`

```ts
interface Household {
  householdId: HouseholdId;
  worldId: WorldId;
  settlementId: SettlementId;
  householdSeed: string; // 64-bit hex

  buildingId?: string;

  primaryCultureId: string;
  primaryReligionId?: string | null;
  baseClassScore: number;
  primaryOccupationType: string; // e.g. "farming", "craft", "trade", "noble_estate"

  residentFamiliesSummary: Array<{
    familyId: FamilyId;
    roleInHousehold: "owner" | "tenant" | "servant" | "slave" | "lodger" | "other";
    approxCount: number;
  }>;
}
```

### 3.4 `Family`

```ts
interface Family {
  familyId: FamilyId;
  worldId: WorldId;
  familySeed: string;      // 64-bit hex seed

  primaryCultureId: string;
  primaryReligionId?: string | null;

  founderId?: PersonId;
  displayName?: string;    // e.g. "House Voren"
  coatOfArmsId?: string;   // link to heraldry later
  tags?: string[];         // e.g. ["noble", "merchant", "criminal"]

  meta?: {
    notes?: string;
    // future: history, titles, etc.
  };
}
```

Families are stored centrally per world and can later be upgraded into full dynasties with richer trees.

---

## 4. Per-Settlement Overrides Files

Each settlement has a single overrides file.

```ts
interface SettlementPopulationOverridesFile {
  version: number; // start at 1

  settlementId: SettlementId;
  worldId: WorldId;

  persons: { [id: PersonId]: PersonOverride };

  // Baseline index
  editedPersonIds: PersonId[];

  // Optional: quick access to important NPCs
  importantPersonIds?: PersonId[];

  // Optional future richer indexes (by family, occupation, etc.)
  indexes?: {
    byFamilyId?: { [familyId: string]: PersonId[] };
    byOccupationId?: { [occupationId: string]: PersonId[] };
    byImportanceTier?: { [tier in ImportanceTier]?: PersonId[] };
  };

  meta?: {
    lastModified?: number;
  };
}
```

**Filesystem layout (v1):**

- `data/worlds/<worldId>/world.json` – world metadata including `currentYear`.
- `data/worlds/<worldId>/families.json` – `{ version, families: { [familyId]: Family } }`.
- `data/worlds/<worldId>/settlements/<settlementId>/population-overrides.json` – one `SettlementPopulationOverridesFile` per settlement.

---

## 5. Time & Evolution

### 5.1 World time

- The world has a single authoritative `currentYear` stored in world data.
- Population evolution happens in **discrete jumps**:
  - The user chooses a `deltaYears` (e.g. +1, +5, +10).
  - The system advances `currentYear` and runs a population update pass.

Proposed entry point (pseudocode):

```js
function advanceWorldYears(deltaYears) {
  // 1. Update world.currentYear
  // 2. For each relevant region/settlement (worldwide for now):
  //    - run births/deaths based on demographic rules
  //    - apply key promotions / title changes
  //    - persist important changes via recordLifeEvent / editPerson
}
```

### 5.2 Life events & persistence

- **Life events** include: `birth`, `death`, `marriage`, `promotion`, `other`.
- All persistence of such events goes through one helper:

```js
function recordLifeEvent(personId, event) {
  // updates overrides & indexes according to type:
  // - death: set deathYear, isAlive=false
  // - marriage: update parents/partners, possibly family links
  // - promotion: adjust classScore, occupationId, tags, importanceTier, etc.
}
```

- **Deaths persist**: important deaths write `deathYear` overrides.
- **Marriages / parent links persist**: parentage and marriages are stored once created.
- **Big promotions / titles persist**: peasant→baron etc. always become overrides.

### 5.3 Genealogy depth

- Guarantee **parents** (2 links) resolvable for any living individual.
- Provide **best-effort grandparents** and older ancestors, but:
  - If needed for performance / complexity, limit how many generations back we derive from the initial set of currently living individuals.

Helpers should be designed to support deeper trees later without changing signatures.

---

## 6. Indexing & Hard Fields

### 6.1 Indexing (v1)

- On disk (per settlement):
  - `persons` map.
  - `editedPersonIds` array.
  - Optional `importantPersonIds`.
- In memory:
  - Build additional lightweight maps on load as needed:
    - `familyId -> [personIds]` (for edited/important people).
    - `occupationId -> [personIds]` (per settlement, if needed).

These in-memory indexes can later be promoted into persisted `indexes` blocks without breaking existing data.

### 6.2 Hard vs soft fields

- **Hard fields** (normal tools must not edit directly):
  - `id`, `worldId`, `familyId`, `parents`.
- **Soft fields** (overrideable):
  - `currentLocation`, `classScore`, `occupationId`, `birthYear`, `deathYear`, `raceId`, `cultureId`, `religionId`, `notes`, `tags`, `importanceTier`.

All writes go through `editPerson` / `recordLifeEvent` so that we can:

- Enforce invariants.
- Update in-memory indexes.
- Keep a clean separation between procedural and authored data.

---

## 7. Public API Surface (v1)

Signatures are **sync**, and returned objects are meant to be treated as **read-only**. All edits go through explicit calls.

### 7.1 Read APIs

```ts
function getPerson(id: PersonId): IndividualBase | null;

interface PeopleQueryOptions {
  fields?: (keyof IndividualBase)[];      // subset for partial fetches
  importanceAtLeast?: ImportanceTier;     // e.g. "tracked"
  occupationIds?: string[];
  classScoreMin?: number;
  classScoreMax?: number;
}

function getPeopleInSettlement(
  settlementId: SettlementId,
  options?: PeopleQueryOptions
): IndividualBase[]; // or Partial<IndividualBase>[] if fields is used

interface HouseholdWithMembers {
  household: Household;
  members: IndividualBase[];
}

function getHousehold(householdId: HouseholdId): HouseholdWithMembers | null;

function getFamily(familyId: FamilyId): Family | null;

interface Relatives {
  parents: IndividualBase[];
  children: IndividualBase[];
  siblings: IndividualBase[];
  partners: IndividualBase[];
}

function getRelatives(id: PersonId, depth?: number): Relatives;
```

### 7.2 Edit APIs

```ts
type PersonPatch = Partial<IndividualBase> & {
  notes?: string;
  tags?: string[];
  importanceTier?: ImportanceTier;
};

function editPerson(id: PersonId, patch: PersonPatch): void;

function clearPersonOverrides(id: PersonId): void;

interface PersonLocation {
  settlementId: SettlementId;
  buildingId?: string;
  x?: number;
  y?: number;
}

function movePerson(id: PersonId, newLocation: PersonLocation): void;

type LifeEventType = "birth" | "death" | "marriage" | "promotion" | "other";

interface LifeEvent {
  type: LifeEventType;
  year: number;
  details?: any; // structured per event type later
}

function recordLifeEvent(id: PersonId, event: LifeEvent): void;

function advanceWorldYears(deltaYears: number): void;
```

These entry points should be the only public way other systems interact with individuals.

---

## 8. Implementation Roadmap (Phases)

**Phase 1 – Scaffolding & Config**
- Create population modules and wire them into build/runtime (no UI yet).
- Implement basic type/shape checks and file loading for overrides and families.

**Phase 2 – Seed-Only Individuals**
- Implement seed-based generation for `IndividualBase` (no overrides yet).
- Hook into world seed, settlements, and demographic configs.

**Phase 3 – Overrides & Persistence**
- Implement per-settlement overrides loading/writing with `version`.
- Implement `getPerson`, `editPerson`, `clearPersonOverrides` using the schemas above.
- Maintain `editedPersonIds` and optional `importantPersonIds`.

**Phase 4 – Time & Life Events**
- Introduce `currentYear` plumbing if not already present.
- Implement `advanceWorldYears(deltaYears)` and `recordLifeEvent`.
- Add basic rules for deaths, births, and promotions (config-driven).

**Phase 5 – Indexes & Tools**
- Add in-memory indexes for fast queries (family, occupation, tier) at load time.
- Implement `getPeopleInSettlement`, `getRelatives`, and `getHousehold` using indexes to stay efficient.

**Phase 6 – UI & Authoring Support**
- Build debug/authoring UIs to:
  - Browse individuals per settlement.
  - View and edit key fields (names, class, occupation, notes, location).
  - Inspect genealogies (at least parents + siblings).

**Phase 7 – Future Extensions (Optional)**
- Rich dynasties (more detailed `Family` objects, history, titles).
- Additional indexes (global importance, per-region, per-race).
- Deep traits/appearance/backstory modules.
- Integration with other systems (religion, states, Underdark, etc.).
