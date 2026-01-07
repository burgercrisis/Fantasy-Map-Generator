# Heightmap World Builder (Composite Generator) Plan

Status (2025-12-19): All planning choices finalized. No implementation work started.

## 1) Goal

Create a new **composite heightmap generator** ("World Builder") that produces a single final `heights[]` array by combining:

- **Template-driven tectonic plates** (continents as large stamps)
- **Procedural oceanic plate baseline** (ocean plates start from a baseline; oceans get structure from boundaries + feature stamps)
- **Template-driven feature stamps** (islands, archipelagos, atolls, calderas, arcs, etc.) at smaller scales

This system should:

- Integrate **before the current heightmap pipeline** (i.e., output a normal `heights[]` compatible with existing downstream generation)
- Be **seeded / deterministic**
- Start as a **one-button** experience (MVP)
- Allow the **individual templates** (continents/local basins/features) to keep improving independently while also powering the composite generator

## 2) Approved choices (explicit)

- **Architecture (Option C):** macro-scale structure + stamps (but implemented as *templates-as-stamps* so templates are the building blocks)
- **Integration point:** before the current heightmap pipeline (produce `heights[]` like any other template)
- **A1:** one-button MVP first
- **B1:** **templates-only** as stamps (no precreated PNG heightmaps in the composite generator)
  - If a template is too "full-planet" to work well as a stamp, we will **blacklist** it for composite use initially, or **adjust** it (or create a stamp-variant) later.
- **C2:** record this plan thoroughly in a new DEVplans doc (`DEVplans/Heightmap-Worldbuilder.md`)
- **Wraparound:** east-west wraparound desired, but can be implemented later

- **Ocean approach (Option A):** procedural ocean plate baseline + templates for ocean features (ridges, trenches, plateaus, island chains, etc.)
- **MVP allowlist (Milestone 1):** `continents` + `lowIsland` + `archipelago`
- **Ocean baseline (MVP):** depth gradient + noise (**age-from-ridge in Milestone 4/5**)
- **Land coverage target (MVP):** no explicit target (let baseline + stamps decide)
- **Stamp fitting (MVP):** simple scale + rotate; add warp/noise distortions later if needed
- **Full-planet templates (MVP):** blacklist (for stability)

## 3) Key design intent

### 3.1 Templates should work both ways

The system is designed so that:

- A template can be used as a **standalone whole-map template** (as it is today)
- The same template (or a closely related stamp-variant) can be used as a **stamp** in the composite generator

This means we can:

- Add new continent templates and stampable local-basin/feature templates as individual templates first
- Then wire them into World Builder with minimal extra integration work

### 3.2 Continents are "big stamps"; feature stamps are scaled-down templates

- **Continent templates** act as the large building blocks for landmasses.
- **Oceanic plates** start from a procedural baseline; oceans get structure from plate boundaries + feature stamps.
- **Feature stamps** are the same concept at smaller scales and are placed based on context (e.g., arcs near subduction, atolls mid-ocean, barrier chains along shallow shelves, etc.).

## 4) Definitions

- **Template**: an entry in `config/heightmap-templates.js` using the existing DSL.
- **Stamp**: running a template on a **local stamp domain** and blending the resulting heightfield into the world.
- **Plate stamp**: a large stamp representing a tectonic plate interior or large-scale unit (e.g., continent).
- **Ocean baseline**: an initial ocean-floor heightfield generated procedurally for oceanic plates before boundary/feature stamping.
- **Feature stamp**: smaller stamps layered on top (islands, arcs, calderas, fjords, rias, etc.).
- **Stamp domain**: the coordinate system the template runs in (usually a rectangular sub-grid we generate for the stamp, using the existing template DSL percent-based ranges).
- **Falloff / blend mask**: soft edge mask applied to stamps to prevent seams.

## 5) System overview (high level)

The composite generator produces `heights[]` in phases:

1) **Plate layout** (seeded): partition the world into plates / macro-regions.
2) **Plate interiors**: stamp continents; generate a procedural ocean baseline for oceanic plates.
3) **Plate boundary effects**: add ridges / trenches / collision ranges / transform features based on plate adjacency.
4) **Feature stamps**: place smaller stamps inside plates or at boundaries (context-aware).
5) **Post-processing**: global normalization / smoothing / land coverage adjustments.
6) Output the final `heights[]`.

## 6) Data sources (templates + procedural ocean baseline)

### 6.1 Existing template inventory (today)

The current template set in `config/heightmap-templates.js` already includes multiple candidates usable as stamps:

- **Large / plate-like:** `continents`, `pangea`, `oldWorld`, `riftContinent`, `fractious`
- **Local basins / inland seas:** `endorheicBasins`, `dryLakes`, `inlandSeaStraits`, `impactRing`
- **Feature / stamp-like:** `volcano`, `highIsland`, `lowIsland`, `archipelago`, `atoll`, `barrierIslands`, `backArcChain`, `calderaArchipelago`, `fjordCoast`, `drownedRiverlands`, `highPlateauCanyons`, etc.

As new ocean-floor feature templates are added (mid-ocean ridges, trenches, oceanic plateaus), they will become additional boundary/feature stamp options.

### 6.2 Template allowlist / blacklist (composite use)

World Builder should use a **composite allowlist** rather than automatically using every template.

- Some templates are great whole-map presets, but may not blend well as stamps.
- Some templates may be useful as stamps only after tuning.

The allowlist is the mechanism that enables incremental integration and keeps the composite generator stable.

## 7) Plate layout ("micro-scale tectonic plates" as template consumers)

### 7.1 Plate partitioning

Generate a seeded plate map:

- Choose `N` plate seeds.
- Assign each cell to nearest seed (Voronoi-like).
- Optionally smooth plate borders to avoid jagged seams.

### 7.2 Plate typing + template selection

For each plate:

- Assign a plate type:
  - `continental`
  - `oceanic`
  - (later) special types like `microcontinent`, `oceanic_plateau`, `rifted_margin`
- Choose a plate interior strategy:
  - Continental plates choose from a **continent template pool** (plate stamps).
  - Oceanic plates use a **procedural ocean baseline** (structure comes from boundaries + feature stamps).

### 7.3 Running templates as stamps

Conceptually:

- Create a stamp domain (a local graph / sub-grid)
- Run the template DSL in that domain
- Transform/fit that stamp into the plate region
- Blend into global `heights[]` using a falloff mask

Key stamp parameters (MVP defaults, but represented as a single `params` object internally for future UI controls):

- `scale` (relative size)
- `rotation`
- `warpStrength` (optional)
- `blendMode` (e.g., max/lerp/additive carve)
- `edgeFalloff`

## 8) Plate boundary effects

After plate interiors are stamped, add boundary-driven features:

- **Convergent boundaries:** collision mountain belts, coastal ranges, subduction trenches, volcanic arcs
- **Divergent boundaries:** rifts / mid-ocean ridges
- **Transform boundaries:** subtle linear features / offsets

Implementation concept:

- Identify boundary segments where neighboring cells belong to different plates.
- Classify boundary type (seeded, based on plate motion vectors or a simpler randomized model).
- Apply linear features along boundaries (mountain belts, trenches, ridges) using template-like operations (e.g., multi-segment `Range`/`Trough` stamps) with falloff.

## 9) Feature stamps (scaled-down templates)

After plates and boundaries, place smaller stamps.

### 9.1 Context-aware placement rules (examples)

- **Subduction zones:** `backArcChain`, `volcano`, `calderaArchipelago` (arc-aligned)
- **Mid-ocean hotspot:** `volcano` clusters, `highIsland`
- **Shallow shelf along continent edges:** `barrierIslands`
- **Open ocean:** `atoll` (rare), `lowIsland` (occasional)
- **Rift zones:** additional `trough`/`pit` stamps, or `riftContinent` fragments (smaller)

### 9.2 Incremental rule approach

MVP can be "dumb but seeded":

- Place a few stamps with simple distribution rules
- Avoid stamp overlap
- Avoid dropping islands into deep basins if undesired

Then evolve toward context-aware tectonic placement as boundary classification improves.

## 10) Post-processing

The composite generator needs cohesion passes so the world does not look pasted together:

- **Global normalization** so stamp elevation ranges are compatible
- **Global smoothing** (light)
- **Land coverage control** (optional): bias sea level / add small adjustments to reach a target land percentage
- **Seam cleanup**: optional final blur near stamp boundaries

## 11) MVP milestones

### Milestone 1: Template-stamp engine + one-button generator

- New selectable template: `World Builder (Composite)`
- Deterministic generation
- Uses a very small allowlist:
  - `continents`
  - `lowIsland`
  - `archipelago`
- Oceanic plates use a procedural baseline (no basin template required for MVP)
- Basic blending + falloff

### Milestone 2: Plate partitioning + multiple plate stamps

- Multiple continent stamps across the world
- No advanced boundary classification yet (or very simple)

### Milestone 3: Plate boundary effects

- Add collision belts / trenches / ridges based on boundary type

### Milestone 4: Context-aware feature stamps

- Stamps placed where they "make sense" tectonically
- **Age-from-ridge** behavior added to ocean baseline

### Milestone 5: Controls + wraparound (later)

- Expose a small set of controls in UI (still optional):
  - plate count
  - continent vs ocean ratio
  - island density
  - land coverage target
- Add **east-west wraparound** support

## 12) Template integration workflow (how we keep this scalable)

### 12.1 Stamp compatibility checklist (per template)

Before a template is added to the composite allowlist:

- **Determinism:** stable output under seeded RNG
- **Stamp behavior:** produces a meaningful shape when run at smaller scale
- **Blend behavior:** edges are reasonable after applying a falloff mask
- **No hard assumptions about full world:** no implicit dependence on world width/height beyond percent ranges

If it fails:

- **Blacklist** it for composite use for now, OR
- Create a **stamp-variant** (same idea, tuned for stamping), OR
- Retune the template to be stamp-friendly while keeping it usable as a whole-map template

### 12.2 Adding a new template with minimal integration work

Target workflow:

1) Add the new template to `config/heightmap-templates.js` (standalone usability first).
2) Decide its composite category:
   - `continentPlate`
   - `oceanFeature`
   - `featureStamp`
3) Add it to the composite allowlist with default metadata:
   - size range
   - placement context
   - weight
4) Validate visually and with quick invariants (determinism / land area sanity).

Goal state: adding a new stamp should usually be **metadata-only**, not new generator logic.

