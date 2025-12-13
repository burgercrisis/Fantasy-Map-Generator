---
description: Multi-agent NO_UNIQ_BASE2 burn-down
auto_execution_mode: 1
---
You’re currently marked `in_progress` in [tools/mixer-diagnostics/_no_uniq_base_claims.json](cci:7://file:///e:/code/Fantasy-Map-Generator/tools/mixer-diagnostics/_no_uniq_base_claims.json:0:0-0:0). Please do this NOW for your claim, then continue your batch.

0) Goal + posture (non-blocking)
Primary goal: remove NO_UNIQ_BASE for your batch (each ISO must have ≥1 globally-unique base index).
Secondary quality goals (do NOT block progress):
- strict unique seeds >= 1
- normalized unique seeds >= 10
If you can’t hit these today, still land uniqBase and document the shortfall in your claim notes.

1) Sync your claim to reality
- Open: tools/mixer-diagnostics/_no_uniq_base_claims.json
- Find your claim entry (your workerId / batchId)
- Set updatedAt to now
- Update notes to include:
  - Actual ISO->base mapping you applied (one per line, e.g. iso->NNN)
  - Any reserved ranges you did NOT use (if any)
  - For each ISO that still has strict<1 or norm<10, record:
    - iso: strictUniqueSeeds=X, normUniqueSeeds=Y (and whether you attempted seed improvements)

2) Verify your work (required)
Run:
- pnpm exec node tools/mixer-core/run-language-mixer-suite.js
- pnpm exec node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --only-failures --limit=500
Confirm: NONE of your batch ISOs appear under NO_UNIQ_BASE.

3) Optional quality improvement pass (only if quick)
If an ISO is uniqBase but strict<1 or norm<10:
- Optionally improve the dedicated base’s seed list (append-only) in modules/namebases-real.js
- Re-run the report to see if strict/norm improved
If it’s not quick, stop and just document the remaining strict/norm debt in notes.

4) Update status
- If NO_UNIQ_BASE cleared for all batch ISOs: set status="complete" and note verification in notes
- If blocked: set status="stalled" and write the exact blocker + what decision is needed

5) Continue
- If complete: claim the next batch (same family/category if possible) and proceed.

When done, reply with:
workerId=__ batchId=__ status=complete|stalled
…and paste your final ISO->base list (+ any remaining strict/norm debt lines).