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

Single-integrator lane (team rule):

- Only the integrator runs `pnpm run mixer:apply-deltas` to regenerate committed artifacts.
- Non-integrators should contribute delta files + claim notes and then hand off for apply + verification. See `.windsurf/workflows/single-integrator-lane.md`.

# Canonical coordination primitives

## 0) Global contention dashboard (read-only)

Before claiming or editing any coordination files, run:

```bash
pnpm exec -- node tools/mixer-diagnostics/claims-dashboard.js
```

## 0b) Overlap discovery (Hub-first; read-only)

If you need to confirm whether a file/scope is already being worked:

- Prefer hub-routed ripgrep: `mcp1_hub_exec` target=`ripgrep` tool=`search` / `advanced-search`
- Fallback to local tools: `code_search`, `grep_search`, `find_by_name`, `list_dir`, `read_file`, `read_notebook`

## 1) Workstream claim (Hub)

Before editing any files, claim your workstream in the MCP Coordination Hub using:

Check for existing work/claims first:

- `mcp1_workstream_list` (scan active/paused workstreams)
- `mcp1_workstream_get` (details)
- `mcp1_decision_admin` (record decisions/evidence when needed)
- `mcp1_time_now` (timestamps when needed)

Then claim your workstream:

- `mcp1_workstream_create` (or `mcp1_workstream_update` if resuming)

Include:

- owner
- goal
- file/scope
- constraints
- status=in_progress
- short plan (2-5 milestones)

Before touching any claimed file/scope, acquire a hub lock using:

- `mcp1_lock_acquire` with a stable resource string like `file:<repo-relative-path>` or `scope:<subsystem>`

Hub locks are the **only single-writer enforcement mechanism**. The repo-local claims log below is coordination metadata (ISO batching + reserved ranges + notes) and does not prevent concurrent writes by itself.

### Immediate lock release rule (required)

- Release the lock **as soon as your edit to that file/scope is complete**. Do not rely on TTL auto-expiration.
- Use `mcp1_lock_release` with the exact same `resource` string you acquired. If you must keep the lock longer (e.g., mid-edit), renew via a short TTL and document why in your workstream notes.
- When performing sequential edits across multiple files, release each file lock before acquiring the next one unless you have an explicit dependency that requires atomic edits involving both files (rare).
- If you lose track of an active lock (e.g., tool failure), immediately re-acquire + release it or note the issue in the workstream so others know it will expire shortly.

## 2) Shared claims log

Path:

- `tools/mixer-diagnostics/_no_uniq_base_claims.json`

Status semantics:

- `in_progress` marks ISOs as reserved for coordination (other agents must not claim or work those ISOs)
- `complete` does not lock ISOs
- `stalled` does not lock ISOs (treat as released; preserve as history)

Lock-release rule:

- If you are not actively working the batch (blocked, switching tasks, or stopping for handoff), do **not** leave your claim `in_progress`.
- Update it to `stalled` with a short handoff note so other workers can proceed.

Stale-claim policy (team norm):

- If a claim has been `in_progress` for **> 24h** and the worker is not actively working it, it should be moved to `stalled` (do not delete it) so the ISO lock is released.

Preferred stalling command (append-only notes under lock):

```bash
pnpm exec -- node tools/mixer-diagnostics/no-uniq-base-claim.js --update --batchId=<batchId> --status=stalled --appendNotes --notes="BLOCKER: ..."
```

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

# Other available Hub tools (FYI)

These exist in the hub tool surface, but do not override the guardrails at the top of this file:

- Coordination: `mcp1_lock_release`, `mcp1_workstream_update`, `mcp1_hub_admin` (tasks)
- Discovery/search: `mcp1_hub_exec` (ripgrep), `mcp1_fast_context`
- Read-only queries: `mcp1_sqlite_ro_query`
- Security/analysis: `mcp1_sbom_cyclonedx_generate`, `mcp1_semgrep_exec` / `mcp1_semgrep_list_tools`, `mcp1_codeql_exec` / `mcp1_codeql_list_tools`
- Browser automation: `mcp1_playwright_exec` / `mcp1_playwright_list_tools`, `mcp1_puppeteer_exec` / `mcp1_puppeteer_list_tools`
- GitHub: `mcp1_github_read`, `mcp1_github_write` (write-enabled; treat as unsafe)
- Docs/knowledge: `mcp1_hub_readme`, `mcp1_deepwiki_*` (only if repo is indexed)
- Perf: `mcp1_perf_status`, `mcp1_perf_http_load_test` (env + allowlist gated; treat as unsafe)

Note: `mcp1_git_read` exists, but this workflow’s “no git commands” guardrail still applies unless the user explicitly asks.
