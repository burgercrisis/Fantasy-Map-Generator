---
description: Wikipedia Languages of Europe wiring
auto_execution_mode: 1
---

Use this workflow together with `/wikipedia1` for **Languages of Europe – regional subset** (§8.7).

1. Treat `tools/mixer-meta/wikipedia-languages-of-europe.json` as the current list JSON.
2. Apply `/wikipedia1` semantics: for each non-skipped European language, ensure **catalog + mixer-map + globally unique `bases[]` + race reachability**.
3. Refresh coverage for §8.7 in `DEVplans/Languages-Status.md` via the devplan helper after each wiring batch.
