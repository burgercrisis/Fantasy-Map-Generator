---
description: Makes languages unique 3
auto_execution_mode: 1
---

Use these helper tools to find languages whose bases are not unique.  We want every language to have a unique base reflective of its own linguistics. Continue to implement these desires using these tools until it is done for all. You will be Worker 3, so run the test before every task and consider the 3rd group of 10 languages presenting issues to be the ones you will work on that session, then do it again next session which will begin when I tell you "continue".

Only use this workflow **after** the Wikipedia full-list pipeline (steps 1–6 in `DEVplans/Languages-Status.md` §8) is complete for the current project state (helpers normalized to full lists, devplan snapshots updated, seed/subset artifacts removed, and lists wired into catalog/map). Do not change coverage status for Wikipedia lists here; focus strictly on making existing mapped languages' `bases[]` globally unique in line with those devplans.

node tools/mixer-diagnostics/report-language-mixer-base-clusters.js [--min-size=N] [--family=...] [--category=...] [--region=...] [--include-families]
node tools/check-language-mixer-map-inconsistencies.js [--family=...] [--category=...] [--region=...] [--base=IDX[,IDX...]] [--show-all-bases]
