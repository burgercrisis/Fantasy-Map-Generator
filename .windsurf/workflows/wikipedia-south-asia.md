---
description: Wikipedia Languages of South Asia wiring
auto_execution_mode: 0
---

## Execution guardrails (required)

- Do **not** run any `git` commands (including `status`, `diff`, `log`, `checkout`, `switch`, `pull`, `push`, `commit`, `stash`, `reset`, `merge`, `rebase`). If git is needed, stop and ask the user.
- Do **not** paraphrase this workflow into new commands. Only run the exact commands shown in this file.
- If you believe an additional command is required, stop and ask the user before running anything.

Use this workflow together with `/wikipedia1` for **Languages of South Asia**.

Must preserve append-only registry; never delete ISOs.

1. Use `tools/mixer-meta/wikipedia-languages-of-south-asia.json` as the current list.
2. Apply `/wikipedia1` semantics: for each non-skipped language, reach **catalog + mixer-map + globally unique `bases[]` + race reachability**.
3. Refresh coverage for §8.4 in `DEVplans/Languages-Status.md` using the devplan helper.
