---
description: Wikipedia Languages of Oceania wiring
auto_execution_mode: 0
---

## Execution guardrails (required)

- Do **not** run any `git` commands (including `status`, `diff`, `log`, `checkout`, `switch`, `pull`, `push`, `commit`, `stash`, `reset`, `merge`, `rebase`). If git is needed, stop and ask the user.
- Do **not** paraphrase this workflow into new commands. Only run the exact commands shown in this file.
- If you believe an additional command is required, stop and ask the user before running anything.

Hub locks are the **only single-writer enforcement mechanism**. Before editing any shared file/scope, acquire a hub lock via `mcp1_lock_acquire` on a stable resource string like `file:<repo-relative-path>`.

Use this workflow together with `/wikipedia1` for **Languages of Oceania – full page language mentions snapshot** (§8.6).

Must preserve append-only registry; never delete ISOs.

1. Treat `tools/mixer-meta/wikipedia-languages-of-oceania.json` as the current list JSON.
2. Follow `/wikipedia1` exactly, scoped to this list:
   - Use the coverage helpers on this JSON.
   - For each non-skipped item, bring it all the way to **catalog entry + mixer-map entry + globally unique `bases[]` + race reachability** in the same pass.
3. On each `continue`, take the next batch of not-yet-full (coverage) Oceania languages (group by family/region where possible) and repeat.
