---
description: Wikipedia phoneme-count full-list wiring
auto_execution_mode: 0
---

## Execution guardrails (required)

- Do **not** run any `git` commands (including `status`, `diff`, `log`, `checkout`, `switch`, `pull`, `push`, `commit`, `stash`, `reset`, `merge`, `rebase`). If git is needed, stop and ask the user.
- Do **not** paraphrase this workflow into new commands. Only run the exact commands shown in this file.
- If you believe an additional command is required, stop and ask the user before running anything.

Hub locks are the **only single-writer enforcement mechanism**. Before editing any shared file/scope, acquire a hub lock via `mcp1_lock_acquire` on a stable resource string like `file:<repo-relative-path>`.

Multi-agent coordination note:

- Follow `.windsurf/workflows/no-unique-base-coordination.md` for claim semantics, reserved range discipline, and the **immediate lock release rule** (`mcp1_lock_release` immediately after each edit; do not wait for TTL auto-expiration).

Use this workflow together with `/wikipedia1` when working on the **phoneme inventory** list snapshot.

Must preserve append-only registry; never delete ISOs.

1. Target JSON: `tools/mixer-meta/wikipedia-languages-by-phoneme-count-full.json`.
2. Apply `/wikipedia1`: for each in-scope language, ensure **catalog + mixer-map + unique `bases[]` + race reachability**, even though this list is typological rather than regional.
3. Re-run the devplan helper for this JSON to keep §8.33b coverage snapshots in sync as you wire more items.
