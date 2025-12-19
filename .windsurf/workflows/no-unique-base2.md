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

See `.windsurf/workflows/no-unique-base-coordination.md` for the canonical coordination protocol (claim/status semantics, reserved ranges, and notes format).

Hub locks are the **only single-writer enforcement mechanism**. Before editing any shared file/scope (e.g. `modules/namebases-*.js`, `tools/mixer-deltas/*.json`, `DEVplans/*.md`), acquire a hub lock via `mcp1_lock_acquire` on a stable resource string like `file:<repo-relative-path>`.

### Immediate lock release rule (required)

- Release each lock **immediately after your edit to that file/scope is finished**—never rely on TTL auto-expiration.
- Use `mcp1_lock_release` with the same `resource` string you acquired. If you must keep the lock during a multi-step edit, set a short TTL and renew explicitly; record the reason in your workstream notes.
- When editing multiple files in sequence, release the current file’s lock before acquiring the next unless you truly need both simultaneously (rare; document if so).
- If a lock becomes orphaned (e.g., tool failure), promptly re-acquire and release it or call out the issue in the workstream so others know to wait only for the short TTL.

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
  - Single-integrator lane: if you are not the integrator, do not run `pnpm run mixer:apply-deltas` or regenerate committed artifacts; hand off the delta + notes to the integrator for apply + verification. See `.windsurf/workflows/single-integrator-lane.md`.
- Do **not** directly edit `explicitIsoDedicatedBaseMap` in `tools/mixer-core/fix-language-mixer-mappings.js` (prefer deltas).
- When adding new base indices (`i:`) in `modules/namebases-*.js`, reserve an index range and only create new `i:` values inside that range (recorded in the claim `notes`).

# Steps

## 1) Sync your claim to reality (required)

1. Find your claim entry (`workerId` / `batchId`).
2. Update the claim via the helper (preferred: target by `batchId`). This sets `updatedAt` and writes under a lock:

```bash
pnpm exec -- node tools/mixer-diagnostics/no-uniq-base-claim.js --update --batchId=<batchId> --appendNotes --notes="Reserved i range: start-end"
```

3. Ensure `notes` include:
   - Your reserved `i:` range (required):
     - `Reserved i range: start-end`
   - ISO->base mapping you applied (one per line, e.g. `iso->NNN`).
   - Any reserved base sub-ranges you intentionally did not use.
   - Any remaining seed-uniqueness debt lines:
     - `iso: strictUniqueSeeds=X, normUniqueSeeds=Y`.

If you need to create a new claim (instead of updating an existing one), use the helper:

```bash
pnpm exec -- node tools/mixer-diagnostics/no-uniq-base-claim.js --workerId=<NUM> --isos=<comma-separated batch isos> --status=in_progress
```

## 2) Verify required invariants (required)

Run:

- `pnpm run mixer:guardrails`
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

- If `NO_UNIQ_BASE` is cleared for all batch ISOs:

```bash
pnpm exec -- node tools/mixer-diagnostics/no-uniq-base-claim.js --update --batchId=<batchId> --status=complete
```

- If blocked:

```bash
pnpm exec -- node tools/mixer-diagnostics/no-uniq-base-claim.js --update --batchId=<batchId> --status=stalled --appendNotes --notes="BLOCKER: ..."
```

## 5) Continue

- If complete: claim the next batch (prefer same family/category) and proceed.

# Report format (when done)

Reply with:

- `workerId=__ batchId=__ status=complete|stalled`
- ISO->base mapping list
- Any remaining strict/norm debt lines
- Files changed
- Suggested commit messages (no commits performed by agents)
- Staging guidance (no git): describe how you would logically split the changes into commits (no commands run)
- Verification commands run (or to run), including `pnpm run mixer:check-deltas`