# Heightmap Landforms Plan

This document distills a long reference list of geomorphic landforms into **candidate world-scale heightmap templates** for this fork of Azgaars Fantasy Map Generator.

- Source: consolidated coastal, fluvial, lacustrine, glacial, tectonic, volcanic, and generic landform lists (e.g. dry lakes, deltas, fjords, rift valleys, etc.).
- Goal: identify which *concepts* are worth implementing as **individual heightmap templates or precreated maps**.
- Method: 
  - Deduplicate synonyms and micro-variants into broader concepts.
  - Score by **approximate benefit for FMG as a full-map heightmap** (macro-scale, distinctive, reusable).
  - Group by priority tiers (P1 highest), with P1 items listed first.

Benefit scale (qualitative):

- **P1  very high benefit**: strongly shapes an entire map; supports many campaigns; distinct from existing templates.
- **P2  medium benefit**: good regional/biome or niche world types; somewhat overlapping with existing templates.
- **P3  low benefit**: micro-features, too small-scale, or better handled as local editing rather than global templates.

Existing templates already cover some of these concepts (e.g. Archipelago, Peninsula, Isthmus, Atoll, Continents, Taklamakan, Dry Lakes, Barrier Islands). Those are marked as **covered** where relevant.

## Table of contents

- [P1 – High-priority landform-based templates](#p1--high-priority-landform-based-templates)
- [P2 – Medium-priority / specialized templates](#p2--medium-priority--specialized-templates)
- [P3 – Low-priority / micro-scale or local features](#p3--low-priority--micro-scale-or-local-features)
- [Recommended next steps](#recommended-next-steps)

---

## P1  High-priority landform-based templates

These are the most promising **whole-map** shapes: they give FMG clearly different world skeletons and are likely to see frequent use.

### 1. Archipelago / island chains (**covered: Archipelago template**)

- **Concept group:** Archipelago, Island, Islet, Fluvial island, River island, Island chains, Volcanic island, Seamount chains (when emergent).
- **Why good:** 
  - Already core to FMG; many users want "world of islands" layouts.
  - Potential variants: volcanic archipelagos, drowned-continental archipelagos, polar archipelagos.
- **Status:** Base concept already implemented as `archipelago` heightmap template.
- **Future idea:** additional **regionalized archipelagos** (e.g., mid-ocean ridge + hot-spot islands, polar archipelago with fjords).

### 2. Barrier islands & coastal bars (**partially covered: Barrier Islands template**)

- **Concept group:** Barrier island, Barrier bar, Barrier bar (sandbank), Shoal, Baymouth bar, Spit, Tombolo, Ayre, Beach ridge.
- **Why good:**
  - Naturally aligns with coastal maps (long, narrow islands parallel to coast; lagoons behind bars).
  - You already added a `barrierIslands` template; this cluster validates and extends that idea.
- **Status:** `barrierIslands` template implemented locally; can be refined using this concept cluster.
- **Future idea:** additional **lagoon/back-barrier marsh** emphasis, tying into salt marsh / tidal marsh landforms.

### 3. Delta coasts & alluvial fans

- **Concept group:** River delta, Delta, Alluvial fan, Bajada, Outwash fan, Floodplain, Fluvial terrace.
- **Why good:**
  - Deltas create *fan-shaped^ coastlines with complex river networks and wetlands.
  - Strongly affects culture, trade, and city placement (good campaign hubs).
- **Implementation idea:**
  - Template placing one or more **major river deltas** opening onto an ocean margin, with low-relief hinterlands and subtle interior highs.

### 4. Fjord / glacially carved coasts

- **Concept group:** Fjord, Fjard, Ria, Calanque, Geo (coastal gully), Hanging valley (where it meets coast), Submarine canyon (offshore extension).
- **Why good:**
  - Extremely distinctive coastlines: deep, narrow inlets with steep valley walls.
  - Supports Norse-ish or high-latitude worlds; dense coastal cultures, hard inland travel.
- **Implementation idea:**
  - Heightmap that starts from glaciated mountains dropping directly into the sea; **long, narrow, deep inlets** aligned with glacial flow.

### 5. Rift valleys & graben basins

- **Concept group:** Rift valley, Graben, Pull-apart basin, Horst & graben, Faceted spur.
- **Why good:**
  - Produces long linear lowlands with high flanks, ideal for **rift-lake chains** and tectonic-story maps.
  - Visually different from generic river valleys or random continents.
- **Implementation idea:**
  - Template that carves one or more **linear rift depressions** across the map, optionally flooded into lakes or narrow seas.

### 6. Mountain ranges & volcanic arcs

- **Concept group:** Mountain range, Volcanic arc, Mountain, Massif, Highland, Volcanic island chain, Seamount / guyot (if emergent).
- **Why good:**
  - Ranges and arcs set up rain shadows, river systems, and political boundaries.
  - A map where **one or more arcs dominate** gives a strong tectonic identity.
- **Implementation idea:**
  - Templates with **one giant or several parallel arcs**, sometimes partially oceanic (arc of volcanic islands).

### 7. Volcanic plateaus & lava plains

- **Concept group:** Volcanic plateau, Lava field / lava plain, Shield volcano, Pyroclastic shield, Malpas, Volcanic cone fields.
- **Why good:**
  - Good for highland or basalt-plateau worlds (e.g., Deccan Traps analogs) and volcanic frontier regions.
- **Implementation idea:**
  - Template with **broad high plateaus** and scattered shield volcanoes / cones, with deep radial valleys.

### 8. Canyon & gorge systems

- **Concept group:** Canyon, Gorge, Submarine canyon, Ravine, Arroyo, Gulch, Gully, Shut-in.
- **Why good:**
  - Strongly recognizable landscapes: deep incision, high relief, constrained travel corridors.
  - Could generate either **continental canyon worlds** or **submarine canyon seafloor** (if inverted into ocean depth).
- **Implementation idea:**
  - Template emphasizing a **few very deep, branching canyons** and an otherwise uplifted plateau.

### 9. Desert ergs & dune seas

- **Concept group:** Erg, Dune, Dune system, Barchan, Blowout, Desert pavement, Sandhill.
- **Why good:**
  - Distinct desert worlds where **low-relief but high local roughness** matters.
  - Pairs well with dry-lake and oasis templates.
- **Implementation idea:**
  - Template with **broad dune fields**, sparse bedrock highs, occasional eroded inselbergs.

### 10. Dry lakes, playas & endorheic basins (**partially covered: Dry Lakes template**)

- **Concept group:** Dry lake, Playa lake, Chott, Endorheic basin, Salt pan / salt flat, Oasis (as wet point in otherwise closed basin), Sor.
- **Why good:**
  - Matches your new `dryLakes` template: worlds shaped by **closed drainage basins** and salt flats.
  - High narrative value (dried seas, salt deserts, oasis cities).
- **Status:** `dryLakes` template implemented.
- **Future idea:** variants for **single mega-basin** vs. **multiple smaller endorheic basins**.

### 11. Karst basins & polje plains

- **Concept group:** Karst, Karst valley, Polje, Uvala, Doline, Karst fenster, Limestone pavement.
- **Why good:**
  - Creates **low-relief plains with enclosed basins**, sinkholes, disappearing rivers; good for weird hydrology.
  - Distinct from tectonic rifts/endoreic basins by pattern and density of depressions.
- **Implementation idea:**
  - Template where a plateau is riddled with **numerous closed depressions** and flat polje plains.

### 12. Badlands & heavily dissected plateaus

- **Concept group:** Badlands, Dissected plateau, Etchplain, Pediment, Pediplain, Cryoplanation terrace (if cold version).
- **Why good:**
  - Measures **maximum erosion complexity**: maze of ridges and gullies, hard travel, strong constraints on settlement.
- **Implementation idea:**
  - Template focusing on **dense micro-relief** and limited flat land, perhaps as a regional or whole-world mode.

### 13. Mesa / butte / tablelands

- **Concept group:** Mesa, Butte, Tepui, Table, Plateau, Inselberg, Monadnock, Potrero, Inselberg plain.
- **Why good:**
  - Iconic high-relief desert/marginal landscapes; good for dramatic exploration and verticality.
- **Implementation idea:**
  - Template that produces **flat-topped mesas and buttes** separated by lowlands, possibly alongside canyons.

### 14. Glacial U-shaped valleys & cirque chains

- **Concept group:** Glacier, Cirque, Corrie, U-shaped valley, Hanging valley, Arte, Pyramidal peak / glacial horn, Proglacial lake, Kettle fields, Rhe moutonne.
- **Why good:**
  - Glacial landscapes read very differently from fluvial ones; good for high-latitude or high-altitude worlds.
- **Implementation idea:**
  - Template generating **glaciated mountain ranges** whose valleys are notably U-shaped, with proglacial lakes.

### 15. Coastal plains & strandflats

- **Concept group:** Coastal plain, Strandflat, Marine terrace / raised beach, Wave-cut platform, Machair, Salt marsh.
- **Why good:**
  - Produces **low-relief coastal maps** with broad flats and subtle terraces; great for historical/low-fantasy settings.
- **Implementation idea:**
  - Template emphasizing **long, gently sloping coasts** with shallow shelf, marshes, and relict terraces.

### 16. Wetlands & delta marsh complexes

- **Concept group:** Salt marsh, Tidal marsh, Swamp, Wetland, Backswamp, Marsh, Lacustrine plain.
- **Why good:**
  - Worlds dominated by wetlands are niche but very distinctive; important for certain campaigns.
- **Implementation idea:**
  - Variant of delta/coastal-plain templates where large regions sit just above sea level with **ubiquitous wetlands**.

### 17. Oceanic ridges, plateaus & trenches

- **Concept group:** Mid-ocean ridge, Oceanic ridge, Oceanic plateau, Oceanic trench, Abyssal plain, Abyssal fan, Submarine volcano, Seamount, Guyot.
- **Why good:**
  - Could power **"submarine" style maps** or inverted maps (ocean floor as land, water as sky), and tectonic visualizations.
- **Implementation idea:**
  - Templates where **ridges and trenches** dominate and land/sea interpretation could be inverted or stylized.

---

## P2  Medium-priority / specialized templates

These are strong concepts but more niche or partially covered by existing templates and editing tools.

### A. Peninsulas, isthmuses, and tomobolos (**partially covered: Peninsula, Isthmus templates**)

- **Concept group:** Peninsula, Isthmus, Tombolo, Cape, Headland.
- **Notes:**
  - Already represented with `peninsula` and `isthmus` templates; tombolos and capes can be variants.

### B. Lagoon / barrier-lagoon systems

- **Concept group:** Lagoon, Bay, Cove, Inlet, Sound, Estuary, Firth.
- **Notes:**
  - Overlaps with delta/coastal plain/barrier island templates; could be integrated as **options** rather than dedicated templates.

### C. Lake-dominated basins

- **Concept group:** Lake, Proglacial lake, Oxbow lake, Kettle, Impact crater lake, Volcanic crater lake, Playa thats partly wet.
- **Notes:**
  - Many of these are **sub-features** suitable for the Lakes editor or local heightmap edits, but a **"Great Lakes" world** template could be interesting.

### D. Tectonic domes & basins

- **Concept group:** Dome, Basin (pull-apart basin, rift-basin variants), Fault scarp.
- **Notes:**
  - Could generate **domal uplifts** or basin-centered worlds; more specialized than rift-valley templates.

### E. Volcanic fields & cone clusters

- **Concept group:** Cinder cone, Spatter cone, Tuff cone, Subglacial mound, Rootless cone / pseudocrater, Volcanic group / volcanic field.
- **Notes:**
  - Very cool visually but best as **regional overlays** on other templates; whole-map cone fields are niche.

### F. Glacial plains & outwash / sandur

- **Concept group:** Outwash plain, Sandur, Glacier foreland, Glacier cave complexes as microfeatures.
- **Notes:**
  - Could be options for the glacial template rather than unique templates.

### G. Karst tower & mogote landscapes

- **Concept group:** Tower karst, Mogote, Karst valleys.
- **Notes:**
  - Great for exotic landscapes but likely **regional** rather than whole-world; could be a regional template mode.

### H. Step-like terraces & benches

- **Concept group:** Structural terrace, Structural bench, Fluvial terrace, Cryoplanation terrace, Marine terrace / raised beach.
- **Notes:**
  - More about **micro-relief** and slope breaks; important visually but can be part of other templates.

---

## P3  Low-priority / micro-scale or local features

These are either:

- Too small-scale to justify an entire FMG heightmap template, or
- Better handled as **local edits** (Heightmap Editor, Lakes/Coastline tools), or
- Already implicit in other templates at the polygon level.

Examples (deduplicated conceptually but not exhaustive):

- **Micro-depressions / pits:** Pothole, Rock-cut basin, Gnamma, Panhole, Small sinkholes and tafoni cavities.
- **Small caves & rock shelters:** Sea cave, Glacier cave, Cave, Rock shelter.
- **Minor slopes & knolls:** Hillock/Knoll, Small bluffs, Terracettes.
- **Tiny water features:** Tide pool, Spring, Small ponds, Yazoo stream, Turlough.
- **Individual volcanic vents:** Fissure vents, Small maars, Isolated hornitos.
- **Single mesas, buttes, tors, inselbergs** in isolation (as opposed to networks).

These concepts can still **inspire detail brushes** or presets in the Heightmap Editor (e.g., "Carve sinkhole", "Create crater", "Add tafoni-like pits"), but they do not need standalone templates.

## Recommended next steps

### Concrete template candidates (draft list)

These are concrete **template-shaped** variants that map well onto the existing FMG template DSL (Hill / Range / Trough / Pit / Strait / Smooth / Mask / Invert / Add / Multiply).

- **Rift Continent (linear rift lakes):** a major long `Trough` (or a few segments) with flanking uplifted `Range` “shoulders”; optionally tuned to produce a rift-lake chain.
- **Triple Junction (3-way rifts):** three radiating `Trough` arms from a central point, with a central `Pit` basin and optional shoulder `Range`s.
- **Back-Arc Island Chain:** a volcanic arc (multi-segment `Range` + `Hill` peaks) with a parallel `Trough` to suggest a back-arc basin.
- **Caldera Archipelago (volcanic province):** scattered tall `Hill` peaks with paired `Pit` placements to suggest calderas; tuned to produce multiple “volcano islands”.
- **Impact Basin / Ring Sea:** a ring-like high rim (clustered `Hill`/`Range`) around a large central `Pit` basin; can become an inland sea depending on sea level.
- **Fjord Coast (glacially carved inlets):** coastal uplift `Range` plus many narrow coastal `Trough`s to form deep, thin inlets.
- **Drowned Riverlands (rias coast):** gentle coastal lowlands with branching `Trough`s running inland-to-coast (flooded valleys / estuaries).
- **Inland Sea + Straits:** one large internal basin (`Pit` / broad `Trough`) plus one or two narrow `Strait` connectors to an outer ocean.
- **High Plateau + Canyon Cut:** broad uplift (`Add`/`Range`) + flattening (`Smooth`) + deep incision (`Trough`) to form canyon networks.
- **Endorheic Basin Field (salt pans):** lowered interior plus many small `Pit`s to create closed drainage basins; can be a `dryLakes` variant focused on multi-basin structure.

1. **Select 21 more P1 concepts** to turn into concrete templates next (beyond `dryLakes` and `barrierIslands`).
   - Strong candidates: **Fjord Coasts**, **Delta World**, **Rift Valley Chain**, **Canyon World**.
2. For each chosen concept:
   - Draft a **template pseudo-spec** (where highs/lows go, approximate percent of land vs sea, expected climates).
   - Implement a new `heightmapTemplates` entry and preview it in the Heightmap Selection dialog.
3. Once a few are implemented, update `DEVplans/Changes-vs-Azgaar-master.md` to record which **landform-driven templates** exist only in this fork.

Status (2025-12-17): Implemented 10 new heightmap templates in `config/heightmap-templates.js` and wired them into the Heightmap Editor `templateSelect` dropdown in `index.html`.

Status (2025-12-18): Tuned `tripleJunction` template to generate a larger base landmass (improved usability).

Status (2025-12-18): Tuned `fjordCoast` template X-range placement to be more centered (improved usability).

Status (2025-12-18): Tuned `drownedRiverlands` template to generate a larger base landmass (improved usability).

Status (2025-12-18): Tuned `inlandSeaStraits` template to be less water-heavy and widen straits (improved usability).

Status (2025-12-18): Tuned `inlandSeaStraits` again to increase surrounding landmass and widen connector straits further.

Status (2025-12-18): Retuned `inlandSeaStraits` to be more strait-like (long corridor) while keeping enough land for population.

Status (2025-12-18): Tuned `highPlateauCanyons` template to reduce ocean coverage (improved usability).

Status (2025-12-18): Tuned `endorheicBasins` template to reliably generate land (improved usability).

Status (2025-12-18): Tuned `barrierIslands` template to increase livable land area (improved usability).

Status (2025-12-18): Retuned `calderaArchipelago` template to better resemble a caldera archipelago (ring islands with central caldera).
