# Evolving Simulation 13 Developer Guide
_Back to devplan overview: [Changes vs Azgaar overview](Changes-vs-Azgaar-master.md)_

This document outlines the plan for implementing an **Evolving World Simulation** layer in the Fantasy Map Generator. The focus is on **wars**, **rulers & dynasties**, **borders & territory**, **trade & politics**, and **burg lifecycle** (founding, growth, ruin, refounding).

The goal is the same spirit as `Individuals.md`: a high-level, code-oriented guide that can be implemented in phases without re‑designing the feature every time.

Use this file when you need to:
- Understand the overall architecture, data shapes, and time model for the evolving history layer.
- See how wars, rulers, borders, trade, and relationship events are represented and updated over time.

Related devplans (optional deep dives):
- [Evolving Simulation – Design Choices](Evolving-Simulation-Choices.md) – concrete algorithm and UX choices for smoothing, roads/trade, diffusion, and realm FSM/events.
- [Language System Status – Markov & Mixer](Languages-Status.md) – status and tooling for Markov bases and the language mixer that feed cultures and races.
- [Races & Languages – System Rules](Races-Languages-Rules.md) – how fantasy races attach to cultures and languages, and how those tags are exposed to the sim.
- [Characters System – Developer Guide](Characters.md) – D&D/d20 character layer on top of Individuals, which can consume history outputs.
- [Language mixer helper tools & workflows](../tools/HELPER-TOOLS.md) – CLI helper scripts and QA workflows for the language mixer and race language palettes; you’ll mainly reuse the race coverage/palette reporters (`report-race-language-coverage.js`, `report-per-race-language-coverage.js`, `report-race-language-palettes.js`) when adjusting long-term linguistic flavor used by the sim.

## Table of contents

- [0. Goals & Constraints](#0-goals--constraints)
- [1. High-Level Architecture](#1-high-level-architecture)
- [2. Time & Tick Model](#2-time--tick-model)
- [3. Data Schemas (Conceptual)](#3-data-schemas-conceptual)
- [4. Systems & Rules (Conceptual)](#4-systems--rules-conceptual)
- [5. Persistence & Determinism](#5-persistence--determinism)
- [6. Public API Surface (v1)](#6-public-api-surface-v1)
- [7. Implementation Roadmap (Phases)](#7-implementation-roadmap-phases)
- [8. Notes & Design Principles](#8-notes--design-principles)
- [9. Open Design Choices](#9-open-design-choices)

## 0. Goals & Constraints

- Represent **centuries of evolving history** without simulating every year or storing full per-year snapshots, while allowing **zoomed-in detail** for major wars, campaigns, and famous battles.
- Support:
  - **Wars** that start, escalate, split into campaigns, spawn famous battles, and end with clear victors/losers.
- **Rulers** who are always real Individuals: they are born, live, take thrones, suffer succession crises, and die with full life events.
- **Borders & territory** that grow and shrink through wars, campaigns, and politics.
- **Trade routes & politics** that form a rich graph and respond to geography, states, wars, and economic waves.
- **Burg lifecycle**: founded, upgraded, sacked, abandoned, refounded.
- **Relationship drama**: structured relationship events (lovers, heirs, rivals, allies) tied directly to Individuals and history.
  - **Rulers** who are always real Individuals: they are born, live, take thrones, suffer succession crises, and die with full life events.
  - **Borders & territory** that grow and shrink through wars, campaigns, and politics.
  - **Trade routes & politics** that form a rich graph and respond to geography, states, wars, and economic waves.
  - **Burg lifecycle**: founded, upgraded, sacked, abandoned, refounded.
  - **Relationship drama**: structured relationship events (lovers, heirs, rivals, allies) tied directly to Individuals and history.
- Use **discrete, interactive time jumps** compatible with the Individuals system:
  - The user can change tick size (e.g. +1 / +5 / +10 / +50 years) to see more or less happen per click.
- Keep the system **deterministic** from world seed + a small set of historical seeds, but allow **author overrides**.
- Make the simulation **optional and layered**:
  - World can exist without deep history.
  - History can be generated in a single pass or extended over time.
  - Deep detail (campaigns, battles, relationship graphs, economic waves) can be enabled/disabled or throttled per world.
- Be **forward-compatible**:
  - Design schemas and APIs so future extensions (rebellions, internal politics, religions, etc.) do not break saves.

---

## 1. High-Level Architecture

### 1.1 Core concepts

High-level conceptual objects this system works with:

- **State**: existing map state (kingdom/realm) with territory and capital.
- **Ruler**: a real Individual from the population system in charge of a state or major title.
- **Dynasty**: a lineage of rulers, tightly linked to Individuals/Families.
- **Title**: a named rank tied to territory or a state (e.g. "King of X").
- **War**: a long-running conflict between states/alliances, which may contain campaigns and famous battles.
- **Campaign**: a phase or theatre of a war, usually spanning years and multiple regions.
- **Battle**: a concentrated clash within a campaign, often with named commanders and burgs.
- **Border change**: a compact description of territory changing hands.
- **Treaty**: a diplomatic agreement (peace, alliance, vassalage, trade pact).
- **Trade route**: persistent economic connection between burgs/states (a graph edge in a wider network).
- **Burg event**: founding, destruction, abandonment, refounding, upgrade.
- **Relationship event**: history-significant ties between Individuals (lovers, heirs, rivals, allies, patrons, etc.).

The system is **event-based**:

- We avoid storing full maps for every year.
- Instead we store **important events** and derive views from those.

### 1.2 New modules (proposed)

Names are tentative; actual filenames should follow project conventions.

- `modules/history/history-core.js`
  - Central orchestration for the evolving simulation.
  - Time tick integration with global `currentYear`.
  - Loading/saving of history files.
- `modules/history/wars.js`
  - War generation, campaigns, battles, progression, and resolution rules.
  - War data access (`getWar`, `getWarsInRange`, `getWarsForState`, campaign/battle helpers).
- `modules/history/rulers.js`
  - Rulers, dynasties, titles, and succession rules.
  - Optional linkage into Individuals/Families when available.
- `modules/history/borders.js`
  - Compact representation of border/territory changes.
  - Helper to reconstruct approximate territory for a given year.
- `modules/history/trade.js`
  - Trade route network and political/economic agreements.
  - How wars, alliances, and economic waves affect trade.
- `modules/history/burgs.js`
  - Burg lifecycle events (found, sacked, abandoned, refounded).

Optional later:

- `modules/history/ui/history-ui.js` – timeline view, filters, overlays.

---

## 2. Time & Tick Model

### 2.1 World time integration

- The world already has a single authoritative `currentYear`.
- History advances in **discrete jumps** (consistent with Individuals):
  - User chooses `deltaYears` (e.g. fractions of a year for month-scale arcs up to +1 / +5 / +10 / +50 years for long bakes).
  - System advances `currentYear` and runs **history update passes**.

Proposed entry point (pseudocode):

```js
function advanceWorldYears(deltaYears) {
  // 1. Update world.currentYear.
  // 2. Notify subsystems in a defined order:
  //    a) population / individuals
  //    b) history-core (wars, rulers, borders, trade, burgs)
  //    c) any other systems
}
```

### 2.2 Tick granularity

- **Configurable tick size (interactive)**:
  - User-facing **slider** for `deltaYears` per tick.
  - "Deep sim" mode: 1–5 years per tick for step-by-step storytelling.
  - "History bake" mode: 10–50 years per tick for pre-generating centuries.
- Optional **auto-advance** mode:
  - Continually advance time using the current slider value.
  - Pause automatically on important events (e.g. war start/end, ruler succession, major battle, storyline climax).
- The evolving simulation should be **scale-aware**:
  - Many small ticks ≈ smoother changes and more visible micro-events.
  - Few big ticks ≈ more abstract, event-heavy timeline.
  - Some event types (e.g. famous battles) can be throttled or summarized when ticks are large.
  - Named **ages** are variable-length narrative bands defined as `YearRange`s over `currentYear`. A separate Ages view/screen lists each age, its span, and shows where the current year falls; ages are labels only and never force a fixed tick size. Details of the Age & time UI live in [Evolving Simulation – Design Choices §3](Evolving-Simulation-Choices.md#3-culture--religion-diffusion).

### 2.3 Event-based evolution

On each tick, `history-core`:

- Asks each submodule to **propose events** for `[year, year + deltaYears)`:
  - Wars that start, escalate, or end.
  - Border changes created by wars and peaceful treaties.
  - Ruler successions and dynastic transitions.
  - Trade route creation/closure/shifts.
  - Burg founding/ruin/refounding.
- Applies those events in a consistent order and writes them to history files.

---

## 3. Data Schemas (Conceptual)

Types below are **specification**, not final code. They can be implemented as JS, TS, or plain JSON structures.

### 3.1 Common types

```ts
type WorldId = string;
type StateId = string;    // existing state index/id
type BurgId = string;     // existing burg index/id
type DynastyId = string;
type TitleId = string;
type WarId = string;
type CampaignId = string;
type BattleId = string;
type TradeRouteId = string;
type RelationshipEventId = string;
type StorylineId = string;

// Individual system integration (tight): rulers and key figures are always Individuals
type PersonId = string; // id from Individuals system

interface YearRange {
  startYear: number;
  endYear?: number | null; // null => ongoing
}

// Generic helper for timeline events
interface HistoryEventMeta {
  id: string;        // unique per event
  worldId: WorldId;
  year: number;      // main year for the event
  createdBy?: string; // tool/user id
  notes?: string;
  tags?: string[];
}
```

### 3.2 Wars

```ts
interface WarSide {
  primaryStateId: StateId;
  allies: StateId[];          // can be empty
  goalSummary?: string;       // e.g. "Reclaim coastal duchy"
}

interface WarOutcome {
  result: "attackerVictory" | "defenderVictory" | "stalemate" | "whitePeace";
  mainVictorStateId?: StateId;
  mainLoserStateId?: StateId;

  // Compact summary of territorial changes
  territoryChanges?: BorderChangeSummary[];

  // Optional later: reparations, vassalization, dynastic changes
}

interface BorderChangeSummary {
  fromStateId: StateId;
  toStateId: StateId;
  // Implementation decides whether this is a list of cells, regions, or
  // precomputed polygons; keep it abstract in v1.
  regionKeys: string[]; // e.g. province ids, named regions, or cell ranges
}

interface War {
  id: WarId;
  worldId: WorldId;

  name?: string;          // e.g. "War of the Western Marches"
  type?: string;          // e.g. "conquest", "religious", "succession"
  casusBelli?: string;    // short description

  period: YearRange;      // startYear + optional endYear

  attackers: WarSide;
  defenders: WarSide;

  // Abstract progress metrics
  progressScore?: number; // -1..+1, where +1 => attackers dominant
  intensity?: number;     // rough magnitude (0..1 or 0..100)

  // Deep structure
  campaignIds?: CampaignId[]; // major phases
  keyBattleIds?: BattleId[];  // famous battles worth naming

  outcome?: WarOutcome;

  meta?: {
    notes?: string;
    tags?: string[];
  };
}

interface Campaign {
  id: CampaignId;
  worldId: WorldId;
  warId: WarId;

  name?: string;               // e.g. "Northern Marches Campaign"
  theatreRegionKeys: string[]; // provinces/regions where the campaign occurs

  period: YearRange;

  attackerStateIds: StateId[];
  defenderStateIds: StateId[];

  progressScore?: number;      // -1..+1, local to the theatre
  intensity?: number;          // magnitude in this theatre

  keyBattleIds?: BattleId[];

  meta?: {
    notes?: string;
    tags?: string[];
  };
}

interface Battle {
  id: BattleId;
  worldId: WorldId;
  warId: WarId;
  campaignId?: CampaignId;

  name?: string;               // e.g. "Battle of Three Rivers"

  location: {
    burgId?: BurgId;
    cellId?: number;
    x?: number;
    y?: number;
  };

  year: number;

  attackerStateIds: StateId[];
  defenderStateIds: StateId[];

  attackerCommanderIds?: PersonId[]; // generals, rulers, etc.
  defenderCommanderIds?: PersonId[];

  result: "attackerVictory" | "defenderVictory" | "inconclusive";

  casualtiesApprox?: {
    attackers: number;
    defenders: number;
  };

  meta?: {
    notes?: string;
    tags?: string[]; // e.g. ["decisive", "pyrrhic", "siege"]
  };
}
```

### 3.3 Rulers, dynasties, and titles

```ts
interface Dynasty {
  id: DynastyId;
  worldId: WorldId;

  displayName?: string;  // e.g. "House Voren"
  originStateId?: StateId;
  coatOfArmsId?: string;

  meta?: {
    notes?: string;
    tags?: string[];     // e.g. ["noble", "merchant", "foreign"]
  };
}

interface Ruler {
  id: string;
  worldId: WorldId;

  // Tight integration: every ruler is a real Individual.
  personId: PersonId;

  dynastyId?: DynastyId;
  primaryStateId: StateId;

  titleIds: TitleId[];   // main titles held

  reign: YearRange;      // when they are considered to rule

  accessionType?: "inheritance" | "usurpation" | "election" | "appointment" | "other";
  exitType?: "death" | "abdication" | "deposed" | "other";

  meta?: {
    notes?: string;
    tags?: string[];     // e.g. ["cruel", "reformer", "child-ruler"]
  };
}

interface Title {
  id: TitleId;
  worldId: WorldId;

  name: string;          // e.g. "King of Eldoria"
  rank?: string;         // e.g. "king", "duke", "count"

  // Optional link to territory
  primaryStateId?: StateId;
  regionKeys?: string[]; // provinces/regions where title is rooted

  // Minimal timeline (who holds this title when)
  holders: Array<{
    rulerId: string;
    period: YearRange;
  }>;

  meta?: {
    notes?: string;
    tags?: string[];
  };
}
```

### 3.4 Trade routes and politics

```ts
interface TradeRouteNode {
  type: "burg" | "state";
  burgId?: BurgId;
  stateId?: StateId;
}

interface TradeRoute {
  id: TradeRouteId;
  worldId: WorldId;

  from: TradeRouteNode;
  to: TradeRouteNode;

  medium: "land" | "sea" | "river" | "mixed";

  period: YearRange;

  // High-level economic weight (relative)
  importance: number; // 0..1

  // Optional linkage to wars / politics
  disruptedByWarIds?: WarId[];

  meta?: {
    notes?: string;
    tags?: string[]; // e.g. ["silk", "spice", "pilgrimage"]
  };
}

interface Treaty extends HistoryEventMeta {
  type: "peace" | "alliance" | "vassalage" | "tradePact" | "embargo";

  signatoryStateIds: StateId[];

  relatedWarId?: WarId;
}
```

### 3.5 Burg lifecycle

```ts
type BurgEventType =
  | "founded"
  | "upgraded"
  | "sacked"
  | "burned"
  | "abandoned"
  | "refounded";

interface BurgEvent extends HistoryEventMeta {
  burgId: BurgId;
  type: BurgEventType;

  // Optional links
  relatedWarId?: WarId;
  relatedStateId?: StateId;
}
```

### 3.6 Relationship events (Individuals integration)

```ts
type RelationshipType =
  | "lover"
  | "spouse"
  | "heir"
  | "rival"
  | "ally"
  | "patron"
  | "protege";

interface RelationshipEvent extends HistoryEventMeta {
  id: RelationshipEventId;

  type: RelationshipType;

  // Usually 2 people, but keep it flexible for groups/factions.
  personIds: PersonId[];

  // 0..100 numeric strength; higher = stronger bond or hostility (see tiers below)
  strength?: number; // default thresholds and behavior rules defined in systems section

  description?: string; // short human-readable summary

  // Optional links to other history
  relatedWarId?: WarId;
  relatedStateId?: StateId;
  relatedBurgId?: BurgId;

  // Optional narrative grouping: this event is a beat in a larger arc
  storylineId?: StorylineId;
}
```

### 3.7 Storylines (relationship and political arcs)

```ts
interface Storyline {
  id: StorylineId;
  worldId: WorldId;

  name?: string;          // e.g. "Affair of the Crimson Court"
  description?: string;   // short synopsis of the arc

  // Optional main cast
  mainPersonIds?: PersonId[];
  mainStateIds?: StateId[];

  // Rough timing of the arc
  period: YearRange;

  // Events participating in this storyline (relationship, wars, treaties, etc.)
  eventIds: string[];

  meta?: {
    notes?: string;
    tags?: string[];      // e.g. ["romance", "succession", "tragedy"]
  };
}
```

---

## 4. Systems & Rules (Conceptual)

### 4.1 War generation & evolution

- **Inputs**:
  - State geography (neighbors, coastlines, chokepoints).
  - State attributes (military strength, stability, wealth, culture/religion).
  - Existing treaties, alliances, and recent wars.
- **War start** (hazard model per neighbor pair):
  - Compute a **tension score** for each pair of neighboring states.
  - Convert tension into a yearly chance of war; accumulate over ticks.
  - When threshold crossed, spawn a new `War` with initial metadata.
- **War progression** (per tick):
  - Update `progressScore` and `intensity` using rules based on:
    - Terrain advantages.
    - Relative strength and development.
    - Naval access and important burgs.
  - Group multi-year regional pushes into `Campaign`s.
  - Occasionally spawn named `Battle`s at key burgs/chokepoints with commanders.
  - Optionally mark some regions as "contested" for visual overlays.
- **War termination**:
  - If progress strongly favors one side or both sides exhausted:
    - Generate a `WarOutcome` and a corresponding `Treaty` (peace).
    - Produce `BorderChangeSummary` items and apply to state territories.

### 4.2 Rulers & dynasties

- Every state has a **timeline of rulers**.
- On each tick:
  - Check for ruler death/abdication conditions (randomized but seeded).
  - Decide accession type for next ruler (inheritance, usurpation, election).
- Integration with Individuals (tight):
  - `Ruler.personId` always points to a real Individual.
  - If needed, the history generator can auto-create Individuals for missing rulers.
  - Ruler life events (accession, marriage, abdication, death) are also stored as Individuals `LifeEvent`s.
- Succession rules & crises:
  - Each culture/state chooses a **succession preset** (e.g. primogeniture, elective, tanistry) from a small menu.
  - Presets are backed by a **rich data DSL** in JSON (conditions, weights, tags) so behavior is transparent and editable without code.
  - The DSL supports **complex predicates**:
    - culture tags and subcultures,
    - race and religion tags,
    - relationship tiers/strengths between claimants and key figures.
  - The data DSL is designed to be **forward-compatible** with optional internal script hooks later (e.g. advanced mod packs can plug in code-based rules on top, without breaking existing data), while keeping all logic fully deterministic and engine-local (no external AI calls).
  - When multiple strong claimants exist under the active rule, spawn special events:
    - Civil wars or contested wars tagged as succession conflicts.
    - Relationship events marking key rivalries and alliances.
- Output should support **storytelling**:
  - Short notes for notable transitions (e.g. "The usurper Thalen seized the throne").

### 4.3 Borders & territory

- Base map already tracks **state ownership per cell**.
- History layer records only **changes**, not full snapshots.
- On war resolution or major treaty:
  - Compute which regions/cells change owner.
  - Emit `BorderChangeSummary` and update the current world map.
- For visualization / queries:
  - Reconstruct **approximate borders at year Y** by replaying border events (or by storing sparse milestones if needed later).

### 4.4 Trade & politics

- Trade routes are generated from:
  - Distance between burgs.
  - Terrain and infrastructure.
  - State borders and sea access.
- On each tick:
  - Treat the trade system as a **graph** of routes between nodes (burgs/states).
  - Existing routes may **grow**, **decline**, or **end**.
  - New routes may appear where conditions are good.
  - Ongoing wars can **disrupt**, re-route, or permanently shift trade.
  - Economic waves (booms, depressions, plagues) can globally or regionally rescale route importance.
  - Per-world **scenario knobs** (e.g. `tradeDensity`, `tradeVolatility`) act as multipliers on how many routes exist and how noisy they are over time.
- Political events (treaties, alliances, vassalage):
  - Influence war likelihood and trade behavior.
  - Are recorded as `Treaty` events.

### 4.5 Burg lifecycle

- Burgs start as generated by the base world generator.
- History layer adds **event markers**:
  - `founded`: if simulating deep past, the first appearance.
  - `upgraded`: burg crosses a population/importance threshold.
  - `sacked` / `burned`: usually connected to a war.
  - `abandoned`: burg effectively disappears from the present map.
  - `refounded`: a successor settlement appears on/near the same site.
- These events:
  - Explain why some regions feel rich in ruins.
  - Provide hooks for stories, quests, or notes.

### 4.6 Relationship dynamics & tiers

- Relationship `strength` is interpreted on a **0–100 scale** and mapped into tiers:
  - 0–24: acquaintance / distant.
  - 25–49: **friend** / mild ally.
  - 50–74: **close friend** / strong ally.
  - 75–89: **lover** / very strong ally.
  - 90–100: **devoted** (soulmate, sworn brother, bitter arch-enemy if negative variants are ever added).
- Tiers are the **main thing surfaced in UI** (names, icons, and color), with numeric strength shown only in detailed views.
- Basic behavior rules (configurable per culture / race / religion / world):
  - Certain event types **require minimum tiers**:
    - Marriage / formal lover status requires at least the **lover** tier.
    - Blood-oath allies require **close friend** or higher.
  - If strength drops **below the minimum tier** for a relationship type:
    - There is a seeded chance each tick for that relationship to **cool or break** (e.g. lovers separating, friends drifting apart).
    - Some arcs may resist breaking (e.g. political marriages, dynastic alliances).
  - Positive events (shared victories, gifts, rescues) tend to **raise strength**.
  - Negative events (betrayal, dishonor, rival claims) tend to **lower strength** and may spawn or strengthen **rival** arcs instead.
- Cultures/races/religions can **tune thresholds** slightly (e.g. some treat "lover" at 60+, others at 80+), and the succession DSL can read these tiers when evaluating claimants.
- Storylines usually consist of **2–5 events** for local drama, plus **frequent overlapping arcs** in dense worlds and occasional **long dynastic arcs** spanning many rulers and wars.

---

## 5. Persistence & Determinism

### 5.1 Filesystem layout (v1 sketch)

- `data/worlds/<worldId>/history/wars.json`
  - `{ version, wars: { [warId]: War } }`
- `data/worlds/<worldId>/history/rulers.json`
  - `{ version, dynasties: { [dynastyId]: Dynasty }, rulers: { [id]: Ruler }, titles: { [titleId]: Title } }`
- `data/worlds/<worldId>/history/trade.json`
  - `{ version, routes: { [routeId]: TradeRoute }, treaties: { [id]: Treaty } }`
- `data/worlds/<worldId>/history/burg-events.json`
  - `{ version, events: BurgEvent[] }`

### 5.2 Deterministic generation

- Use world seed + small **history seeds** (e.g. `historyWarsSeed`, `historyRulersSeed`) to drive RNG.
- For a given world + history-seed configuration, **history is reproducible** unless the user edits it.
- All edits are stored as **overrides** in the history files (new/changed events).

---

## 6. Public API Surface (v1)

Signatures are conceptual. Returned objects should be treated as **read-only**; modifications go through explicit edit helpers.

### 6.1 Read APIs

```ts
function getWarsInRange(
  fromYear: number,
  toYear?: number,
  options?: { stateIds?: StateId[]; includeOngoing?: boolean }
): War[];

function getWarsForState(stateId: StateId): War[];

function getRulersForState(stateId: StateId): Ruler[];

function getDynasty(dynastyId: DynastyId): Dynasty | null;

function getTitle(titleId: TitleId): Title | null;

function getTradeRoutes(options?: {
  year?: number;
  stateId?: StateId;
}): TradeRoute[];

function getBurgHistory(burgId: BurgId): BurgEvent[];

// Border reconstruction helper (approximate)
function getStateTerritoryAtYear(stateId: StateId, year: number): {
  regionKeys: string[];
};
```

### 6.2 Edit APIs

```ts
function addOrEditWar(war: War): void;

function addWarOutcome(warId: WarId, outcome: WarOutcome): void;

function addRuler(ruler: Ruler): void;

function addDynasty(dynasty: Dynasty): void;

function addTitle(title: Title): void;

function addTradeRoute(route: TradeRoute): void;

function addTreaty(treaty: Treaty): void;

function recordBurgEvent(event: BurgEvent): void;

// Main time advancement entry point already exists conceptually
function advanceWorldYears(deltaYears: number): void; // history-core hooks in
```

---

## 7. Implementation Roadmap (Phases)

### Phase 1 – Scaffolding & config

- **History-core wiring**
  - Create `modules/history/history-core.js` and minimal submodules.
  - Wire into world loading/saving and `advanceWorldYears`.
- **File layout & versioning**
  - Implement loaders/writers for `wars.json`, `rulers.json`, `trade.json`, `burg-events.json`.
  - Add `version` fields and basic shape validation.

### Phase 2 – Passive history generator (one-shot)

- Implement a **single-pass generator** that:
  - Given a static world, world seed, and history seeds,
  - Generates a coarse multi-century history (wars, rulers, some border shifts) in one go.
- No per-tick UI yet; just populate history files to enrich the world.

### Phase 3 – Time integration & simple evolution

- Hook history generation into `advanceWorldYears(deltaYears)`:
  - For new worlds: allow a "bake history" step.
  - For ongoing worlds: allow the user to push time forward and grow history.
- Implement minimal rules for:
  - New wars starting & old wars ending.
  - Basic ruler succession.
  - Burg sacking/founding in response to wars.

### Phase 4 – Query helpers & UI hooks

- Implement all core **read APIs**.
- Add basic UI hooks:
  - Timeline panel listing wars & ruler changes over time.
  - Clicking a war highlights involved states and burgs.
  - Simple overlays for changed borders.

### Phase 5 – Trade routes and treaties

- Implement trade route generation and evolution.
- Add treaty events that:
  - Close or open routes.
  - Reduce or raise war likelihood.

### Phase 6 – Deeper integration with Individuals

- Link rulers to **Individuals** where available:
  - Use person IDs to anchor rulers and dynasties.
  - Record promotions, marriages, and deaths as both history and life events.
- Optional: expose a "notable rulers" view per person/family.

### Phase 7 – Future extensions (optional but planned for deep worlds)

- Detailed **campaigns and battles** (named campaigns, battles, commanders).
- Rich internal politics: civil wars, revolts, scripted succession crises.
- Structured **relationship events** shaping politics (lovers, heirs, rivals, patrons).
- Religious history: schisms, holy wars, reforms.
- Economic waves: booms, depressions, plagues affecting trade, burgs, and population.

---

## 8. Notes & Design Principles

- **Layered complexity**: start with coarse, evocative history; add detail only as needed.
- **Story-first outputs**: even if simulation is simple under the hood, events should read well in tooltips, logs, and UI.
- **Interoperability**: history should connect cleanly to Individuals, races, states, religions, and Underdark without hard-coupling.
- **Editability / toybox**: everything important is editable via high-level APIs and JSON, not hardcoded logic, with the default philosophy that the history layer is a **toybox** the user can play with.

---

## 9. Open Design Choices

This section records additional **high-level defaults** for how the system is exposed to users and modders:

- Succession uses **per-culture presets** backed by a **rich data DSL**, forward-compatible with optional internal script hooks later.
- Relationships form a **0–100 scored graph** with **tiered labels** (friend, lover, sworn enemy, etc.) and basic behavior rules.
- Battles/campaigns use a **hybrid** visibility model (timeline + map + blurbs).
- Trade is a **rich route graph** modulated by per-world **scenario knobs**.
- Tick UX is **advanced** (slider + optional auto-advance with pause rules), with **auto-advance off by default**.
- Performance vs detail uses a **non-linear continuous slider**, not just three presets.
- The history layer is a **toybox** with rich editing tools.
- First editor emphasis is on **wars & borders**, building on existing map/state structures; other editors (rulers, relationships, trade) follow.
- The succession DSL is **rich**, with complex predicates using culture/race/religion tags and relationship tiers.
- Relationship tier thresholds can be **tuned per culture/race/religion**, and those tiers are read by the succession DSL.
- Storylines tend toward **dense, overlapping arcs** in deep worlds, with occasional long dynastic epics.
- At large tick sizes, clusters of minor events are **summarized** into blurbs rather than all being shown individually.
- **Modding surface area**: provide **in-editor tools** for editing a safe subset of DSL rules, thresholds, and scenario knobs, while keeping advanced/unsafe rules in JSON/DSL files only.
- **Storyline tagging & filtering**: use **rich tags** (e.g. betrayal, exile, ruin, crusade, rebellion, plague) to enable fine-grained filters and overlays.
- **Summarization style**: use **template-based blurbs** by default, with a **switch in the options panel** to fall back to data-only logs when desired; both modes are fully deterministic and rely only on internal scripting, not external AI.

