---
description: Multi-agent NO_UNIQ_BASE burn-down
auto_execution_mode: 0
---

You are Cascade working on the Fantasy-Map-Generator language mixer.

This workflow is designed to be **re-sent verbatim** to multiple agents working on the same repo.

# Execution guardrails (required)

- Do **not** run any `git` commands (including `status`, `diff`, `log`, `checkout`, `switch`, `pull`, `push`, `commit`, `stash`, `reset`, `merge`, `rebase`). If git is needed, stop and ask the user.
- Do **not** paraphrase this workflow into new commands. Only run the exact commands shown in this file.
- If you believe an additional command is required, stop and ask the user before running anything.
- Do **not** suggest “reverting”, “rolling back”, “dropping”, or “restoring” changes unless the user explicitly instructs you to revert a specific file (with an exact file list).
- Do **not** propose or run commits. The user/integrator owns all commits.
- If you see BOM / CRLF / timestamp churn or other suspicious diffs, the only allowed actions are:
  - Fix encoding/format **in-place** without removing content, or
  - Keep it as-is and continue, or
  - Leave it uncommitted / untouched and ask the user what to do.

# Objective

Burn down the seed-uniqueness debt bucket:

- `NO_UNIQ_BASE` = “No globally-unique base index”

as reported by:

- `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --only-failures`

The goal is to ensure every **non-family** catalog ISO has **at least one** base index that is referenced by **exactly one** non-family ISO in `config/language-mixer-map.json`.

# Non-negotiable invariants

- Never delete languages from:
  - `config/language-mixes.json`
  - `config/language-mixer-map.json`
- Preserve the append-only registry invariant.
- Do not “solve” debt by removing entries or marking them as family macros.
- Prefer pnpm:
  - use `pnpm exec -- node ...` for Node scripts.
- Pin early: if you assign a dedicated base index to any ISO, add `iso -> base` to `explicitIsoDedicatedBaseMap` in `tools/mixer-core/fix-language-mixer-mappings.js` before you run the suite.

# Coordination protocol (multi-agent safe)

Use a shared claim log so multiple agents don’t work the same ISO(s).

## Shared log file

Path:

- `tools/mixer-diagnostics/_no_uniq_base_claims.json`

If the file does not exist, create it with:

```json
{"version":1,"claims":[]}
```

## Claim format

Each claim is a batch of ISOs:

```json
{
  "workerId": 3,
  "batchId": "2025-12-13T10:00:00Z-worker3",
  "isos": ["abaga","abaza","abkhaz"],
  "status": "in_progress",
  "startedAt": "2025-12-13T10:00:00Z",
  "updatedAt": "2025-12-13T10:00:00Z",
  "notes": "Targeting Caucasian cluster; assign each ISO a dedicated base index."
}
```

Rules:

1. Pick a `workerId` not currently used by any `claims[*].workerId` that is `in_progress`.
2. Choose an ISO batch that is not already present in any other `in_progress` claim.
3. When finished (or blocked), update your claim:
   - `status`: `complete` or `stalled`
   - update `updatedAt`
   - add a short `notes` update
4. If there are no unclaimed ISOs in your scan window, pick the oldest `in_progress` claim and mark it `stalled` (do not delete it), then claim a different batch.

## Coordination option (recommended)

- Option 1: Have each in-progress worker update their claim with the actual base indices they used + confirm the rerun report result 
  - Update `notes` with the real ISO→base mapping you applied (and any reserved ranges you skipped).
  - Include confirmation that after your changes:
    - `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --only-failures --limit=500`
    - no longer lists your batch ISOs under `NO_UNIQ_BASE`.

# How to pick a batch

1. Run the report with a large limit so you can see enough candidates:

```bash
pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --only-failures --limit=500
```

2. From the output, pick **5–20** ISOs that show `NO_UNIQ_BASE`.

3. Prefer batching by a coherent slice:

- same `family` / `category`
- same geographic region
- or a known declustering target hub

Then claim that batch in the shared log.

# Execution loop (per claimed batch)

## A) Verify the baseline for your batch

1. For each ISO in your batch, confirm it exists in:

- `config/language-mixes.json`
- `config/language-mixer-map.json`

2. Confirm it currently fails `NO_UNIQ_BASE`.

## B) Create or assign a globally-unique base index

Goal: for each ISO, ensure at least one `bases[]` entry is globally unique (used by exactly one non-family ISO).

Preferred strategy (default):

- Add a new dedicated base index in `modules/namebases-real.js` (append-only).
- Ensure its seed list (`b`) is plausible for the ISO.
- Append the new base index to the ISO’s `bases[]` in `config/language-mixer-map.json`.

Important:

- Do not reuse a newly created base index across multiple ISOs.
- Keep changes append-only.

Seed-uniqueness thresholds (quality goal, not a hard gate):

- strict unique seeds `>= 1`
- normalized unique seeds `>= 10`

If you cannot meet these immediately, still land the unique base index and leave a note in your claim `notes`.

## C) Regenerate + verify

After edits:

0. If you created/assigned any dedicated base indices for your batch, pin them now:

- Add `iso -> base` entries to `explicitIsoDedicatedBaseMap` in `tools/mixer-core/fix-language-mixer-mappings.js`.

1. Run the suite:

```bash
pnpm exec -- node tools/mixer-core/run-language-mixer-suite.js
```

This regenerates the derived bundles (`config/language-mixes-all.js` and `config/language-mixer-map.js`) as part of the normal workflow.

If the suite fails-fast due to missing dedicated base definitions, restore/add the missing base indices in `modules/namebases-*.js` before proceeding.

2. Re-run the report and confirm your batch is improved:

```bash
pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --only-failures --limit=500
```

3. Confirm you did not introduce any identical `bases[]` set collisions:

```bash
pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2
```

## D) Finish the claim

Update your claim entry:

- `status: "complete"` (or `stalled`)
- `updatedAt`
- `notes` (what ISOs you fixed and what base indices were created)

# Stop / handoff behavior

If blocked (ambiguous ISO resolution, missing seeds, unclear family/region classification):

- Mark your claim as `stalled`.
- Write concise notes about what decision is needed.
- Then claim a different batch.

When stopping for handoff, include:

- Files changed
- Suggested commit messages (no commits performed by agents)
- `git add -p` guidance for how to stage the changes into logical commits
- Verification commands run (or to run), including `pnpm run mixer:guardrails` and the suite
