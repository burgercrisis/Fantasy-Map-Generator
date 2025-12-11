---
description: Wikipedia Uralic languages full-family wiring
auto_execution_mode: 1
---

Use this workflow together with `/wikipedia1` for **Uralic languages – full family list** (§8.31b).

1. Target JSON: `tools/mixer-meta/wikipedia-uralic-languages-full.json`.
2. Apply `/wikipedia1`: for each non-skipped Uralic lect, ensure **catalog entry + mixer-map entry + globally unique `bases[]` (respecting documented exceptions like the Finnic/Volgaic base-9 cluster) + race reachability**.
3. After each batch, re-run the devplan helper for this JSON to keep §8.31b snapshots current.
