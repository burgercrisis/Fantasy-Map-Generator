---
description: Wikipedia Languages of Southeast Asia wiring
auto_execution_mode: 1
---

Use this workflow together with `/wikipedia1` for **Languages of Southeast Asia – regional subset** (§8.10).

Must preserve append-only registry; never delete ISOs.

1. Treat `tools/mixer-meta/wikipedia-languages-of-southeast-asia.json` as the current list JSON.
2. Follow `/wikipedia1` exactly, ensuring each in-scope language reaches **catalog + mixer-map + unique `bases[]` + race reachability** in the same pass.
3. Keep §8.10 in `DEVplans/Languages-Status.md` synced via the devplan helper.
