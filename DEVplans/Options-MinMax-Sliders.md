# Options Min–Max Sliders – Plan
_Back to devplan overview: [Changes vs Azgaar overview](Changes-vs-Azgaar-master.md)_

_Design note for adding min–max range controls (dual-handle sliders) to numeric Options for world generation: states, cultures, races, towns, religions. Includes a per-control toggle between single and range mode and a layout that matches the mockup._

---

## 0. Goals & constraints

- **Goals**
  - Allow users to specify either a **single target value** or a **min–max range** for key world‑generation counts:
    - States number
    - Cultures number
    - Races number
    - Towns / burgs number
    - Religions number
  - Make the UI look and feel like the mockup: label on the left, slider track in the middle, and numeric values on the right, all on a single row.
- **Behavioral constraints**
  - In **single mode**, behavior must be identical to current sliders.
  - In **range mode**, the generator uses the selected min–max range when deciding how many entities to create.
  - Changes to sliders should not retroactively modify existing maps; the range is sampled **when a new map is generated**.
- **Compatibility**
  - Existing saves and defaults must keep working without migration errors.
  - Old builds should be able to read new saves using only the legacy scalar fields.

Mockup reference:

- Rough UI mockup (dual-handle slider for states and a single slider for races):
  - _Expected file path_: `DEVplans/options-minmax-sliders.png`
  - _Link_: `![States/Races min–max slider mockup](options-minmax-sliders.png)`
  - **Note:** The binary image asset needs to be saved manually at that path.

---

## 1. UX and layout

### 1.1 Controls to update

Convert the following numeric sliders in **Options → Generator** to support min–max:

- **States number** – target number of states.
- **Cultures number** – target number of cultures.
- **Races number** – maximum non-human races (ties into `racesNumber` logic).
- **Towns / burgs number** – target burg count.
- **Religions number** – target religion count.

The pattern must be generic so it can later be reused for other `* number` sliders.

### 1.2 Row layout (match the mockup)

Each control row should visually match the mockup:

- **Layout**
  - Left: label text, e.g. `States number`.
  - Middle: slider track (one or two handles on the same track).
  - Right: numeric text aligned to the right edge.
    - Single mode: `50`.
    - Range mode: `21–50` or `min – max`.
- **Implementation sketch**
  - Container element: horizontal flex row (`display: flex; align-items: center;`).
  - Label: fixed or min width, left‑aligned.
  - Slider: flex‑grow: 1, centered between label and value.
  - Value: small `span` on the right, showing the current single value or range.

### 1.3 Modes per control

Per control, define two modes:

- **Single mode (default)**
  - UI: one handle on the track, numeric display `N` on the right.
  - Semantics: same as current behavior – one target value used by the generator.

- **Range mode**
  - UI: two handles on the same track, numeric display `min–max` on the right.
  - Semantics: generator treats the range as **allowed bounds** and picks an effective value (see §3).

### 1.4 Range toggle (same control, per‑row)

Add a per‑row toggle that switches between single and range mode without changing layout height:

- **Placement**
  - Small toggle to the left of the slider, near the label (e.g. a mini checkbox or icon button labeled `Range`).
- **Behavior**
  - **Single → Range**
    - Start from current scalar value `v`.
    - Initialize `min` and `max` around `v`:
      - Use a **small span** (e.g. `min = max - 1`, `max = v`, clamped to bounds) so that the change is visible, but
      - Do not continuously auto‑adjust values while the user drags sliders – the range only matters at generation time.
  - **Range → Single**
    - Collapse back to a single value using the rule in §8 (current decision: **use `max`**).
    - Update both the scalar `*Number` and the displayed numeric text.
- **Tooltip example**
  - `"Use a min–max range instead of a single target value"`.

### 1.5 Handle behavior & constraints

- `min` handle can never cross over the `max` handle, and vice versa:
  - If the user drags a handle past the other, clamp so that `min <= max` always holds.
- Both handles share the same numeric bounds as the existing slider (e.g. 0–99 states).
- Step size is 1 (integer counts only).
- The numeric text on the right updates live as handles move:
  - Single mode: `N`.
  - Range mode: `min–max`.

---

## 2. Options schema and data model

### 2.1 Per‑option fields (backwards compatible)

For each affected option, extend its representation from a single scalar to a **mode + min/max** triple, while still keeping the legacy scalar field.

- **States**
  - Existing: `options.statesNumber: number`.
  - New fields:
    - `options.statesNumberMode: "single" | "range"` (default `"single"`).
    - `options.statesNumberMin: number`.
    - `options.statesNumberMax: number`.
- **Cultures**
  - Existing: `options.culturesNumber: number`.
  - New fields: `culturesNumberMode`, `culturesNumberMin`, `culturesNumberMax`.
- **Races**
  - Existing: `options.racesNumber: number` (max non‑human races).
  - New fields: `racesNumberMode`, `racesNumberMin`, `racesNumberMax`.
- **Towns / burgs**
  - Existing: `options.burgsNumber` (or equivalent).
  - New fields: `burgsNumberMode`, `burgsNumberMin`, `burgsNumberMax`.
- **Religions**
  - Existing: `options.religionsNumber`.
  - New fields: `religionsNumberMode`, `religionsNumberMin`, `religionsNumberMax`.

### 2.2 Load behavior (old saves)

On map load:

- If `*NumberMode` is missing:
  - Assume `mode = "single"`.
- If `*NumberMin` / `*NumberMax` are missing:
  - Set `min = max = existing *Number`.

This makes old saves behave exactly as before while still giving the UI enough information to enter range mode.

### 2.3 Save behavior (new saves)

On save:

- Always store the legacy scalar `*Number` for compatibility:
  - If `mode = "single"` → `*Number = singleValue`.
  - If `mode = "range"` → `*Number = max` (old builds read this as “up to this many”).
- Also store the extended fields:
  - `*NumberMode`, `*NumberMin`, `*NumberMax`.

---

## 3. Generator semantics

### 3.1 General rule for range mode

At **map generation time**, for each option in `range` mode:

- Compute an `effectiveValue` using the existing seeded RNG:
  - `effectiveValue = randomInt(min, max)` (inclusive).
- Use `effectiveValue` everywhere the current code uses the scalar `*Number`.

Slider changes do **not** retroactively affect already‑generated maps; they only influence new generation runs.

### 3.2 States

- Current behavior: generator reads `options.statesNumber` as the target number of states.
- New behavior:
  - If `statesNumberMode = "single"` → `targetStates = statesNumber` (unchanged).
  - If `statesNumberMode = "range"` → `targetStates = randomInt(statesNumberMin, statesNumberMax)`.

### 3.3 Cultures

- Apply the same pattern:
  - `culturesTarget = culturesNumber` in single mode.
  - `culturesTarget = randomInt(culturesNumberMin, culturesNumberMax)` in range mode.

### 3.4 Races

- Currently `racesNumber` is interpreted as **max non‑human races** in `initializeRacesForExpansion`.
- New behavior:
  - Single mode: `maxNonHumanRaces = racesNumber` (no change).
  - Range mode: `maxNonHumanRaces = randomInt(racesNumberMin, racesNumberMax)`.

### 3.5 Towns / burgs

- Wherever the burgs generator uses `burgsNumber`:
  - Single mode: use `burgsNumber` as now.
  - Range mode: compute `effectiveBurgs = randomInt(burgsNumberMin, burgsNumberMax)` and use that as target.

### 3.6 Religions

- Same pattern:
  - Single mode: `effectiveReligionsNumber = religionsNumber`.
  - Range mode: `effectiveReligionsNumber = randomInt(religionsNumberMin, religionsNumberMax)`.

---

## 4. UI implementation details

### 4.1 Reusable dual‑mode slider helper

Introduce a reusable helper in the Options UI code that encapsulates the dual‑mode behavior. Responsibilities:

- Render label, range toggle, slider track, and numeric display in a single row.
- Switch between single and range modes while preserving layout.
- Sync values to/from `options.*Number`, `options.*NumberMode`, `options.*NumberMin`, and `options.*NumberMax`.
- Enforce `min <= max` and global domain bounds.

Depending on current architecture:

- Either extend the generic slider component (e.g. `components/slider-input.js`) with dual‑handle support and a mode toggle, **or**
- Implement a `renderMinMaxOption` helper that wraps two underlying range inputs and presents them as one control.

### 4.2 Wiring per option

For each of the five numeric options:

1. Replace the existing single‑slider setup with the dual‑mode helper.
2. Pass in:
   - Option keys (e.g. `"statesNumber"`).
   - Slider domain (min/max allowed values).
   - Default mode (`"single"`).
   - Default `min` / `max` derived from existing defaults.
3. Preserve existing labels and tooltips.

### 4.3 Toggle behavior (state machine)

- **Single → Range**
  - Use current `*Number` as the starting point.
  - Initialize `min`/`max` to a **small visible span** around that value, clamped to domain.
  - Do not modify `*Number` yet; it will be updated when saving or when collapsing back to single.
- **Range → Single**
  - Set `singleValue` to `max` (see §8) and write it back to `*Number`.
  - Switch slider rendering to single‑handle mode.

---

## 5. Backwards compatibility & testing

- **Old saves**
  - Load as single‑mode controls; `*NumberMode` defaults to `"single"` and `min = max = *Number`.
  - Sliders behave exactly as they do today until the user explicitly switches to range mode.
- **New saves opened in old builds**
  - Older builds ignore `*NumberMode` / `*NumberMin` / `*NumberMax` and just use the scalar `*Number`.
  - Because we set `*Number = max` in range mode, old builds interpret it as a reasonable upper bound.
- **Testing checklist**
  - Load multiple existing saves with different slider values and confirm no runtime errors.
  - Generate maps with:
    - All controls in single mode.
    - Mixed single and range modes.
    - Tight ranges (`min == max`) and wide ranges.
  - Verify that effective counts always fall within the configured [min, max] for each option.

---

## 6. Implementation phases

1. **Scaffolding**
   - Add new option fields (`*NumberMode`, `*NumberMin`, `*NumberMax`) to Options defaults.
   - Implement load/save logic for new fields with backward compatibility.
2. **UI**
   - Implement the dual‑mode slider helper and toggle.
   - Convert the five targeted controls to use it and visually match the mockup.
3. **Generator wiring**
   - Update states, cultures, races, burgs, and religions generators to honor min–max semantics when `mode = "range"`.
4. **QA**
   - Run regression tests on old saves and existing generation flows.
   - Spot‑check that effective generated counts fall inside configured ranges.

---

## 7. Open design choices

- **Random choice vs deterministic formula inside range**
  - This plan assumes `randomInt(min, max)` per map generation.
  - Alternative: tie effective counts to map size or other derived stats and use min–max as clamps.
- **Single‑mode value when collapsing a range**
  - Default here: `single = max`.
  - Alternative: use midpoint or last‑touched handle.

If these choices change, update this plan so it stays the single source of truth for the Options min–max slider behavior.

---

## 8. Current decisions

- **Range semantics**
  - Option A – random integer in `[min, max]` at map generation time (current plan).

- **Collapsing range to single**
  - (Recommendation): Keep Option A (use `max` when collapsing a range back to a single value); this is the simplest mental model for counts.

- **Default range when first toggling on**
  - Start with a **small visible span** around the previous single value so the user can see they are in range mode.
  - The range should **not auto‑update continuously**; the effective value is sampled at map generation time, not every time the slider moves.
