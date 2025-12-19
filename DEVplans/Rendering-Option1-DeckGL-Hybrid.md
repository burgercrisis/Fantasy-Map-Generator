---
description: Option 1 renderer migration — deck.gl for heavy geometry + keep SVG/HTML labels
---

# Option 1 Renderer Migration: deck.gl Hybrid (GPU geometry + existing labels)

## 0. Status

- **Status:** Proposed (not started)
- **Decisions (confirmed):**
  - **Zoom / camera:** Keep D3 zoom as the source of truth; derive deck.gl `viewState` from the D3 transform
  - **First migrated layer:** States fills
  - **Safety / rollout:** Keep SVG renderer as a toggle / fallback until visual parity confidence is high
- **Scope:** Improve interactive rendering performance by moving heavy geometry off SVG/DOM into a GPU-backed `deck.gl` canvas **while keeping the current SVG/HTML label system**.

## 1. Goals / Success criteria

- **Primary goal:** Reduce lag during pan/zoom and layer toggles by removing the biggest SVG/DOM offenders (large path sets, frequent repaint / style work).
- **Maintain:** current label placement behavior (e.g. state label path text) and label UX.

### Success metrics (pick a small baseline map + “big map”)

- **Pan/zoom responsiveness:** no obvious hitching during drag/zoom on the “big map”.
- **Layer toggle latency:** toggling `States`, `Borders`, `Biomes`, `Cultures`, etc. should feel near-instant (target: < 100–200ms visible stall).
- **Editor responsiveness:** opening common editors (states/provinces/burgs) and highlighting/selecting entities stays responsive.
- **Correctness:** no visual desync between geometry layers and labels during zoom/pan.

## 2. Non-goals (explicit)

- **Not** replacing the label renderer yet (we keep `modules/renderers/draw-state-labels.js`, `draw-burg-labels.js`).
- **Not** a full conversion of the app to a bundler / framework.
- **Not** committing to WebGPU.

## 3. Current architecture (baseline)

- Map is rendered as **one big SVG**: `index.html` has `<svg id="map">`.
- D3 zoom drives transforms on `g#viewbox`:
  - `main.js` `onZoom()` updates `scale`, `viewX`, `viewY` and calls `handleZoom()`.
  - `handleZoom()` applies `viewbox.attr("transform", translate(viewX viewY) scale(scale))`.
- Layers are controlled via `modules/ui/layers.js`:
  - `drawLayers()` calls individual renderers (`drawStates`, `drawBorders`, `drawBiomes`, `drawRivers`, …).
- Many “heavy” layers build **large SVG path strings** and set `innerHTML`:
  - `drawStates()` / `drawBiomes()` / `drawReligions()` / `drawCultures()` use `getIsolines(...)` and then inject `<path ...>` strings.
  - `drawBorders()` builds long `d` strings.

## 4. Target architecture (Option 1)

### 4.1 Conceptual layering

- **Bottom:** `deck.gl` canvas for heavy geometry (fills/paths/icons where appropriate)
- **Top:** existing SVG for labels + UI affordances (and optionally other non-problematic SVG layers)

### 4.2 Proposed boundaries (what moves vs what stays)

- **Move to deck.gl (initial targets):**
  - `States` fills (from `drawStates`)
  - `Borders` (state + province borders)
  - `Rivers` and `Routes` (as `PathLayer`s)
  - `Biomes` / `Cultures` / `Religions` / `Races` / `Zones` / `Provinces` fills (incrementally)

- **Keep in SVG (Option 1 commitment):**
  - `Labels` (`drawLabels()`, `drawStateLabels()`, `drawBurgLabels()`)
  - Scale bar, legend, UI overlays
  - Anything deeply coupled to SVG text-paths / DOM measurement

- **Defer (decide later):**
  - Heightmap contours (`drawHeightmap`) — may be better as a cached raster/bitmap layer rather than GPU polygons.
  - Emblems / COA — depends on SVG `<use>` heavy usage vs cost.

## 5. Integration design (key technical decisions)

### 5.1 Zoom / pan synchronization (critical)

**Goal:** geometry canvas and SVG labels must share the same camera.

- **Option A (chosen): keep D3 zoom as source of truth; derive deck.gl `viewState`** ✅
  - Keep existing `d3.zoom` and `viewbox` transforms.
  - Update deck.gl view state on each `handleZoom()`.
  - Pros: minimal disruption to label scaling behavior (`invokeActiveZooming`).
  - Cons: need a robust mapping from D3 transform → deck.gl orthographic view state.

- **Option B: keep D3 zoom and apply CSS transform to deck canvas**
  - Move the deck canvas in DOM by applying the same `translate(viewX, viewY) scale(scale)` as CSS.
  - Pros: extremely simple to prototype.
  - Cons: breaks deck.gl picking math; may introduce blur at non-integer scales.

- **Option C: switch to deck.gl controller for camera**
  - Make deck.gl handle interactions; drive SVG transforms from deck camera.
  - Pros: one camera system.
  - Cons: higher migration risk; impacts all existing zoom-dependent UI logic.

**Recommendation:** Use **A** as the production path; prototype with **B** only for a quick spike.

### 5.2 Geometry derivation and caching

- Prefer reusing existing topology and helpers:
  - `utils/pathUtils.js:getIsolines(..., {polygons:true})` already outputs polygon rings suitable for `SolidPolygonLayer`.
- Cache computed layer geometry at the `pack` level to avoid recomputation on zoom:
  - Compute once on `drawLayers()` / generation.
  - Only recompute when underlying `pack` data changes.

### 5.3 Picking / hover / selection

- Phase 1: keep existing selection logic (often based on `findCell(x,y)` and pack data), and treat deck layers as **visual-only**.
- Phase 2: decide if/when to enable deck.gl GPU picking for performance:
  - If enabled, route deck picking events into existing editor/highlight flows.

### 5.4 Export strategy (must not regress)

- **Option 1 (lowest risk):** keep SVG renderer as export backend.
  - Interactive: deck + SVG labels.
  - Export: temporarily re-render SVG geometry (existing functions) and export as before.
  - Pros: preserves SVG export fidelity.
  - Cons: two renderers must remain consistent.

- **Option 2:** composite deck canvas + SVG into bitmap exports.
  - Pros: WYSIWYG for what the user sees.
  - Cons: more work; SVG export becomes “raster-backed SVG”.

## 6. Milestones (2–5)

### Milestone 1 — Deck canvas scaffold + camera sync

- Add a `deck.gl` canvas behind `#map` (or inside a wrapper behind the SVG).
- Implement a tiny “debug layer” (e.g. a single polygon or scatter points) to verify:
  - correct alignment with SVG coordinates
  - correct response to zoom/pan (no drift)
  - correct resize behavior

**Exit criteria:** debug layer stays perfectly registered with SVG labels across zoom and pan.

### Milestone 2 — Migrate one heavy layer (States fills)

- Implement a deck layer that replaces SVG state fills (`regions/#statesBody`).
- Keep labels intact.
- Add a feature flag (e.g. `renderMode=svg|deck`) so you can compare, and keep SVG as the default until parity confidence is high.

**Exit criteria:** state fills are GPU-rendered; label paths still match state geometry; performance improves on “big map”.

### Milestone 3 — Add Borders + Rivers/Routes

- Move `drawBorders` output into deck `PathLayer`s.
- Move `drawRivers` and `drawRoutes` similarly.

**Exit criteria:** political map (fills + borders + rivers/routes + labels) runs smoothly; no obvious DOM/SVG bottleneck.

### Milestone 4 — Expand to other fill layers + interaction bridge

- Incrementally migrate other major fill layers used in presets:
  - biomes, cultures, religions, races, provinces, zones
- Decide on deck picking vs existing picking.

**Exit criteria:** most preset layers are GPU-rendered; editors remain usable.

### Milestone 5 — Export parity plan

- Implement and verify an export strategy (SVG-backend export or canvas+SVG composite).

**Exit criteria:** no major export regressions for typical user workflows.

## 7. Risks / gotchas

- **Zoom sync bugs:** even small mismatches in transform math will look terrible (labels drifting off geometry).
- **Geometry complexity:** some layers (coastline, heightmap contours) can create huge vertex counts; need simplification.
- **Two-renderer maintenance:** until labels (and/or export) are unified, you must keep “what user sees” consistent.
- **Browser compatibility:** deck.gl/WebGL context loss, high-DPI memory use.

## 8. Open decisions (you choose)

- **Picking:** keep CPU picking vs GPU picking.
- **Dependency loading:**
  - add deck.gl as a vendored UMD bundle in `libs/` vs load from CDN vs introduce a bundler.
- **Rollout gate:** what parity checklist is required before switching the default interactive renderer to deck.
- **Next layers after States:** borders vs rivers/routes vs other fills.

## 9. Immediate next steps

- Start **Milestone 1**:
  - add deck canvas scaffold
  - implement D3 transform → deck `viewState` mapping
  - keep SVG as a toggle / fallback
- Move into **Milestone 2** once camera sync is stable:
  - implement States fills on deck behind the feature flag
