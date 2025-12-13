---
description: Wikipedia mutually intelligible full-list wiring
auto_execution_mode: 1
---

Use this workflow together with `/wikipedia1` for **mutually intelligible languages – full article list** (§8.34b).

Must preserve append-only registry; never delete ISOs.

1. Treat `tools/mixer-meta/wikipedia-mutually-intelligible-languages-full.json` as the current list JSON.
2. Follow `/wikipedia1`, but with special attention to base design:
   - Use the list as a reminder where very close bases/mixes may be justified.
   - Still aim for **globally unique `bases[]`** per language unless explicitly documented otherwise.
   - Ensure each language has **catalog + mixer-map + race reachability**.
3. Keep §8.34b in `DEVplans/Languages-Status.md` updated using the devplan helper.
