---
description: Wikipedia Languages of Africa full-list wiring
auto_execution_mode: 1
---

Use this workflow together with `/wikipedia1` when working on the **Languages of Africa – full table snapshot** list.

Must preserve append-only registry; never delete ISOs.

1. Treat `tools/mixer-meta/wikipedia-languages-of-africa-full.json` as the **current list JSON**.
2. Follow the `/wikipedia1` workflow exactly, but scoped to this list:
   - Use the coverage helpers against this JSON.
   - For each non-skipped item, bring it all the way to **catalog entry + mixer-map entry + globally unique `bases[]` + race reachability** in the same pass.
   - Re-run `update-wikipedia-list-coverage-in-devplan.js` for this JSON to refresh §8.1b in `DEVplans/Languages-Status.md`.
3. When I say `continue`, pick the **next batch of not-yet-full (coverage) African languages** from this list (grouped by family/region where possible) and repeat.
