---
description: dry below-sea-level canyon support
---

## Status 2025-12-19
- Scoped workstream "Below-Sea-Level Dry Canyons"
- Step 1 complete: documented all land/water classification touchpoints (features, routes, rivers, lakes, submap, UI).
- Step 2 complete: **Design 2 (`cells.dryBelowSea`) approved and fully recorded below.**
- Next milestone: implement the schema/helpers/gameplay/rendering/tooling changes from Design 2, then rerun verification (Step 3).

## Approved plan (Design 2 — `cells.dryBelowSea`)
1. **Schema & persistence**
   - Allocate `pack.cells.dryBelowSea` (Uint8/bitset) wherever cell arrays are created (`reGraph`, heightmap editor rebuild, etc.).
   - Thread the flag through save/load flows plus auto-update migrations so older saves default to 0.
2. **Core helpers**
   - Update `isLand`/`isWater` (graphUtils + submap) to return land when the flag is set even if `h < 20`.
   - Refactor direct `cells.h < 20` checks in dependent modules to use the helpers so the override propagates automatically.
3. **Gameplay systems**
   - Ensure features markup, coastline tagging, routing, rivers, lakes, markers, etc. respect the dry flag.
   - Clear the flag whenever hydrology purposefully fills a cell (lake creation, sea merge) to avoid stale overrides.
4. **Rendering & UI**
   - Keep water layers from drawing flagged cells; let height renderers show actual depth.
   - Surface the flag in inspectors/tooltips for debugging and manual toggles if needed.
5. **Authoring tools**
   - Add a “Dry Canyon” heightmap op (and template usage) that both lowers the terrain and sets the flag.
6. **Verification**
   - Re-run coast/river generation and sanity-check routes.
   - Update this DEVplan with outcomes + any follow-up knobs once implementation/validation finish.
