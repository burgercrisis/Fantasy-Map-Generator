# Underdark Feature – Developer Guide
_Back to devplan overview: [Changes vs Azgaar overview](Changes-vs-Azgaar-master.md)_

This document outlines the plan for implementing the Underdark system in the Fantasy Map Generator. It is intentionally high-level and code-oriented, so future work sessions can implement it in phases without re‑designing the feature.

### Section index

- [0. Goals & Constraints](#0-goals--constraints)
- [1. High-Level Architecture](#1-high-level-architecture)
- [2. Data Structures](#2-data-structures)
- [3. Integration Points](#3-integration-points)
- [4. UI Plan (Skeleton Only)](#4-ui-plan-skeleton-only)
- [5. Generation Pipeline (Conceptual)](#5-generation-pipeline-conceptual)
- [6. Editing Behavior (Minimal MVP)](#6-editing-behavior-minimal-mvp)
- [7. Reroll & Regeneration Policies](#7-reroll--regeneration-policies)
- [8. Phased Implementation Checklist](#8-phased-implementation-checklist)

---

## 0. Goals & Constraints

- Add a **second world-space** (Underdark) under the same surface map.
- Provide **three depth bands**:
  - Upperdark – near-surface caves, mines, crypts.
  - Middledark – large caverns, fungal forests, deep roads.
  - Lowerdark – anomalies, magma, ancient/aberrant realms.
- Generate Underdark **procedurally from the existing map**, but not as a 1:1 mirror.
- Support **auto-generation for new maps** and **opt‑in generation** for old saves.
- Make Underdark **viewable as its own 2D mode** (no 3D/Globe in v1).
- Provide:
  - Complexity slider.
  - Entrances density slider.
  - Cult density + tie‑to‑surface slider (ties into surface religions & diffusion; see [Evolving Simulation – Design Choices §3](Evolving-Simulation-Choices.md#3-culture--religion-diffusion)).
  - Anomaly density slider.
- Allow minimal editing:
  - Mark/unmark settlements in caverns.
  - Change cavern faction.
  - Open/close entrances.
- Keep the system **deterministic** via dedicated seeds.
- Allow **regeneration / rerolls** without breaking saves, using overrides.

---

## 1. High-Level Architecture

### 1.1 New modules

**Generator:**
- File: `modules/underdark-generator.js`
- Responsibilities:
  - Construct Underdark geometry and metadata from:
    - surface data (cells, heightmap, rivers, routes, cultures, states, religions, anomalies).
    - `underdarkConfig` and generator options.
  - Output an in-memory `underdarkRuntime` structure.

**Renderer:**
- File: `modules/renderers/draw-underdark.js`
- Responsibilities:
  - Draw Underdark geometry for the active level (Upper / Middle / Lower).
  - Apply ghosting for non-active levels when enabled.
  - Respect layer visibility (Caverns, Tunnels, Deep Roads, Water, Factions, Labels, Entrances).

**(Optional, later)** UI helper:
- File: `modules/ui/underdark.js`
- Responsibilities:
  - Event handlers specific to Underdark tools (editing, debug overlays, etc.).
  - For v1, this can be folded into existing UI modules if simpler.

### 1.2 Data layers

There are three conceptual layers of data:

1. **Configuration (saved)** – persistent map-level settings.
2. **Overrides (saved)** – user edits that should survive regeneration.
3. **Runtime (not necessarily saved)** – generated geometry for current session.

---

## 2. Data Structures

### 2.1 `underdarkConfig` (saved)

Attach to the main map data structure (alongside `options`, `notes`, etc.). This should be a JSON-serializable object.

**Shape (draft):**

```js
const underdarkConfig = {
  enabled: false,             // true if Underdark exists for this map
  version: 1,                 // Underdark schema version

  // Seeds (deterministic behavior)
  seed: null,                 // main Underdark seed (derived from map seed if null)
  entranceSeed: null,         // seed for entrances & surface connections

  // Global complexity
  complexity: 100,            // percent, default 100, affects caverns/tunnels/factions

  // Density controls
  entrancesDensity: 100,      // 0–200, base scaling for number of entrances
  cultDensity: 100,           // 0–300, expected cult centers
  cultSurfaceTiePercent: 40,  // 0–100, fraction of cults tied to surface holy sites
  anomalyDensity: 100,        // 0–300, expected Lowerdark anomalies

  // Display behavior
  ghostOtherLevels: true,     // show ghosted caverns from other depths when in one level

  // Future extension point
  dangerProfile: "default"    // placeholder for possible future variations
};
```

Notes:
- `seed` and `entranceSeed` can be derived from the main map seed (e.g., `seed + 1000`, `seed + 2000`) when `null`.
- `version` allows for future migration if the schema changes.

### 2.2 `underdarkOverrides` (saved)

Stores only user edits that must be reapplied after regeneration.

**Shape (draft):**

```js
const underdarkOverrides = {
  // Settlement edits in caverns
  settlements: [
    {
      id: "ovr-set-1",        // override id
      level: 1,                // 0: Upper, 1: Middle, 2: Lower
      targetId: "cavern-123", // original cavern id if still present
      cellId: 456,             // primary surface cell anchor (for reattachment)

      hasSettlement: true,     // whether user wants a settlement here
      name: null,              // explicit name if user changed it (optional)
      type: null               // type/class of settlement (optional)
    }
  ],

  // Faction assignments
  factions: [
    {
      id: "ovr-fac-1",
      level: 2,
      targetId: "cavern-999",
      cellId: 987,

      factionId: "deep-dwarves" // override faction key
    }
  ],

  // Entrances (open/closed or other edits)
  entrances: [
    {
      id: "ovr-ent-1",
      level: 0,
      targetId: "entrance-321",
      cellId: 321,

      isOpen: false            // user closed this entrance
      // potential future fields: relocated cell, notes, etc.
    }
  ]
};
```

Key idea:
- Each override stores **both** a `targetId` (original generated feature id) and a **location anchor** (`cellId`, `level`).
- On reroll/regeneration we try:
  1. Re-attach by `targetId`.
  2. Failing that, find best match by `(cellId, level, type)`.
  3. If no good match, drop and report.

### 2.3 `underdarkRuntime` (in-memory)

**Not required** to be serialized in saves; can be regenerated from `underdarkConfig` and the surface map.

**Shape (draft):**

```js
const underdarkRuntime = {
  levels: [
    {
      id: 0,                    // 0: Upperdark
      name: "Upperdark",

      caverns: [
        {
          id: "cavern-123",
          level: 0,
          cells: [/* cell ids */],
          centroid: {x, y},
          area: 0,
          type: "dry" | "wet" | "fungal" | "ruin" | "anomaly" | ...,
          factionId: "deep-dwarves", // before overrides
          hasSettlement: false,       // before overrides
          tags: []
        }
      ],

      tunnels: [
        {
          id: "tunnel-10",
          level: 0,
          type: "natural" | "road" | "water",
          cells: [/* polyline cell ids */]
        }
      ],

      verticalLinks: [
        {
          id: "vert-5",
          fromLevel: 0,
          toLevel: 1,
          cellId: 789,
          type: "shaft" | "chasm" | "well" | "sinkhole"
        }
      ],

      waterBodies: [
        {
          id: "uwater-1",
          level: 1,
          cells: [/* cell ids */],
          type: "river" | "lake" | "sea"
        }
      ],

      // Derived label data for rendering
      labels: [ /* label objects for caverns, regions, etc. */ ]
    },

    // Middledark / Lowerdark levels follow same structure
  ],

  factions: [
    {
      id: "deep-dwarves",
      name: "Deep Dwarves of X",
      color: "#AA8844",
      type: "dwarf",
      sourceCulture: 3  // index of nearby surface culture (if applicable)
    }
  ],

  entrances: [
    {
      id: "entrance-321",
      level: 0,
      cellId: 321,
      type: "cave" | "mine" | "sinkhole" | "portal",
      connectsTo: {
        level: 1,
        targetId: "cavern-123" // main cavern this entrance feeds
      }
    }
  ],

  cultSites: [
    {
      id: "cult-1",
      level: 1,
      cavernId: "cavern-123",
      cellId: 654,
      isSurfaceTied: true,      // if linked to a surface holy site
      surfaceReligionId: 2      // optional pointer
    }
  ],

  anomalies: [
    {
      id: "anom-1",
      level: 2,
      cavernId: "cavern-777",
      cellId: 999,
      type: "magical" | "magma" | "void" | ...
    }
  ]
};
```

Implementation detail: `underdarkRuntime` can live in a global variable or in a dedicated namespace object, similar to how other generator outputs are handled. Faction `sourceCulture` and cult/religion pointers are expected to align with the race and tag mapping described in [Races & Languages – System Rules §7.3 Evolving Simulation & Underdark](Races-Languages-Rules.md#73-evolving-simulation--underdark).

---

## 3. Integration Points

### 3.1 Save / load pipeline

Files to modify:
- `modules/io/save.js`
- `modules/io/load.js`

**Save (prepareMapData):**
- Extend the main data object (whatever currently holds `options`, `notes`, etc.) with:
  - `underdarkConfig`
  - `underdarkOverrides`
- Ensure they are always present, even if `enabled` is `false`.

**Load (uploadMap / parse):**
- When parsing map data:
  - If `underdarkConfig` and `underdarkOverrides` exist, use them.
  - If missing (older saves):
    - Set `underdarkConfig = {enabled: false, version: 1, ...defaults}`.
    - Set `underdarkOverrides = {settlements: [], factions: [], entrances: []}`.

### 3.2 Map generation hook

Where to hook:
- After surface generation is fully complete (heightmap, rivers, cultures, states, religions, routes, etc.).
- Typical candidate: the place where `generateMapOnLoad` or the main generation pipeline finishes.

Behavior:
- On new map generation:
  - If global `options.underdarkEnabled` is true:
    - Initialize `underdarkConfig` from defaults and `seed`.
    - Call `UnderdarkGenerator.generate(underdarkConfig, surfaceData)`.
    - Store result in `underdarkRuntime`.
- On older maps:
  - Do nothing by default.
  - Let user explicitly invoke `Generate Underdark for this map` from Tools.

---

## 4. UI Plan (Skeleton Only)

### 4.1 View mode toggle

File to adjust:
- `modules/ui/options.js`

Plan:
- Add an `Underdark` button to the `viewMode` group alongside `Standard`, `3D scene`, and `Globe`.
- Implement a function `enterUnderdarkView()` which:
  - Stores active view state (`viewStandard`, etc.).
  - Switches renderer to Underdark:
    - `drawUnderdark(activeLevel, underdarkRuntime, style, layerState)`.
  - Keeps current camera coordinates or re-centers later if needed.

### 4.2 Depth band controls

- Expose three buttons in Underdark mode:
  - `Upper`, `Middle`, `Lower`.
- Store current level in `underdarkState.currentLevel` (0 / 1 / 2).
- When a level button is clicked:
  - Update `underdarkState.currentLevel`.
  - Re-trigger Underdark draw.

Exact placement:
- Can live in the same Options tab area as `viewMode` or as an overlay above the map; finalize during implementation.

### 4.3 Layers tab

File to adjust:
- `modules/ui/layers.js`

Plan:
- Add new layers (with ids and friendly labels):
  - `underdarkCaverns`
  - `underdarkTunnels`
  - `underdarkDeepRoads`
  - `underdarkWater`
  - `underdarkFactions`
  - `underdarkLabels`
  - `entrances` (shared layer for both surface and Underdark)

Behavior:
- When in surface view:
  - Underdark-only layers can be hidden in UI or disabled; `entrances` may still be visible (e.g., entrance icons on surface).
- When in Underdark view:
  - Surface-only layers can be greyed out or ignored.

### 4.4 Style tab

File to adjust:
- `modules/ui/style.js`

Plan:
- Introduce Underdark-specific style entries:
  - Cavern fill colors per level (Upper/Middle/Lower).
  - Tunnel/road stroke styles.
  - Ghosting opacity / filter for non-active levels.
- Add a simple control for ghosting behavior:

  - Toggle or radio:
    - `Current level only`
    - `Current + ghost other levels`

Bound to `underdarkConfig.ghostOtherLevels`.

### 4.5 Options tab (generator settings)

Extend `Options` under **Generator settings** or a dedicated **Underdark** section with:

- `[x] Enable Underdark for new maps` (global option).
- `Underdark complexity` slider (0–200%).
- `Underdark entrances density` slider (0–200%).
- `Underdark cult density` slider (0–300%).
- `Cults tied to surface sites` slider (0–100%).
- `Underdark anomaly density` slider (0–300%).

These directly feed into default `underdarkConfig` for newly generated maps.

### 4.6 Tools tab

Add an **Underdark** subsection with these buttons:

- `Generate Underdark for this map`
- `Regenerate Underdark`
- `Re-roll Underdark`
- `Re-roll Entrances & Links`

Behaviors (later implementation):
- **Generate Underdark for this map**
  - For old saves or maps with `underdarkConfig.enabled === false`.
  - Creates default `underdarkConfig`, runs generator, sets `enabled = true`.

- **Regenerate Underdark**
  - Uses existing `underdarkConfig` and seeds.
  - Rebuilds `underdarkRuntime`.
  - Reapplies `underdarkOverrides`.

- **Re-roll Underdark**
  - Changes `underdarkConfig.seed`.
  - Rebuilds runtime.
  - Attempts to reapply overrides by `targetId` or by best location match.
  - Drops overrides with no good match and shows a summary.

- **Re-roll Entrances & Links**
  - Changes `underdarkConfig.entranceSeed`.
  - Regenerates entrances and related deep-road connections.
  - Reapplies entrance overrides similarly.

---

## 5. Generation Pipeline (Conceptual)

This section is to guide actual implementation in `underdark-generator.js`.

### 5.1 Inputs

- Surface data:
  - Cells, vertices, heightmap, relief.
  - Rivers and lakes.
  - Cultures, states, religions, routes.
  - Existing magic/terrain anomalies (if any).
- `underdarkConfig`.
- RNG seeded with `underdarkConfig.seed` and `entranceSeed`.

### 5.2 Derived fields

Precompute for each cell (or region):

- `depthPotential` – higher under mountains/high elevation; lower under shallow sea.
- `rockStability` – prefer stable rock for tunnels and deep roads.
- `waterSaturation` – near rivers/lakes; influences wet caverns.
- Optional: `magicPotential` – derived from existing anomaly or noise fields.

These can be implemented as arrays parallel to existing cell arrays.

### 5.3 Level and cavern generation

For each depth level (Upper, Middle, Lower):

1. Compute a **cavern likelihood** per cell using:
   - `depthPotential`, level depth, noise.
2. Threshold and region-grow to form cavern blobs (groups of cells).
3. Classify caverns by type (dry, wet, fungal, ruin, anomaly candidate).
4. Assign factions to caverns using a hybrid approach:
   - Some global Underdark archetypes.
   - Some influenced by nearby surface cultures/states.

### 5.4 Tunnels & deep roads

- Natural tunnels:
  - Connect nearby caverns in high-stability areas.
- Deep roads:
  - Choose anchor nodes (major caverns near important surface cities, mines, or religious/magical sites).
  - Build a network via pathfinding over a cost field combining stability and depth.
  - Add a few loops for redundancy.

### 5.5 Entrances and surface connections

- Use `entrancesDensity` to compute target number of entrances.
- Select candidate cells:
  - Mountain slopes, high relief, cliffs, canyon edges.
  - Towns/mines with high `depthPotential`.
- Link each entrance to a nearby Upperdark or Middledark cavern.
- Occasionally mark patterns where a surface route “dives” underground at one entrance and re-emerges at another.

### 5.6 Cult centers & anomalies

- Determine total expected cult sites from `cultDensity` and map size.
- Split into:
  - Surface-tied cults – located in caverns under existing religious centers.
  - Purely-underdark cults – generated in caverns chosen by internal factors.
- Determine anomalies from `anomalyDensity`:
  - Prefer Lowerdark.
  - Bias to cells with magical anomalies or strong depth/relief extremes.

### 5.7 Apply overrides

After generation:

1. Start from a fresh `underdarkRuntime`.
2. For each override in `underdarkOverrides`:
   - Attempt to find a target by exact `targetId`.
   - If missing, search caverns/entrances in the same `level` and near `cellId`.
   - If a good match is found (within distance threshold, same type), reapply;
     otherwise drop and mark as discarded in a summary.

---

## 6. Editing Behavior (Minimal MVP)

High-level idea:

- In Underdark view, clicking features opens contextual actions.

### 6.1 Cavern edits

- Actions:
  - Toggle settlement: add/remove a settlement in that cavern.
  - Change faction: open a small selector (list of available Underdark factions).
- Implementation:
  - Write/edit a `settlements` or `factions` entry under `underdarkOverrides`.
  - Re-render the Underdark view.

### 6.2 Entrance edits

- Actions:
  - Open/Close entrance.
- Implementation:
  - Create/update an `entrances` override entry tied to that entrance’s id and cell.

---

## 7. Reroll & Regeneration Policies

Summarized rules for implementation:

- **Regenerate Underdark**:
  - Do not change seeds.
  - Re-run full generator; reapply overrides.

- **Re-roll Underdark**:
  - Change `underdarkConfig.seed`.
  - Re-run generator; try to reattach overrides by id/location.
  - Drop unmatched overrides and show a summary like:
    - `Underdark: 13 edits reapplied, 2 discarded (no matching features after reroll).`

- **Re-roll Entrances & Links**:
  - Change `underdarkConfig.entranceSeed` only.
  - Regenerate entrances and deep-road connections that depend on entrance layout.
  - Reapply entrance-related overrides similarly, with graceful dropping.

Implementation detail:
- A small helper function can encapsulate override attachment logic and reporting.

---

## 8. Phased Implementation Checklist

Use this as a step-by-step when working on the feature.

### Phase 1 – Data scaffolding & persistence

- [ ] Add `underdarkConfig` and `underdarkOverrides` objects to the global map data.
- [ ] In `save.js`, include them in the serialized map JSON.
- [ ] In `load.js`, parse them if present, else create defaults (with `enabled: false`).

### Phase 2 – UI shell

- [ ] Add Underdark button to view mode controls in `options.js` and stub `enterUnderdarkView()`.
- [ ] Add basic depth band buttons (Upper/Middle/Lower) with a simple `underdarkState.currentLevel`.
- [ ] Add Underdark entries to Layers tab (no drawing yet).
- [ ] Add Underdark options section (complexity/density sliders) to Options tab.
- [ ] Add Tools tab buttons (Generate / Regenerate / Re-roll Underdark / Re-roll Entrances) with `tip("Not implemented yet")` handlers.

### Phase 3 – Core generator

- [ ] Create `modules/underdark-generator.js` with a `generate(config, surface)` API.
- [ ] Implement derived fields, caverns, tunnels, deep roads, entrances, cults, and anomalies.
- [ ] Hook generator into new map creation when `options.underdarkEnabled` is true.
- [ ] Implement Tools → Generate Underdark for this map using the same generator.

### Phase 4 – Rendering

- [ ] Create `modules/renderers/draw-underdark.js` and integrate into main render pipeline.
- [ ] Implement drawing of caverns, tunnels, deep roads, water, entrances, and labels.
- [ ] Implement ghosting behavior controlled by `underdarkConfig.ghostOtherLevels`.
- [ ] Link layer toggles to visibility in the renderer.

### Phase 5 – Editing (minimal)

- [ ] Implement click handlers for caverns/entrances in Underdark mode.
- [ ] Implement overrides writing (`underdarkOverrides`) and reapplication.
- [ ] Ensure edits persist through save/load and regens.

### Phase 6 – Reroll tools & overrides policy

- [ ] Implement Regenerate, Re-roll Underdark, and Re-roll Entrances & Links.
- [ ] Implement override reattachment logic (id → location fallback → drop + summary).
- [ ] Test determinism with fixed seeds and config.

### Phase 7 – Perf & debug

- [ ] Allow unloading `underdarkRuntime` when not in Underdark view.
- [ ] Rebuild from `underdarkConfig` + overrides on entering Underdark.
- [ ] (Optional) Add Underdark debug view (heatmaps, stats) for tuning.

---

This guide is meant to be a living document. As implementation progresses, update structures and checklists to match reality (especially if the save format or generator API changes).
