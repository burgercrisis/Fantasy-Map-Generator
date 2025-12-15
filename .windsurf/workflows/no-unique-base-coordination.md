---
description: NO_UNIQ_BASE coordination protocol
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

# Objective

Provide a single canonical coordination protocol for multi-agent `NO_UNIQ_BASE` work:

- prevent overlapping work on the same ISO(s)
- reserve non-overlapping `i:` ranges for new dedicated bases
- standardize claim notes so other agents (and future you) can read and reuse them

# Canonical coordination primitives

## 1) Workstream claim (Memory)

Before editing any files, claim your workstream in MCP Memory with:

- owner
- goal
- file/scope
- constraints
- status=in_progress
- short plan (2-5 milestones)

## 2) Shared claims log

Path:

- `tools/mixer-diagnostics/_no_uniq_base_claims.json`

Status semantics:

- `in_progress` locks ISOs (other agents must not claim or edit those ISOs)
- `complete` does not lock ISOs
- `stalled` does not lock ISOs (treat as released; preserve as history)

## 3) Claim helper (recommended writer)

Do not hand-edit the claims JSON.

Dashboard (read-only):

```bash
pnpm exec -- node tools/mixer-diagnostics/no-uniq-base-claim.js --dashboard
```

Create a new claim:

```bash
pnpm exec -- node tools/mixer-diagnostics/no-uniq-base-claim.js --workerId=<NUM> --isos=<comma-separated isos> --status=in_progress
pnpm exec -- node tools/mixer-diagnostics/no-uniq-base-claim.js --workerId=<NUM> --iso=<iso1> --iso=<iso2> --status=in_progress
```

Update an existing claim (preferred: target by `batchId`):

```bash
pnpm exec -- node tools/mixer-diagnostics/no-uniq-base-claim.js --update --batchId=<batchId> --appendNotes --notes="..."
pnpm exec -- node tools/mixer-diagnostics/no-uniq-base-claim.js --update --batchId=<batchId> --status=complete
pnpm exec -- node tools/mixer-diagnostics/no-uniq-base-claim.js --update --batchId=<batchId> --status=stalled --appendNotes --notes="BLOCKER: ..."
```

PowerShell note:

- If commas split your args, quote the whole `--isos=...` arg, or use repeated `--iso=...`.

## 4) Read-only notes template helper

Print the next safe reserved range and a notes template (does not write any files):

```bash
pnpm exec -- node tools/mixer-diagnostics/print-no-uniq-base-claim-template.js --blockSize=50 --isos=<comma-separated isos>
```

# Claim notes format (required)

Range format (ASCII hyphen):

- `Reserved i range: start-end`

Mapping format:

- one mapping per line: `- iso->NNN`

Example:

```text
Reserved i range: 1590-1639
ISO->base mapping (fill in):
- iso1->1590
- iso2->1591
```

# Reserved range rules (required)

- Reserve an `i:` range before creating any new base indices.
- Only create new `i:` values inside your reserved range.
- If you need more indices, reserve an additional contiguous block before using it and append that new range to your claim notes.
