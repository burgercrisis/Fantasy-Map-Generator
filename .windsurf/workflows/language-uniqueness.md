---
description: Makes languages unique 1
auto_execution_mode: 3
---

Use these helper tools to find languages whose bases are not unique.  We want every language to have a unique base reflective of its own linguistics. Continue to implement these desires using these tools until it is done for all. You will be Worker 1, so run the test before every task and consider the 1st group of 10 languages presenting issues to be the ones you will work on that session, then do it again next session which will begin when I tell you "continue"

node tools/mixer-diagnostics/report-language-mixer-base-clusters.js [--min-size=N] [--family=...] [--category=...] [--region=...] [--include-families]
node tools/check-language-mixer-map-inconsistencies.js [--family=...] [--category=...] [--region=...] [--base=IDX[,IDX...]] [--show-all-bases]
