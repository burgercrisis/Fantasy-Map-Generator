# Grand Strategy + RPG Game (New Repo)

## Status
- Planning decisions captured (approved).
- Minimal C ABI surface finalized (approved) and recorded below.
- Alpha vertical slice selected: **Slice A — Frontier Ladder (Adventurer → Landed Baron)**.
- Slice A spec + acceptance criteria recorded (approved): promotion via **win conflict → claim → hold keep 7 days**; **continue as heir**; party governance **Commanded + Democratic**; role-based time controls (**Adventurer**: 15m/1h/travel-until-arrival with autopause events; **Baron**: 1d/1w with auto-drop to Adventurer increments when personally traveling); conflict uses **small grid / tactical encounters** (alpha); more tick-size options later.
- Slice A expansions locked (approved): encounter taxonomy (**Adventure** / **Security** / **War** [contextual]); encounter outcomes can carry both **tokens** + **values/deltas**; tactical combat is **Kill Team-ish** (alternating activations, cover+LOS, overwatch, pinned/suppression, 2-action economy, objective interactions); hold gauntlet failure outcomes are **contextual** per meter (**Order/Supply/Legitimacy**); governance is **vote-gated Tier 1 minimal** (+ loot division + travel objectives), with limited commanded directives and battle coordination not always guaranteed.
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

## Approved Minimal C ABI Surface (Rust DLL: `gsg_core`)
- Types
  - `gsg_engine_t*`: opaque handle
  - `gsg_bytes_t`: Rust-owned bytes buffer (UTF-8 JSON)
  - `gsg_status_t`: 0=ok, non-zero=error
- Ownership
  - Rust allocates returned `gsg_bytes_t` buffers; host must free via `gsg_bytes_free`
  - Stable handle lifetimes
- Functions
  - `gsg_engine_create(world_json, config_json, out_engine, out_err_json?)`
  - `gsg_engine_destroy(engine)`
  - `gsg_engine_configure_json(engine, config_json, out_err_json?)`
  - `gsg_engine_submit_commands_json(engine, commands_json, out_err_json?)`
  - `gsg_engine_advance_by(engine, delta_sim_ms, out_err_json?)`
  - `gsg_engine_drain_events_json(engine, channels_mask, out_events_json, out_err_json?)`
  - `gsg_engine_take_snapshot_json(engine, out_snapshot_json, out_err_json?)`
  - `gsg_engine_load_snapshot_json(engine, snapshot_json, out_err_json?)`
  - `gsg_get_version_json(out_version_json)`
  - `gsg_bytes_free(bytes)`
- Event envelope (JSON)
  - Always includes `v` (schema version) + `t` (sim-time)
  - Includes `kind` (numeric) + `type` (string)

## Open Questions / Next Choices
 
### Locked choices (2025-12-18)
- Export schema v0.1 scope: **1a** (minimal geo+poli only in v0.1)
- Encounter location model: **2a** (encounters happen on abstract local maps generated per encounter)
- Economy in alpha: **3a** (thin economy: upkeep + loot + basic supplies)
- Export data shape v0.1: **Option A** (location graph export; add full cell graph later as v0.2+)
- Realm administration MVP depth: **2b** (CK-like realm administration immediately)
- Multiplayer constraint: **3a** (single-player only for alpha)
- What is the **minimum export contract** (alpha) from the world-authoring repo to the new game repo?
  - geo+poli first: map topology, realms/holdings, titles, history start date, etc.
  - JSON schema: field list + explicit schema versions
- What is the Rust↔C++ boundary?
  - C ABI surface
  - event stream schemas (UI vs debug/audit) and versioning
  - snapshot triggers and overrides (default 30 sim-days; configurable)
- Multiplayer later? (alpha is single-player)
- What is the initial **scope boundary** for the Factorio-like layer? (alpha uses thin economy)
  - logistics, production chains, automation, resource nodes, construction, etc.
- How literal should the D&D 3.5 influence be?
  - exact mechanics vs “inspired by” (classes/feats/spells/leveling)
- What is the initial definition of “realm administration” MVP? (2b direction locked)
  - vassal contracts, laws, councils, factions, legitimacy, claims, succession rules
- What is the initial definition of “math-forward war” MVP?
  - levy/professional split, supply, morale, terrain, commanders, deterministic battle model
