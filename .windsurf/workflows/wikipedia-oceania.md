---
description: Wikipedia Languages of Oceania wiring
auto_execution_mode: 1
---

Use this workflow together with `/wikipedia1` for **Languages of Oceania – Papuan & Pacific subset** (§8.6).

1. Treat `tools/mixer-meta/wikipedia-languages-of-oceania.json` as the current list JSON.
2. Follow `/wikipedia1` exactly, scoped to this list:
   - Use the coverage helpers on this JSON.
   - For each non-skipped item, bring it all the way to **catalog entry + mixer-map entry + globally unique `bases[]` + race reachability** in the same pass.
   - Re-run `update-wikipedia-list-coverage-in-devplan.js` for this JSON to refresh §8.6 in `DEVplans/Languages-Status.md`.
3. On each `continue`, take the next batch of not-yet-full (coverage) Oceania languages (group by family/region where possible) and repeat.
