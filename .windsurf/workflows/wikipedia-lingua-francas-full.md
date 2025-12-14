---
description: Wikipedia lingua francas full-list wiring
auto_execution_mode: 0
---

## Execution guardrails (required)

- Do **not** run any `git` commands (including `status`, `diff`, `log`, `checkout`, `switch`, `pull`, `push`, `commit`, `stash`, `reset`, `merge`, `rebase`). If git is needed, stop and ask the user.
- Do **not** paraphrase this workflow into new commands. Only run the exact commands shown in this file.
- If you believe an additional command is required, stop and ask the user before running anything.

Use this workflow together with `/wikipedia1` for **lingua francas – full article list** (§8.37).

Must preserve append-only registry; never delete ISOs.

1. Treat `tools/mixer-meta/wikipedia-list-lingua-francas-full.json` as the current list JSON.
2. Follow `/wikipedia1`: for each lingua franca, wire **catalog + mixer-map + globally unique `bases[]` (with appropriate lexifier/contact mixes) + race reachability**.
3. Keep §8.37 in `DEVplans/Languages-Status.md` synced via the devplan helper after each wiring batch.
