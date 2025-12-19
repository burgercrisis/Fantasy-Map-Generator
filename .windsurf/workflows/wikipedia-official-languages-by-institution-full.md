---
description: Wikipedia official languages by institution full-list wiring
auto_execution_mode: 0
---

## Execution guardrails (required)

- Do **not** run any `git` commands (including `status`, `diff`, `log`, `checkout`, `switch`, `pull`, `push`, `commit`, `stash`, `reset`, `merge`, `rebase`). If git is needed, stop and ask the user.
- Do **not** paraphrase this workflow into new commands. Only run the exact commands shown in this file.
- If you believe an additional command is required, stop and ask the user before running anything.

Hub locks are the **only single-writer enforcement mechanism**. Before editing any shared file/scope, acquire a hub lock via `mcp1_lock_acquire` on a stable resource string like `file:<repo-relative-path>`.

Use this workflow together with `/wikipedia1` for **official languages by institution – full article list** (§8.35b).

Must preserve append-only registry; never delete ISOs.

1. Target JSON: `tools/mixer-meta/wikipedia-list-official-languages-by-institution-full.json`.
2. Apply `/wikipedia1`: for each institutional language, ensure **catalog + mixer-map + unique `bases[]` + race reachability**.
3. Re-run the devplan helper for this JSON to keep §8.35b snapshots current as you expand wiring.

When selecting the “next batch”, treat `full` / “not-yet-full” as a **coverage** status (catalog + mixer-map). Uniqueness debt and race reachability are tracked separately and still need to be resolved before calling the list “fully represented”.
