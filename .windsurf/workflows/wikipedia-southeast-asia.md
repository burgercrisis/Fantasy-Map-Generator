---
description: Wikipedia Languages of Southeast Asia wiring
auto_execution_mode: 0
---

## Execution guardrails (required)

- Do **not** run any `git` commands (including `status`, `diff`, `log`, `checkout`, `switch`, `pull`, `push`, `commit`, `stash`, `reset`, `merge`, `rebase`). If git is needed, stop and ask the user.

Hub locks are the **only single-writer enforcement mechanism**. Before editing any shared file/scope, acquire a hub lock via `mcp1_lock_acquire` on a stable resource string like `file:<repo-relative-path>`.

Multi-agent coordination note:

- Follow `.windsurf/workflows/no-unique-base-coordination.md` for claim semantics, reserved range discipline, and the **immediate lock release rule** (`mcp1_lock_release` immediately after each edit; do not wait for TTL auto-expiration).

Use this workflow together with `/wikipedia1` when working on the **Languages of Southeast Asia** list.

Must preserve append-only registry; never delete ISOs.

1. Treat `tools/mixer-meta/wikipedia-languages-of-southeast-asia.json` as the current list JSON.
2. Follow `/wikipedia1` exactly, ensuring each in-scope language reaches **catalog + mixer-map + unique `bases[]` + race reachability** in the same pass.
3. Keep §8.10 in `DEVplans/Languages-Status.md` synced via the devplan helper.
