---
description: Wikipedia native-speakers CIA-2018 subset wiring
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

Use this workflow together with `/wikipedia1` when working on the **CIA World Factbook 2018** subset of the native-speakers list.

Must preserve append-only registry; never delete ISOs.

1. Treat `tools/mixer-meta/wikipedia-list-languages-by-native-speakers-cia-2018.json` as the **current list JSON**.
2. Follow `/wikipedia1` exactly for this JSON and update §8.3 in `DEVplans/Languages-Status.md`.
3. On `continue`, take the next batch of not-yet-full (coverage) languages from this CIA subset.
