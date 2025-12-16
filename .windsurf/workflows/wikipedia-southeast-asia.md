---
description: Wikipedia Languages of Southeast Asia wiring
auto_execution_mode: 0
---

## Execution guardrails (required)

- Do **not** run any `git` commands (including `status`, `diff`, `log`, `checkout`, `switch`, `pull`, `push`, `commit`, `stash`, `reset`, `merge`, `rebase`). If git is needed, stop and ask the user.
- Do **not** paraphrase this workflow into new commands. Only run the exact commands shown in this file.
- If you believe an additional command is required, stop and ask the user before running anything.

Hub locks are the **only single-writer enforcement mechanism**. Before editing any shared file/scope, acquire a hub lock via `mcp5_lock_acquire` on a stable resource string like `file:<repo-relative-path>`.

Use this workflow together with `/wikipedia1` for **Languages of Southeast Asia – regional subset** (§8.10).

Must preserve append-only registry; never delete ISOs.

1. Treat `tools/mixer-meta/wikipedia-languages-of-southeast-asia.json` as the current list JSON.
2. Follow `/wikipedia1` exactly, ensuring each in-scope language reaches **catalog + mixer-map + unique `bases[]` + race reachability** in the same pass.
3. Keep §8.10 in `DEVplans/Languages-Status.md` synced via the devplan helper.
