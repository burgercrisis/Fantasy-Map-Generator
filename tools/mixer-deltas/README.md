---
description: Mixer delta queue (patch queue)
---

# Mixer deltas (patch queue)

This folder is the **patch queue** for language-mixer mapping changes.

The goal is to avoid multiple workers editing the large canonical files directly (especially `config/language-mixer-map.json`). Instead, workers add small delta JSON files here, then run the compiler to deterministically update the committed artifacts.

## Canonical command

- Apply deltas (writes artifacts if needed):
  - `pnpm run mixer:apply-deltas`

Single-integrator lane: in multi-agent contexts, only the integrator should run `pnpm run mixer:apply-deltas` to write/regenerate committed artifacts.
See `.windsurf/workflows/single-integrator-lane.md`.

- Check only (does not write; fails if artifacts are out of date):
  - `pnpm exec -- node tools/mixer-core/apply-mixer-deltas.js --check`

## Delta file naming

- One file per batch is recommended.
- Use an ISO date prefix so files sort deterministically.

Example:

- `2025-12-14-worker49.json`

## Delta schema

Each delta file is JSON with optional keys:

- `setBases` (alias: `replaceBases`): `{ [iso: string]: number[] }`
  - Sets the ISO’s `bases[]` to an exact array (normalized + sorted).
  - Use this for declustering / “make bases[] unique” work where you need a precise mix.

- `dedicatedPins`: `{ [iso: string]: number }`
  - Declares that an ISO must have a globally-unique dedicated base index.
  - The compiler will ensure the dedicated base is present in that ISO’s `bases[]`.

- `appendBases`: `{ [iso: string]: number[] }`
  - Adds one or more base indices to an ISO’s `bases[]`.

Example:

```json
{
  "setBases": {
    "navarro-aragonese": [287, 902]
  },
  "dedicatedPins": {
    "mozarabic": 898,
    "murcian": 899
  },
  "appendBases": {
    "navarro-aragonese": [4]
  }
}
```

## Application order

1. `setBases` (exact override)
2. `dedicatedPins` (ensures pinned base is included)
3. `appendBases` (adds additional bases)

## What files are generated/updated

Running the delta compiler updates:

- `config/language-mixer-map.json`
- `config/language-mixer-map.js` (via `tools/mixer-core/generate-language-mixer.js`)
- `tools/mixer-deltas/_compiled-dedicated-pins.json`

`tools/mixer-core/fix-language-mixer-mappings.js` loads the compiled pins file at runtime.

## Hard rules enforced by the compiler

- Delta ISOs must exist in `config/language-mixes.json`
- Referenced base indices must exist in namebases (`modules/namebases-*.js`)
- Dedicated pins must be globally unique (no other ISO can already use that base index)

If any check fails, the compiler exits non-zero and does not write outputs.
