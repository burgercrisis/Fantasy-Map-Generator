# Language Namebase Verification System

## Purpose

This directory contains the complete multi-agent verification system for auditing every
language namebase entry in the Fantasy-Map-Generator project. The goal is to ensure:

1. **Every name in every `b:` field is an authentic place name that comes from the correct LANGUAGE** — A name is Spanish because Spanish speakers named it, not because it's in Spain. If Spanish speakers named a place in Japan, it's Spanish, not Japanese.
2. **Every language entry has a unique, collision-free index**
3. **Every language has at least 25 verified authentic place names (target: 50-100+)**
4. **Every language is distinct from every other language**
5. **All names use Romanized script compatible with the Latin alphabet**
6. **The mixer pipeline works correctly for all language combinations**

## Directory Structure

```
docs/verification/
  README.md                          ← You are here
  MASTER-PLAN.md                     ← Overall strategy and progress
  AGENT-COORDINATION.md              ← How agents work together
  QUALITY-STANDARDS.md               ← Non-negotiable quality requirements
  CONTINENT-ASSIGNMENTS.md           ← Which agent works on which continent
  TROUBLESHOOTING.md                 ← Common issues and resolutions
  agents/
    AGENT-TEMPLATE.md                ← Template for spawning continent agents
    EUROPE-AGENT.md                  ← Europe-specific agent instructions
    AFRICA-AGENT.md                  ← Africa-specific agent instructions
    ASIA-AGENT.md                    ← Asia-specific agent instructions
    NORTH-AMERICA-AGENT.md           ← North America-specific agent instructions
    SOUTH-AMERICA-AGENT.md           ← South America-specific agent instructions
    OCEANIA-AGENT.md                 ← Oceania-specific agent instructions
    DEDICATED-AGENT.md               ← Dedicated bases agent instructions
    UNKNOWN-AGENT.md                 ← Unknown/fantasy agent instructions
  reports/
    europe-progress.md               ← Europe agent progress log
    africa-progress.md               ← Africa agent progress log
    asia-progress.md                 ← Asia agent progress log
    north-america-progress.md        ← North America agent progress log
    south-america-progress.md        ← South America agent progress log
    oceania-progress.md              ← Oceania agent progress log
    dedicated-progress.md            ← Dedicated bases progress log
    unknown-progress.md              ← Unknown/fantasy progress log
    collision-report.md              ← Index collision audit results
    cross-continent-audit.md         ← Cross-continent consistency report
    final-verification-report.md     ← Final comprehensive report
  research/
    by-language/
      <language-name>.md             ← Per-language research notes
    by-continent/
      europe-findings.md             ← Europe research findings
      africa-findings.md             ← Africa research findings
      asia-findings.md               ← Asia research findings
      north-america-findings.md      ← North America research findings
      south-america-findings.md      ← South America research findings
      oceania-findings.md            ← Oceania research findings
  templates/
    language-entry-template.md       ← Template for verified language entries
    research-log-template.md         ← Template for per-language research logs
    agent-handoff-template.md        ← Template for agent handoff notes
  checkpoints/
    europe-checkpoint.json            ← Europe agent save state
    africa-checkpoint.json            ← Africa agent save state
    asia-checkpoint.json              ← Asia agent save state
    north-america-checkpoint.json     ← North America agent save state
    south-america-checkpoint.json     ← South America agent save state
    oceania-checkpoint.json           ← Oceania agent save state
    dedicated-checkpoint.json         ← Dedicated agent save state
    unknown-checkpoint.json           ← Unknown agent save state
```

## Scale

| File | Entries | Agent |
|------|---------|-------|
| namebases-europe.js | 722 | Europe Agent |
| namebases-africa.js | 790 | Africa Agent |
| namebases-asia.js | 1,270 | Asia Agent |
| namebases-northAmerica.js | 232 | North America Agent |
| namebases-southAmerica.js | 170 | South America Agent |
| namebases-oceania.js | 581 | Oceania Agent |
| namebases-dedicated.js | 1,368 | Dedicated Agent |
| namebases-unknown.js | 75 | Unknown Agent |
| namebases-fantasy.js | 10 | (manual review) |
| **TOTAL** | **5,218** | **8 agents** |

## Pipeline

The verification follows a strict 4-phase pipeline. See `MASTER-PLAN.md` for details.

### Phase 1: Index Collision Audit & Repair
- Detect and fix all index collisions
- Ensure every mixer map reference resolves correctly
- **Gate: Zero collisions, mixer:guardrails passes**

### Phase 2: Per-Entry Name Quality Verification
- Every `b:` field verified for authentic place names
- Minimum 25 names per entry (target 50-100+)
- Names must be from the correct language (language determines name authenticity, not geography — if Spanish speakers named a place anywhere in the world, it's Spanish)
- **Gate: All entries pass quality standards**

### Phase 3: Cross-Entry Consistency Audit
- Related languages must be distinct
- No unrelated languages sharing bases
- **Gate: No anomalous clusters**

### Phase 4: Pipeline Validation
- Full mixer health suite passes
- All guardrails pass
- **Gate: All tools report clean**

## Agent Coordination

- **One agent per file** works independently on its assigned namebase file (files are organized by continent for convenience, but the continent file assignment is purely organizational — a language's names are defined by the language, not the region)
- Agents write progress to `reports/<continent>-progress.md`
- Agents save checkpoints to `checkpoints/<continent>-checkpoint.json`
- A coordinator (human or integrator agent) reviews completed work
- Cross-continent issues are flagged in `reports/cross-continent-audit.md`

## Critical Rules

1. **NEVER change an `i` value without updating all mixer map references**
2. **NEVER delete a namebase entry** (would shift all subsequent indices)
3. **NEVER use placeholder names, fake names, or names from wrong regions**
4. **ALWAYS verify names against real-world sources (Wikipedia, GEOnames, etc.)**
5. **ALWAYS commit after completing each language (or batch of 5-10)**
6. **ALWAYS run `pnpm mixer:guardrails` after any changes to namebase files**
7. **ALWAYS regenerate bundles after changes: `node tools/mixer-core/generate-language-mixer.js`**

## Getting Started

1. Read `MASTER-PLAN.md` for the full strategy
2. Read `QUALITY-STANDARDS.md` for non-negotiable requirements
3. Read `AGENT-COORDINATION.md` for how agents work together
4.  Spawn file agents using the templates in `agents/`
5. Monitor progress via `reports/` directory
