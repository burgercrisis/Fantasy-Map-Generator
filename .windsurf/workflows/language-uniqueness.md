---
description: Makes languages unique 1
auto_execution_mode: 0
---

Use this workflow to burn down **language mixer uniqueness debt** for already-present languages.

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

This is the Worker 1 workflow: run the report at the start of each session, take a small batch (default **10** affected ISOs), fix them end-to-end, then stop. When the user says `continue`, repeat.

# Non-negotiable invariants

- Must preserve append-only registry; never delete ISOs from:
  - `config/language-mixes.json`
  - `config/language-mixer-map.json`
- Do not “solve” uniqueness debt by removing entries or converting them into family macros.

# Scope and posture

- This workflow is about **uniqueness** (no identical `bases[]` set collisions, and ideally each non-family ISO has at least one globally-unique base index).
- Do not change Wikipedia list **coverage** status here. If you are working a specific Wikipedia list, use the `/wikipedia*` workflows.

# Required tools

- `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-base-clusters.js [--min-size=N] [--family=...] [--category=...] [--region=...] [--include-families]`
- `pnpm exec -- node tools/check-language-mixer-map-inconsistencies.js [--family=...] [--category=...] [--region=...] [--base=IDX[,IDX...]] [--show-all-bases]`
- `pnpm exec -- node tools/mixer-diagnostics/check-language-mixer-map-duplicate-isos.js`
- `pnpm exec -- node tools/mixer-core/run-language-mixer-suite.js`

Optional (recommended when doing dedicated-base anchor work):

- `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --only-failures`

# Session loop

## 1) Find a target batch

1. Run the base-cluster report:

   - `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2 --include-families`

2. Pick the next small batch (default **10** non-sentinel / non-`skip: true` languages) contributing to collisions.

## 2) Fix the batch

For each ISO in the batch:

- Make its effective `bases[]` set **globally unique** (overlaps are fine, identical arrays are not).
- Prefer resolving uniqueness via **dedicated bases** when needed (append-only in `modules/namebases-real.js`), but small plausible mix adjustments are also acceptable.

## 3) Required verification

Run:

- `pnpm exec -- node tools/mixer-diagnostics/check-language-mixer-map-duplicate-isos.js`
- `pnpm exec -- node tools/check-language-mixer-map-inconsistencies.js --show-all-bases`
- `pnpm exec -- node tools/mixer-core/run-language-mixer-suite.js`

If the suite fails-fast due to missing dedicated base definitions, restore/add the missing base indices in `modules/namebases-*.js` before proceeding.

Re-run the base-cluster report to confirm the targeted collisions are gone:

- `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2 --include-families`

## 4) Optional unique-base anchor verification

If your batch work included adding a dedicated base index to satisfy the “each language has an anchor base unique to it” goal, re-run:

- `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --only-failures`
