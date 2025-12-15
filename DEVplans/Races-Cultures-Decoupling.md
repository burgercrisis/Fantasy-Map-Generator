# Races ↔ Cultures Decoupling (Choice A)

## Status
- Status: in progress
- Owner: Cascade
- Scope: Make Race an independent, cell-level layer (`pack.cells.race`), with Cultures independent (no authoritative `culture.race`).

## Goal
- Races are managed by the **Races** tool/panel and apply to **cells**.
- Cultures are managed by the **Cultures** tooling and apply to **cells**.
- A culture can be **multi-race** (implicitly, by the races present in its cells).
- Multiple cultures can share the same **dominant race**.

## Non-goals (for this refactor)
- Do not redesign the language mixer or renamebases as part of this change unless required for correctness.
- Do not require new UI for “race distributions per culture” beyond what can be derived from `pack.cells.race`.

## Current coupling (what exists today)
- `initializeRacesForExpansion` assigns `culture.race` and also mutates `culture.base` for non-human cultures.
- `assignRaces` propagates race from `culture.race` to states / burgs / religions / provinces and derives `cells.race` from `cells.culture → culture.race`.
- `Cultures.expand` multiplies culture expansionism by race expansionism via `culture.race`.
- Races Editor statistics currently aggregate by `culture.race` (and uses `cells.culture → culture.race`).
- Save/load currently persists `pack.races`, but does not treat `pack.cells.race` as authoritative.

## Target model (Choice A)
### Data invariants
- **Authoritative**: `pack.cells.race[cellId] = raceId`
- **Authoritative**: `pack.cells.culture[cellId] = cultureId`
- **Metadata**: `pack.races[raceId] = { i, name, color, expansionism, ... }`
- **Culture does not own race**: `pack.cultures[cultureId]` should not be the source of truth for race.

### Derived concepts
- **Dominant race of a culture** is computed by scanning cells:
  - for all cells where `cells.culture === cultureId`, count `cells.race`, choose max.
- **Race stats** (cultures/states/burgs/etc) should be derived from `cells.race` (and/or entity cell pointers), not `culture.race`.

## Migration / backward compatibility
- On load, if `pack.cells.race` is missing but `culture.race` exists:
  - set `pack.cells.race[cellId] = pack.cultures[cultureId].race || 0` for each cell.
- After migration, `culture.race` becomes:
  - either removed, or treated as deprecated/derived-only (implementation decision).

## Open decisions (need user confirmation)
1) **Race expansionism impact on culture expansion**
- Option A: keep impact (derive effective race per cell/culture via dominant race).
- Option B: remove impact (culture expansionism independent).

2) **Race → language behavior**
- Option A: keep race-specific language generation for race names only (no longer overwrite `culture.base`).
- Option B: add an explicit action: “Sync culture language base to dominant race language”.

3) **Entity race fields (`state.race`, `burg.race`, `religion.race`, `province.race`)**
- Option A: keep fields but compute from `cells.race` (dominant within entity territory).
- Option B: deprecate/remove fields and compute on-demand.

## Work plan (milestones)
1) Inventory all code paths that read/write `culture.race` and `cells.race`.
2) Introduce `pack.cells.race` as authoritative + migration on load.
3) Update generation + editors to stop depending on `culture.race`.
4) Update save/load schema to persist `cells.race` if not already persisted.
5) Verification in UI: multiple cultures can share a race; cultures can be mixed-race; no regressions in Races panel.

## Verification checklist
- New map: assign races in Races panel, verify `pack.cells.race` changes and persists.
- Create two cultures within the same dominant race; verify both display as separate cultures.
- Create a culture with mixed races (by painting/assigning races across its cells) and confirm dominant race calculation behaves.
- Load an old `.map` where cultures had `culture.race`: verify migration produces sensible `cells.race`.
