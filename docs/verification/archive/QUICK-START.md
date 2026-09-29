# Verification System — Quick Start

## Current State (Baseline)

Run on: 2026-06-18

| Metric | Value |
|--------|-------|
| Total entries | 5,218 |
| Entries with <25 names | 45 |
| Entries with <50 names | 4,595 |
| Entries with 80+ names | 10 |
| Entries with 100+ names | 1 |
| Index collisions (Type C) | 0 ✅ |
| Cross-continent duplicates | 1,368 (dedicated overrides) |

## Critical Finding

**99.8% of entries have fewer than 80 names.** Most have only 25-49 names.
The target is 50-100+ names per entry. This means the vast majority of entries
need significant expansion.

Additionally, based on spot-checks, many existing names appear to be from wrong
languages (e.g., Arabic names in European language bases). This means verification
and cleanup is needed even for entries that meet the count threshold. Remember: names
are defined by the LANGUAGE that coined them, not by the region they're in.

## How to Start

### Step 1: Run Baseline Analysis
```bash
node tools/verification/collision-audit.js
node tools/verification/name-count-analyzer.js
node tools/verification/cross-continent-check.js
pnpm mixer:guardrails
pnpm mixer:health
```

### Step 2: Spawn File Agents

Spawn up to 8 agents in parallel using the `agent_manager` tool. Each agent gets:
- Its file-specific instruction file from `docs/agents/`
- Its source file (`modules/namebases-<file>.js`)
- Its workspace paths for progress, checkpoints, and research

Example for Europe:
```
agent_manager with mode=local, tasks=[{
  name: "Europe Verifier",
  prompt: <contents of docs/verification/agents/EUROPE-AGENT.md>
}]
```

### Step 3: Monitor Progress

Check `docs/verification/reports/<continent>-progress.md` for each agent's progress.

### Step 4: Review and Validate

After each agent completes a batch of entries (5-10 at a time):
1. Review the progress report
2. Run `pnpm mixer:guardrails`
3. Run `pnpm mixer:health`
4. **Verify entries against sources** — pick a few entries from the agent's work and confirm the names in their `b:` fields are real places from the correct language. If you find unverified names, send the agent back to fix them.
5. Only mark entries as fully COMPLETE after you have confirmed the agent verified every name.

### Step 5: Final Validation

After ALL agents complete:
```bash
pnpm mixer:guardrails
pnpm mixer:health
pnpm mixer:doctor
pnpm mixer:qa
node tools/tracking/consolidated-quality-tracker.js
node tools/mixer-core/generate-language-mixer.js
```

## Agent Spawn Order

Spawn agents in this order (largest files first for maximum parallelism):

1. **Asia Agent** (1,270 entries) — largest file, start first
2. **Dedicated Agent** (1,368 entries) — second largest
3. **Africa Agent** (790 entries)
4. **Europe Agent** (722 entries)
5. **Oceania Agent** (581 entries)
6. **North America Agent** (232 entries)
7. **South America Agent** (170 entries)
8. **Unknown Agent** (85 entries) — smallest, start last

## Expected Timeline

ACCURACY IS MORE IMPORTANT THAN SPEED. Do NOT rush entries to finish faster. If an entry takes 2 hours to verify properly, it takes 2 hours. It is better to have 10 entries fully verified than 100 entries with unverified names.

With agents working in parallel, each language takes approximately 30-60 minutes to verify thoroughly (research sources, verify every name individually, expand if needed, document). Some languages may take longer if sources are hard to find.

| Agent | Entries | Estimated Time |
|-------|---------|----------------|
| Asia | 1,270 | ~63-127 hours |
| Dedicated | 1,368 | ~68-137 hours |
| Africa | 790 | ~40-79 hours |
| Europe | 722 | ~36-72 hours |
| Oceania | 581 | ~29-58 hours |
| North America | 232 | ~12-23 hours |
| South America | 170 | ~9-17 hours |
| Unknown | 85 | ~4-9 hours |

**Total wall-clock time**: ~68-137 hours (determined by the largest agent)
**Total work**: ~275-550 agent-hours

## Quality Expectations

After verification, every entry should have:
- ✅ 25+ verified authentic place names (50-100+ preferred)
- ✅ EVERY name individually verified against a reliable source — NO exceptions
- ✅ All names from the correct LANGUAGE (not just the correct region — language determines name origin)
- ✅ All names in Romanized Latin script
- ✅ Unique, collision-free index
- ✅ Correct `min`, `max`, `d`, `m` values
- ✅ No encoding issues
- ✅ Research log documenting EVERY name and its source
