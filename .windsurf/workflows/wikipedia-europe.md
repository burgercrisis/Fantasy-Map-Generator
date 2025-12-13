---
description: Wikipedia Languages of Europe wiring
auto_execution_mode: 1
---

Use this workflow together with `/wikipedia1` for **Languages of Europe – regional subset** (§8.7).

Must preserve append-only registry; never delete ISOs.

1. Treat `tools/mixer-meta/wikipedia-languages-of-europe.json` as the current list JSON.
2. Apply `/wikipedia1` semantics: for each non-skipped European language, ensure **catalog + mixer-map + globally unique `bases[]` + race reachability**.
3. Refresh coverage for §8.7 in `DEVplans/Languages-Status.md` via the devplan helper after each wiring batch.

When selecting the “next batch”, treat `full` / “not-yet-full” as a **coverage** status (catalog + mixer-map). Uniqueness debt and race reachability are tracked separately and still need to be resolved before calling the list “fully represented”.
