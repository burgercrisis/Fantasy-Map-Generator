---
description: Wikipedia Languages of Africa full-list wiring
auto_execution_mode: 0
---

## Execution guardrails (required)

- Do **not** run any `git` commands (including `status`, `diff`, `log`, `checkout`, `switch`, `pull`, `push`, `commit`, `stash`, `reset`, `merge`, `rebase`). If git is needed, stop and ask the user.
- Do **not** paraphrase this workflow into new commands. Only run the exact commands shown in this file.
- If you believe an additional command is required, stop and ask the user before running anything.
- Do **not** suggest “reverting”, “rolling back”, “dropping”, or “restoring” changes unless the user explicitly instructs you to revert a specific file (with an exact file list).
- Do **not** propose or run commits. The user/integrator owns all commits.
- If you see BOM / CRLF / timestamp churn or other suspicious diffs, the only allowed actions are:
  - Fix encoding/format **in-place** without removing content, or
  - Keep it as-is and continue, or
  - Leave it uncommitted / untouched and ask the user what to do.

Hub locks are the **only single-writer enforcement mechanism**. Before editing any shared file/scope, acquire a hub lock via `mcp5_lock_acquire` on a stable resource string like `file:<repo-relative-path>`.

Use this workflow together with `/wikipedia1` when working on the **Languages of Africa – full table snapshot** list.

Must preserve append-only registry; never delete ISOs.

1. Treat `tools/mixer-meta/wikipedia-languages-of-africa-full.json` as the **current list JSON**.
2. Follow the `/wikipedia1` workflow exactly, but scoped to this list:
   - Use the coverage helpers against this JSON.
   - For each non-skipped item, bring it all the way to **catalog entry + mixer-map entry + globally unique `bases[]` + race reachability** in the same pass.
3. When I say `continue`, pick the **next batch of not-yet-full (coverage) African languages** from this list (grouped by family/region where possible) and repeat.
