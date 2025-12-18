# Grand Strategy + RPG Game (New Repo)

## Status
- Planning decisions captured (approved).
- Implementation not started.

## Vision / Requirements (user-stated)
- A fantasy-based grand strategy game focused on:
  - diplomacy and realm administration
  - mathematically driven military/war/economy systems
  - succession
  - Dungeons & Dragons roleplaying elements

## Approved Direction Decisions
- Repo strategy: **Hybrid**
  - Keep `Fantasy-Map-Generator` as **world authoring**
  - Build a **separate, standalone** sim/game layer in a **new repo**
- Platform: **Desktop-native** (game runtime)
- Engine/framework: **Godot 4**
- Integration strategy: **Godot 4 + GDExtension (C++) + Rust libraries (C ABI)**
- Runtime stack: **C++ (GDExtension)** with **Rust libraries** for:
  - simulation
  - pathfinding
  - AI
  - procedural generation
- Presentation: **2D first for alpha**, add **3D** later (before beta)
- Runtime dataflow: **Event-stream + periodic snapshots** (default 30 sim-days; configurable)
- Packaging: **One Rust DLL** (`gsg_core`) until a strong reason to split
- Command input: **JSON array** for alpha; consider NDJSON later if needed
- Eventing: **UI events** + optional **debug/audit channel** (behind a flag)
- Snapshots: **`snapshot.due`** is emitted on the **UI channel** (system UI event)
- ABI ownership: **Rust-owned output buffers** + **explicit free**; **stable handle lifetimes**
- ABI handle: **opaque pointer** `gsg_engine_t*`
- ABI errors: per-call `out_err_json` (**NULLable**)
- Sim advance: `delta_sim_ms`
- Event envelope: **numeric `kind`** + string **`type`** (JSON)
- Event envelope fields: always include `v` (schema version) + `t` (sim-time)
- Export contract: **Geo+poli first for alpha**, increment schema with explicit versions
- Scripting: **GDScript for UI glue only**; core logic stays **C++/Rust**
- Data formats: **JSON-first** with strict **schema/version**; optional binary cache later
- Time model: **Real-time with pause** (Crusader Kings style)
- RPG layer: **Narrative adventures + abstract missions hybrid**
  - narrative event chains + skill checks + loot tables
  - abstract mission system (risk/reward, party composition, limited choices)
- Primary inspirations: **CK3 + D&D 3.5 + Factorio**

## Open Questions / Next Choices
- What is the **minimum export contract** (alpha) from the world-authoring repo to the new game repo?
  - geo+poli first: map topology, realms/holdings, titles, history start date, etc.
  - JSON schema: field list + explicit schema versions
- What is the Rust↔C++ boundary?
  - C ABI surface
  - event stream schemas (UI vs debug/audit) and versioning
  - snapshot triggers and overrides (default 30 sim-days; configurable)
- Single-player only, or eventual multiplayer?
- What is the initial **scope boundary** for the Factorio-like layer?
  - logistics, production chains, automation, resource nodes, construction, etc.
- How literal should the D&D 3.5 influence be?
  - exact mechanics vs “inspired by” (classes/feats/spells/leveling)
- What is the initial definition of “realm administration” MVP?
  - vassal contracts, laws, councils, factions, legitimacy, claims, succession rules
- What is the initial definition of “math-forward war” MVP?
  - levy/professional split, supply, morale, terrain, commanders, deterministic battle model
