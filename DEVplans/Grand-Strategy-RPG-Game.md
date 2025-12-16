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
- Platform: **Browser**
- Time model: **Real-time with pause** (Crusader Kings style)
- RPG layer: **Narrative adventures + abstract missions hybrid**
  - narrative event chains + skill checks + loot tables
  - abstract mission system (risk/reward, party composition, limited choices)
- Primary inspirations: **CK3 + D&D 3.5 + Factorio**

## Open Questions / Next Choices
- What is the **minimum export contract** from the world-authoring repo to the new game repo?
  - map topology, realms/holdings, cultures, religions, characters, titles, history start date, etc.
- What is the initial **map interaction model** in the browser?
  - 2D (SVG/Canvas) vs 3D (WebGL/WebGPU)
- Single-player only, or eventual multiplayer?
- What is the initial **scope boundary** for the Factorio-like layer?
  - logistics, production chains, automation, resource nodes, construction, etc.
- How literal should the D&D 3.5 influence be?
  - exact mechanics vs “inspired by” (classes/feats/spells/leveling)
- What is the initial definition of “realm administration” MVP?
  - vassal contracts, laws, councils, factions, legitimacy, claims, succession rules
- What is the initial definition of “math-forward war” MVP?
  - levy/professional split, supply, morale, terrain, commanders, deterministic battle model
