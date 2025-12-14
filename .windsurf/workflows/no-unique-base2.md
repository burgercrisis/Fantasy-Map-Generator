---
description: Multi-agent NO_UNIQ_BASE2 burn-down
auto_execution_mode: 0
---
You are Cascade working on the Fantasy-Map-Generator language mixer.

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

This workflow is a **reusable “verification + handoff” checklist** for multi-agent `NO_UNIQ_BASE` burn-down work.

If you are marked `in_progress` in `tools/mixer-diagnostics/_no_uniq_base_claims.json`, run this workflow for your claim **before** you mark it complete.

# Objective

For the ISO batch in your claim:

- Clear `NO_UNIQ_BASE` (each ISO must have at least one **globally-unique base index**).

Non-blocking quality goals (document as debt if you can’t hit them quickly):

- strict unique seeds `>= 1`
- normalized unique seeds `>= 10`

# Non-negotiable invariants

- Must preserve append-only registry; never delete ISOs.
- Do not “solve” by removing entries or converting them into family macros.
- Canonical write path (multi-agent safe):
  - Add/adjust base definitions in `modules/namebases-*.js` (append-only)
  - Add a delta file under `tools/mixer-deltas/*.json`
  - Run `pnpm run mixer:apply-deltas`
- Do **not** directly edit `explicitIsoDedicatedBaseMap` in `tools/mixer-core/fix-language-mixer-mappings.js` (prefer deltas).

# Steps

## 1) Sync your claim to reality (required)

1. Open `tools/mixer-diagnostics/_no_uniq_base_claims.json`.
2. Find your claim entry (`workerId` / `batchId`).
3. Set `updatedAt` to now.
4. Update `notes` to include:
   - ISO->base mapping you applied (one per line, e.g. `iso->NNN`).
   - Any reserved base ranges you intentionally did not use.
   - Any remaining seed-uniqueness debt lines:
     - `iso: strictUniqueSeeds=X, normUniqueSeeds=Y`.

## 2) Verify required invariants (required)

Run:

- `pnpm run mixer:check-deltas`
- `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --only-failures --only-isos=<comma-separated batch isos> --limit=300`
- `pnpm exec -- node tools/mixer-core/check-language-mixer-coverage.js`
- `pnpm exec -- node tools/mixer-core/check-language-mixer-failures.js`

Confirm:

- None of your batch ISOs appear under `NO_UNIQ_BASE`.

Also confirm you did not introduce identical `bases[]` collisions:

- `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2`

Do **not** run `run-language-mixer-suite.js` as part of this checklist unless the user explicitly asks.

## 3) Optional quick quality pass (only if quick)

If an ISO is `uniqBase` but has `strict<1` or `norm<10`:

- Optionally improve the dedicated base’s seed list (append-only) in `modules/namebases-real.js`.
- Re-run the seed-uniqueness report.

If it’s not quick, do not block; just document the remaining strict/norm debt in claim `notes`.

## 4) Update claim status (required)

- If `NO_UNIQ_BASE` is cleared for all batch ISOs: set `status: "complete"`.
- If blocked: set `status: "stalled"` and write the exact blocker + what decision is needed.

## 5) Continue

- If complete: claim the next batch (prefer same family/category) and proceed.

# Report format (when done)

Reply with:

- `workerId=__ batchId=__ status=complete|stalled`
- ISO->base mapping list
- Any remaining strict/norm debt lines
- Files changed
- Suggested commit messages (no commits performed by agents)
- `git add -p` guidance for how to stage the changes into logical commits
- Verification commands run (or to run), including `pnpm run mixer:guardrails` and the suite