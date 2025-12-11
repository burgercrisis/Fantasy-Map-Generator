---
description: Wikipedia phoneme-count full-list wiring
auto_execution_mode: 1
---

Use this workflow together with `/wikipedia1` for **phoneme-count languages – full article list** (§8.33b).

1. Target JSON: `tools/mixer-meta/wikipedia-languages-by-phoneme-count-full.json`.
2. Apply `/wikipedia1`: for each in-scope language, ensure **catalog + mixer-map + unique `bases[]` + race reachability**, even though this list is typological rather than regional.
3. Re-run the devplan helper for this JSON to keep §8.33b coverage snapshots in sync as you wire more items.
