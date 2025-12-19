---
description: Premix Grade-A burn-down (multi-agent)
auto_execution_mode: 0
---
You are Cascade working on the Fantasy-Map-Generator language mixer.

# Objective

Bring all **non-family** mixer catalog languages to **Premix Grade A** by ensuring each ISO has **>= 50 unique premix seed tokens**.

- Premix seed tokens for an ISO are computed as the **union** of all comma-separated seed tokens from `base.b` across that ISO’s mapped `bases[]` in `config/language-mixer-map.json`.
- The canonical tracker lives in `node tools/mixer-diagnostics/snapshot-mixer-health-stats.js --diff` (field: `premixNameGrades`).

# Execution guardrails (required)

- Do **not** run any `git` commands.
- Do **not** paraphrase workflows that already exist. If you need `/no-unique-base2` verification, follow `.windsurf/workflows/no-unique-base2.md` verbatim.
- Hub locks are the **only** single-writer enforcement mechanism.
  - Before editing any shared file/scope, acquire a hub lock on a stable resource string like `file:<repo-relative-path>`.
- Prefer multi-agent stability:
  - If your change would require regenerating committed artifacts, follow `.windsurf/workflows/single-integrator-lane.md`.

# Tools

## Primary diagnostics

- Grade report (batch/backlog + targeted checks):

```bash
node tools/mixer-diagnostics/report-language-mixer-premix-grades.js --below=50 --limit=200
```

- Snapshot history (trend + diff):

```bash
node tools/mixer-diagnostics/snapshot-mixer-health-stats.js --diff
```

## Required invariants (always re-check)

- `pnpm run mixer:guardrails`
- `pnpm run mixer:check-deltas`

# Coordination protocol (hub-first)

## 0) Overlap check (before claiming work)

1) List active hub workstreams; look for any existing “Premix Grade A” workstreams.
2) If overlap exists for the same ISO set, stop and coordinate in that workstream.

## 1) Claim a batch (recommended size: 10–50 ISOs)

Create a new hub workstream with:
- Goal: “Premix Grade A burn-down batch”
- ISO list
- Planned edit strategy (see below)

Then acquire hub locks for each file you will touch.

# Implementation strategies (choose one per batch)

## Strategy A (recommended): Expand per-language dedicated base seed lists

When an ISO is below 50 premix tokens:

1) Ensure it has at least one dedicated (globally-unique) base index and is pinned via `tools/mixer-deltas/*.json` dedicatedPins.
2) In `modules/namebases-real.js` (append-only), expand that base’s `b:` list until the ISO’s premix token count reaches **>= 50**.

Notes:
- This strategy is compatible with `/no-unique-base2` work and usually improves both premix-grade and seed-uniqueness.

## Strategy B: Add additional existing bases (setBases)

1) Add one or more bases to that ISO’s `bases[]` via a `tools/mixer-deltas/*.json` `setBases` delta.
2) Recompute premix grade for the ISO.

Notes:
- This can raise token counts quickly but may reduce linguistic plausibility if bases are unrelated.

## Strategy C: Synthetic filler tokens (fast, but lower realism)

If you need a fast pass to raise counts (e.g., for automation), append unique synthetic tokens to the dedicated base’s `b:` list.

Examples:
- `iso_unq1, iso_unq2, ... iso_unq60`

Notes:
- This meets the metric but may be undesirable for realism; treat as a conscious policy choice.

# Single-integrator lane (artifact regen)

If you add/modify any `tools/mixer-deltas/*.json` delta that requires regenerating:
- `config/language-mixer-map.json`
- `config/language-mixer-map.js`
- `tools/mixer-deltas/_compiled-dedicated-pins.json`

…then only the **integrator** should run:

```bash
pnpm run mixer:apply-deltas
```

Non-integrators should instead do read-only checks:

```bash
pnpm exec -- node tools/mixer-core/apply-mixer-deltas.js --check
```

…and then hand off the delta path(s) + ISO list to the integrator.

# Verification (required)

For your ISO batch, run:

```bash
pnpm run mixer:guardrails
pnpm run mixer:check-deltas
node tools/mixer-diagnostics/report-language-mixer-premix-grades.js --only-isos=<comma-separated batch isos>
```

Confirm each ISO reports `grade=A` (count >= 50).

If you also changed mapping/pins (deltas), follow the relevant workflow(s):
- `.windsurf/workflows/no-unique-base2.md` (for NO_UNIQ_BASE2 batches)
- `.windsurf/workflows/single-integrator-lane.md` (if not integrator)

# Reporting / handoff format

When you finish a batch, update the hub workstream with:
- ISO list
- what you changed (files + deltas)
- premix grade before/after summary
- verification commands run
- any remaining risks/choices (e.g., whether synthetic fillers were used)
