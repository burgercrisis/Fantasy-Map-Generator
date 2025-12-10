# Evolving Simulation – Design Choices
_Back to devplan overview: [Changes vs Azgaar overview](Changes-vs-Azgaar-master.md)_

_Last updated: WIP – high-level decisions and open options for simulation systems._

This document captures the **chosen designs** and key **alternatives** for several evolving-simulation systems:

- Biome / climate smoothing
- Roads / trade network
- Culture / religion diffusion
- Realm events & narrative engine

It complements [Evolving Simulation – Developer Guide](Evolving-Simulation.md) (overall architecture and schemas) and is meant to be a quick reference when implementing or revisiting these systems. Language-system-specific k-NN and Markov tooling lives in [Language System Status – Markov & Mixer §7](Languages-Status.md#7-planned-tooling-extensions-markov-similarity-and-ux-helpers).

---

### Section index

- [1. Biome / climate smoothing with neighbors](#1-biome--climate-smoothing-with-neighbors)
- [2. Roads / trade network](#2-roads--trade-network)
- [3. Culture / religion diffusion](#3-culture--religion-diffusion)
- [4. Realm events & narrative engine](#4-realm-events--narrative-engine)
- [5. Remaining open choices (high-level)](#5-remaining-open-choices-high-level)
- [6. Explicit user-chosen recommendations (summary)](#6-explicit-user-chosen-recommendations-summary)

---

## 1. Biome / climate smoothing with neighbors

### 1.1 Chosen direction

- **Use adjacency-based smoothing** (cell graph neighbors), not full geometric k-NN.
- **Separate treatment** for:
  - **Continuous fields** (temperature, moisture, maybe elevation): graph diffusion.
  - **Categorical fields** (biomes, optional: cultures/religions): constrained neighbor voting.
- **Never smooth in-place during a pass**: always compute new values from a **snapshot** to avoid order-dependence.
- **When smoothing runs**:
  - **Light generation-time pass + on-demand tools**:
    - Run a very gentle smoothing pass once at map generation time.
    - Provide explicit "Smooth biomes" / "Smooth climate" tools in the editor for stronger, user-initiated cleanup.

### 1.2 Intended algorithm (first pass)

- Let `G` be the cell adjacency graph (edges where cells share a border).
- For continuous fields (e.g. `temp`, `precip`):
  - Do `k` diffusion steps:
    - `value_new = value_old + λ * (avg_neighbors(value_old) - value_old)`
    - with small `λ` (e.g. 0.2) and small `k` (1–3) per smoothing action.
- For biomes:
  - One or a few passes where for each cell:
    - Compute neighbor biome counts.
    - If current biome is a **strong minority** (e.g. <20% of neighbors) and not marked as `protected`, allow flipping to the majority biome.
  - Only use neighbor snapshot from the start of the pass, never partially updated values.

### 1.3 Guardrails vs over-smoothing

- **Protected patches**:
  - By default, mark cells belonging to special scripted features (deserts, glaciers, sacred groves, oases, micro-biomes, key underdark / story regions) as `protected` so generation-time smoothing never alters them.
  - Allow **user-painted regions** to be flagged explicitly as "locked biome" in the editor; smoothing treats these the same as scripted protected regions.
  - Smoothing never changes protected / locked biomes unless the user explicitly clears the lock.
- **Locality limits**:
  - Restrict smoothing to **immediate graph neighbors** (1-hop) in early versions.
  - Optionally add a 2-hop look later but keep weights decaying with distance.
- **Strength controls (UX)**:
  - Expose a “Smoothing strength” slider with discrete options:
    - Low: 1 pass, low λ.
    - Medium: 2 passes or slightly higher λ.
    - High: 3 passes with careful warnings (can erase detail).

### 1.4 Alternatives kept in mind

- **Raster-based filters**: project to a raster and apply median/gaussian filters; more complex and not planned for first implementation.
- **Global diffusion on categorical fields**: treat categories as soft distributions and diffuse, then re-discretize; possible long-term upgrade if we generalize to probability fields.

---

## 2. Roads / trade network

### 2.1 Chosen direction

- **Primary network via shortest paths** between major burgs, **not** a pure MST.
- Use:
  - Underlying graph: **cell adjacency / Delaunay** with terrain-dependent edge weights.
  - **Terminals**: capitals + top X burgs by population + important ports.
  - **Shortest paths** between selected terminals; union of these paths forms the main road / trade network.
- Use an **MST over region-centers only** (optional) to guarantee macro connectivity between regions or realms.
- Keep generation **re-runnable and non-destructive** by writing roads into a detachable layer.

### 2.2 Intended algorithm (first pass)

1. **Build underlying graph**:
   - Nodes: **burgs plus a small set of key intermediate cell centers** on long routes (mixed burg + cell-center approach).
   - Edges: adjacency / Delaunay edges with weights:
     - Base cost proportional to distance.
     - Extra cost for mountains, swamps, deep forest, etc.
     - Reduced cost for existing paths (e.g. along rivers, coasts) when computing **trade routes**, so rivers act as "cheap edges" for commerce.
2. **Select terminals**:
   - All capitals.
   - Top N burgs by population (global or per region).
   - Burgs with port/harbor flag.
3. **Generate main trade routes**:
   - For each unordered pair of terminals in a selected set (e.g. all capitals, or capitals + major ports), compute shortest path (Dijkstra/A*).
   - Union all these paths.
   - Optionally thin out edges used in fewer than `k` paths to avoid hairballs.
4. **Generate local roads** (optional mode):
   - For each non-terminal burg above a size threshold, connect to the nearest existing route or terminal with one shortest path.
5. **Optional macro MST over region centers**:
   - For each region/realm, pick a representative point (center or capital).
   - Build an MST over these centers (using geographic distance) and add missing connections as extra high-level trade routes.

### 2.3 Guardrails and UX

- **Modes / tools**:
  - “Generate main trade routes” → run steps 1–3 only.
  - “Generate local roads” → run step 4 as a separate operation.
- **Non-destructive layers**:
  - Store generated networks in a dedicated layer so the user can:
    - Preview.
    - Accept all / accept per-region.
    - Edit or delete segments without affecting underlying geography.
- **Tunable density**:
  - Expose parameters like:
    - Number of major terminals.
    - Minimum burg size for local road inclusion.
    - Terrain penalty multipliers.

### 2.4 Alternatives kept in mind

- **Pure MST on burgs**: simpler but too sparse / less terrain-aware.
- **Heuristic radial+ring networks** per region: easier to tune visually, may be added later as a complementary mode.

---

## 3. Culture / religion diffusion

### 3.1 Chosen direction – staged approach

- **Stage 1: Rule-based + event-driven, minimal Markov**
  - On each **user-initiated time advance** (whatever span in months/years was chosen):
    - Run a small number of rounds of **localized diffusion**:
      - Each cell’s culture/religion is slightly pulled toward neighbor distributions within a fixed radius.
      - Use low diffusion rates to avoid rapid homogenization.
    - Apply **explicit events**:
      - Wars / conquests that flip or partially convert regions.
      - Schisms / reforms that introduce new cultural or religious centers.
    - Use **roads and rivers as multipliers** on diffusion probability (faster spread along routes).
    - Certain events can additionally trigger **extra localized diffusion passes** focused on directly involved realms/regions.
- **Stage 2: Soft Markov model (if needed)**
  - Store culture / religion as **probability vectors** per cell.
  - Periodically apply Markov-like neighbor mixing.
  - Regularly **harden** to a primary identity for rendering and label generation.

### 3.2 Intended algorithm – Stage 1 sketch

- For each **user-initiated time advance**:
  1. **Localized diffusion**:
     - For each cell, compute a tentative new culture/religion by:
       - Taking a weighted average of neighbors’ current identities (weights boosted for road/river neighbors).
       - Blending a fraction (e.g. 10–20%) of that into the cell.
     - Scale diffusion strength by realm stats (population, tech, centralization) within a band of **0.25×–3.5×** relative to the base rate so stronger realms spread faster but weaker ones still have visible influence.
     - Work from a snapshot of the time-step’s starting state to avoid order-dependence.
  2. **Apply events**:
     - Process queued events (wars, migrations, schisms). Each event may:
       - Change the primary culture/religion in a contiguous region.
       - Spawn a new center with a radiating influence.
       - Temporarily increase diffusion rate in conflict zones.

- Time advancement is **interactive and discrete**: each click advances the simulation by a user-chosen span of time (from months up to many years), rather than the system advancing continuously in real time.
- Named **ages** are narrative bands with individually defined start and end years. They are shown on a separate Ages screen that lists each age, its span, and highlights where the current year falls.
- Ages are **not** the unit of advancement: advancing time moves the current year forward by the chosen step size; ages are overlays used for labeling and summarizing history.
- Make the evolution **replayable from a seed** so users can regenerate consistent histories.

### 3.3 Stage 2 outline (soft Markov)

- Once basic behavior is stable:
  - Represent each cell’s culture/religion as a vector `p` over identities.
  - On each coarse time step, update `p` using a combination of:
    - Neighbor mixing (graph-based Markov step).
    - Exogenous shocks from events.
  - After updates, derive a primary identity (argmax of `p`) for rendering and downstream systems.

### 3.4 Alternatives kept in mind

- **Pure event-driven model** with no background diffusion – simpler but less organic.
- **Fully continuous Markov from the start** – more elegant but heavier and harder to tune.

---

## 4. Realm events & narrative engine

### 4.1 Chosen direction – Hybrid FSM + event tables

- Use a **small finite state machine (FSM)** per **political realm / realm-like entity** in the initial implementation to track coarse political state, e.g.:
  - `peace`, `tension`, `war`, `occupation`, `recovery`, `decline`.
- For each state, maintain **event tables** that list candidate events (wars, plagues, reforms, golden ages, etc.) with probabilities.
- Allow **transitions** between states driven by:
  - Random draws from state-specific transition tables.
  - Map-derived signals (border disputes, economic stress, cultural/religious tension).
- Design the FSM / event infrastructure so that **separate FSMs for major religions** can be added later without breaking the realm-level model.

### 4.2 Intended behavior

- Each coarse simulation time step:
  1. For each realm, evaluate its current **state** and **inputs** (neighbors, economy, stability, etc.).
  2. Possibly transition to a new state using FSM rules.
  3. Within the resulting state, sample from that state’s **event table** to generate 0+ concrete events:
     - Wars of aggression / defense.
     - Succession crises.
     - Religious reforms or persecutions.
     - Trade booms / busts.
  4. Record events into a log that can feed UI history panels and/or AI text generation.
  5. In early versions, many events may primarily adjust numeric modifiers and logs; **long-term**, some event types are expected to have **structural impact** on the map (changing borders, vassalage, and burg status such as sacked / abandoned / refounded).

- States should be few and interpretable; events should be parameterized by map context so histories differ in meaningful ways between realms.

### 4.3 Alternatives kept in mind

- **Pure Markov chain on states** without explicit event tables – simpler, but produces more generic histories.
- **Pure event tables** with no explicit persistent states – flexible, but lacks clear long-term arcs.

---

## 5. Remaining open choices (high-level)

This section lists additional choice points not yet locked in. They can be decided per-implementation.

### 5.1 Biomes & climate

- **UI design** for a "lock region" / "locked biome" toggle so user-painted patches can opt out of smoothing permanently while still supporting scripted auto-locks.
- Whether climate smoothing should be applied **before or after** biome assignment, or both.
- How strongly climate changes should feed back into **river and vegetation recalculation**.

### 5.2 Roads & trade

- Exact heuristic for **thinning redundant routes** (path usage thresholds vs distance thresholds).
- Whether to treat some routes as **sea lanes** vs strict land roads, and how they interact with trade and diffusion.
- How to visualize **importance** of routes (width, style) based on usage or trade volume.

### 5.3 Culture / religion diffusion

- Exact set of **default ages** (names and year spans) and how the Ages screen presents them alongside the time-step UI.
- Tuning and validating the chosen **0.25×–3.5×** modulation range for population / tech / centralization in real maps.
- Whether to expose an **"aggressiveness" slider** per culture/religion for user control.

### 5.4 Events & narrative

- The exact set of **FSM states** and transitions; may vary by culture group or tech level.
- Which event types will be allowed to change **map geometry** (borders, vassals, burg fates) in early versions versus later, more dramatic passes.
- When and how to introduce **religion-level FSMs** alongside realm FSMs, and how they will interact.
- How deeply to integrate the event log into other systems (e.g. naming, map overlays, AI text).

This file should be updated as simulation features are implemented, so it remains the single entry point for high-level evolving-simulation design decisions.

---

## 6. Explicit user-chosen recommendations (summary)

These are the concrete options currently preferred when implementing the systems above:

- **Biomes & climate**
  - **Climate + biome smoothing**: use both climate smoothing and biome smoothing in **light form** (A + B), with small diffusion steps and a single pass of conservative majority-vote smoothing on biomes.
  - **Rivers/veg feedback**: start with **no automatic rebuild**; optionally add a "Rebuild rivers/veg for this region" tool later instead of tying it to every smoothing action.
  - **Locked biome UX**: if feasible, implement **both** per-cell brush locking (paint-as-locked) and region-level "Lock biome" actions, so users can protect tiny micro-biomes and large hand-shaped regions without extra friction.

- **Roads & trade**
  - **Route thinning**: thin redundant routes using a **usage-based heuristic**, dropping edges used in fewer than a small `k` paths (initially `k ≈ 2`) to remove "one-off" edges.
  - **Sea lanes**: treat **sea/coastal trade lanes as cheap edges** only for **major ports and coastal capitals**, keeping the model simple but still capturing key maritime trade corridors.
  - **Sea lane visualization**: draw maritime routes using a style consistent with existing route layers (e.g. lighter/dashed lines that sit visually between rivers and land roads), and follow the app’s current color and zoom behavior conventions rather than inventing a wholly new look.

- **Culture / religion diffusion**
  - **Age & time UI**: start with **4–8 named ages** with individually defined start and end years, plus a years-first control where each click advances by a user-chosen span (from months up to many years). Provide a separate Ages screen that lists each age, its span, and shows where the current year falls.
  - **Aggressiveness exposure**: keep the per-culture/religion "aggressiveness" factor **internal** at first (configurable via JSON/tools only); consider adding a UI slider later in an "Advanced" panel once behavior is stable.
  - **Age naming**: choose **historically grounded, setting-appropriate age names** (e.g. "Age of Expansion", "Age of Fracture", etc.) instead of generic numbered ages, tuned to the tech level / flavor of the world being simulated.

- **Realm events & narrative**
  - **FSM state scope**: start with a **small set of 5–6 realm states**; add more only if concrete needs appear in practice.
  - **v1 structural events**: allow only a minimal whitelist of structural changes at first:
    - Major war outcome → **border shift & vassalage** updates.
    - Sack of burg → **temporary population drop** and a **ruin flag**.
    - Defer heavier changes such as mass migrations or realm splits to later passes.
  - **Religious FSM timing**: defer adding separate FSMs for major religions **until** the realm FSM and culture/religion diffusion systems are stable and there is a clear need for independent religious state tracking.
