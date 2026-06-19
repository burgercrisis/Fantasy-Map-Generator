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

After each agent completes:
1. Review the progress report
2. Run `pnpm mixer:guardrails`
3. Run `pnpm mixer:health`
4. Spot-check some entries for quality
5. Commit the changes

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

With 8 agents working in parallel, each language takes approximately 15-30 minutes
to verify thoroughly (research, verify names, expand, document).

| Agent | Entries | Estimated Time |
|-------|---------|----------------|
| Asia | 1,270 | ~32-64 hours |
| Dedicated | 1,368 | ~34-68 hours |
| Africa | 790 | ~20-40 hours |
| Europe | 722 | ~18-36 hours |
| Oceania | 581 | ~15-30 hours |
| North America | 232 | ~6-12 hours |
| South America | 170 | ~4-8 hours |
| Unknown | 85 | ~2-4 hours |

**Total wall-clock time**: ~34-68 hours (determined by the largest agent)
**Total work**: ~130-260 agent-hours

## Quality Expectations

After verification, every entry should have:
- ✅ 50-100+ verified authentic place names
- ✅ All names from the correct LANGUAGE (not just the correct region — language determines name origin)
- ✅ All names in Romanized Latin script
- ✅ Unique, collision-free index
- ✅ Correct `min`, `max`, `d`, `m` values
- ✅ No encoding issues
- ✅ Research log documenting verification
