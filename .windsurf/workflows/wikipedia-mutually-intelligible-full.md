---
description: Wikipedia mutually intelligible full-list wiring
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

 Hub locks are the **only single-writer enforcement mechanism**. Before editing any shared file/scope, acquire a hub lock via `mcp1_lock_acquire` on a stable resource string like `file:<repo-relative-path>`.

Use this workflow together with `/wikipedia1` for **mutually intelligible languages – full article list** (§8.34b).

Must preserve append-only registry; never delete ISOs.

1. Treat `tools/mixer-meta/wikipedia-mutually-intelligible-languages-full.json` as the current list JSON.
2. Follow `/wikipedia1`, but with special attention to base design:
   - Use the list as a reminder where very close bases/mixes may be justified.
   - Still aim for **globally unique `bases[]`** per language unless explicitly documented otherwise.
   - Ensure each language has **catalog + mixer-map + race reachability**.
3. Keep §8.34b in `DEVplans/Languages-Status.md` updated using the devplan helper.
