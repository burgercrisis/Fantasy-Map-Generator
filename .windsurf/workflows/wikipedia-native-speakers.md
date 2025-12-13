---
description: Wikipedia native-speakers full-list wiring
auto_execution_mode: 1
---

Use this workflow together with `/wikipedia1` when working on the **List of languages by number of native speakers** subset JSON.

Must preserve append-only registry; never delete ISOs.

1. Treat `tools/mixer-meta/wikipedia-list-languages-by-native-speakers.json` as the **current list JSON**.
2. Follow the `/wikipedia1` workflow exactly, scoped to this list:
   - Use coverage helpers on this JSON.
   - For each language, ensure **catalog entry + mixer-map entry + globally unique `bases[]` + race reachability**.
   - Re-run `update-wikipedia-list-coverage-in-devplan.js` for this JSON to refresh §8.2 in `DEVplans/Languages-Status.md`.
3. On `continue`, take the next batch of not-yet-full (coverage) languages from this list.
