---
description: Single integrator lane (artifact regeneration)
auto_execution_mode: 0
---

This workflow defines a team process rule for high-churn language mixer files and regenerated artifacts.

# Definition

- **Integrator**: the only person/agent allowed to run `pnpm run mixer:apply-deltas` in multi-agent contexts (writes/regenerates committed artifacts).
- **Non-integrator**: contributes delta files + notes; may run read-only validation; does not regenerate committed artifacts.

# What counts as “committed artifacts”

Running `pnpm run mixer:apply-deltas` can rewrite/regenerate:

- `config/language-mixer-map.json`
- `config/language-mixer-map.js`
- `tools/mixer-deltas/_compiled-dedicated-pins.json`

These are high-churn merge-conflict hotspots.

# Rules (non-negotiable)

- Only the integrator runs `pnpm run mixer:apply-deltas`.
- Non-integrators should not regenerate committed artifacts.
- Prefer delta files under `tools/mixer-deltas/*.json` over hand-editing generated files.

# Non-integrator workflow

1. Make your change as a delta file:
   - `tools/mixer-deltas/<date>-<worker>-<topic>.json`

2. Optional read-only validation (no writes):

   ```bash
   pnpm exec -- node tools/mixer-core/apply-mixer-deltas.js --check
   ```

3. Handoff to integrator:
   - delta file path(s)
   - what ISO(s) and base indices were targeted
   - the exact verification commands to run (e.g. `/no-unique-base2` checklist)

# Integrator workflow

1. Apply deltas (writes committed artifacts):

   ```bash
   pnpm run mixer:apply-deltas
   ```

2. Confirm artifacts are up to date:

   ```bash
   pnpm run mixer:check-deltas
   ```

3. Run the relevant verification gates (pick the smallest applicable set):
   - `pnpm run mixer:guardrails`
   - `pnpm exec -- node tools/mixer-core/check-language-mixer-coverage.js`
   - `pnpm exec -- node tools/mixer-core/check-language-mixer-failures.js`
   - `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --only-failures --only-isos=<comma-separated>`
   - `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2`

4. Record status-only notes in the appropriate `DEVplans/*` file(s).
