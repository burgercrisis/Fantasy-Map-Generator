# Agent Coordination Framework

## Architecture

The verification system uses a **hub-and-spoke** model:
- **Coordinator** (human or integrator agent) oversees the entire process
- **File agents** work independently on their assigned files (files are organized by continent for convenience, but the language's names are defined by the language, not the file/region)
- **Cross-cutting concerns** are handled by the coordinator

```
                    ┌─────────────────┐
                    │   COORDINATOR   │
                    │  (Human/Agent)  │
                    └────────┬────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
    ┌─────▼─────┐     ┌─────▼─────┐     ┌─────▼─────┐
    │  EUROPE   │     │  AFRICA   │     │   ASIA    │
    │  AGENT    │     │  AGENT    │     │  AGENT    │
    │ 722 entries│    │ 790 entries│    │1270 entries│
    └───────────┘     └───────────┘     └───────────┘
    
    ┌───────────┐     ┌───────────┐     ┌───────────┐
    │   NORTH   │     │   SOUTH   │     │  OCEANIA  │
    │ AMERICA   │     │ AMERICA   │     │  AGENT    │
    │  AGENT    │     │  AGENT    │     │ 581 entries│
    │232 entries│     │170 entries│     └───────────┘
    └───────────┘     └───────────┘
    
    ┌───────────┐     ┌───────────┐
    │ DEDICATED │     │  UNKNOWN  │
    │  AGENT    │     │  AGENT    │
    │1368 entries│    │ 75 entries│
    └───────────┘     └───────────┘
```

## Agent Lifecycle

### 1. Initialization
1. Read `MASTER-PLAN.md` for overall strategy
2. Read `QUALITY-STANDARDS.md` for quality requirements
3. Read the continent-specific agent file (e.g., `agents/EUROPE-AGENT.md`)
4. Load the current checkpoint (if resuming)
5. Load the source file (`modules/namebases-<continent>.js`)

### 2. Per-Language Processing
For each language entry in the assigned file:
1. Read the current entry
2. Research the language (Wikipedia, etc.)
3. Verify every name in the `b:` field
4. Fix any issues found
5. Write the fixed entry back
6. Log the results
7. Update checkpoint

### 3. Completion
1. Run `pnpm mixer:guardrails` on the modified file
2. Run `pnpm mixer:health` for overall health check
3. Generate final progress report
4. Write completion checkpoint
5. Notify coordinator

## File Locking & Safety

### Critical Files
These files are SHARED and require coordination:
- `config/language-mixer-map.json` — Only ONE agent modifies at a time
- `config/language-mixes.json` — Only ONE agent modifies at a time
- `config/language-mixer-map.js` — Regenerated, never hand-edited
- `config/language-mixes-all.js` — Regenerated, never hand-edited

### Agent-Specific Files
These files are EXCLUSIVE to each agent:
- `modules/namebases-<continent>.js` — Only the continent agent modifies this
- `reports/<continent>-progress.md` — Only the continent agent writes this
- `checkpoints/<continent>-checkpoint.json` — Only the continent agent writes this

### Lock Protocol
Before modifying a shared file:
1. Check `checkpoints/global-lock.json` for existing locks
2. If clear, write a lock entry with agent name and timestamp
3. Make changes
4. Run verification tools
5. Release the lock

## Checkpoint System

Each agent maintains a checkpoint file at `checkpoints/<continent>-checkpoint.json`:

```json
{
  "continent": "europe",
  "lastVerifiedIndex": 42,
  "lastVerifiedName": "German",
  "totalEntries": 722,
  "completedEntries": 42,
  "totalNamesVerified": 2150,
  "totalIssuesFixed": 18,
  "startedAt": "2026-06-18T15:00:00Z",
  "lastUpdate": "2026-06-18T16:30:00Z",
  "status": "in_progress",
  "currentLanguage": "French",
  "blockers": []
}
```

## Progress Reporting

Each agent writes to `reports/<continent>-progress.md` in this format:

```markdown
# Europe Agent Progress

## Status: IN_PROGRESS
## Last Update: 2026-06-18T16:30:00Z
## Progress: 42/722 (5.8%)

### Latest Completed
- ✅ German (i:0) — 89 names verified, 3 removed (wrong region)
- ✅ English (i:1) — 76 names verified, 0 issues
- ✅ French (i:2) — 92 names verified, 5 added

### Currently Processing
- 🔄 Italian (i:3) — researching...

### Blockers
- None

### Issues Log
| Language | Index | Issue | Resolution |
|----------|-------|-------|------------|
| German | 0 | 3 names from wrong region | Replaced with verified German places |
```

## Cross-File Coordination

### Shared Language Detection
Some languages may appear in multiple files. The coordinator maintains a
cross-reference at `reports/cross-continent-audit.md`:

```markdown
# Cross-Continent Audit

## Languages in Multiple Files
| Language | Files | Status |
|----------|-------|--------|
| Arabic | africa, asia | Intentional — different dialects |
| English | europe, northAmerica | NEEDS RESOLUTION |

## Shared Base Indices
| Base Index | Languages | Status |
|------------|-----------|--------|
| 42 | Arabic (africa), Arabic (asia) | Intentional |
```

### Resolution Protocol
When a cross-file issue is detected:
1. The discovering agent logs it in `reports/cross-continent-audit.md`
2. The coordinator reviews and decides on resolution
3. The coordinator assigns the fix to the appropriate agent
4. The fix is verified and logged

## Communication Protocol

### Agent → Coordinator
Agents report to the coordinator via:
1. Progress file updates (`reports/<continent>-progress.md`)
2. Checkpoint updates (`checkpoints/<continent>-checkpoint.json`)
3. Cross-continent issue flags (`reports/cross-continent-audit.md`)

### Coordinator → Agent
The coordinator communicates via:
1. Updated agent instruction files (`agents/<CONTINENT>-AGENT.md`)
2. Global lock file (`checkpoints/global-lock.json`)
3. Direct messages (in multi-agent system)

## Error Handling

### If an agent encounters an unknown language:
1. Log it in the progress report as BLOCKED
2. Research the language to determine if it's real
3. If real: verify and continue
4. If not real: flag for coordinator review
5. Move to the next language

### If an agent encounters encoding issues:
1. Document the exact issue
2. Fix the encoding (convert mojibake to correct UTF-8)
3. Verify the fix
4. Log the correction

### If mixer tools fail after changes:
1. DO NOT proceed to the next language
2. Investigate the failure
3. Fix the issue
4. Re-run tools until they pass
5. Only then continue

## Scaling Up

To add more agents:
1. Split a continent file into sub-regions
2. Create a new agent file in `agents/`
3. Assign a sub-range of entries
4. Ensure file locking is in place

Example: Asia could be split into:
- East Asia Agent (China, Japan, Korea, Mongolia)
- South Asia Agent (India, Pakistan, Bangladesh, Sri Lanka)
- Southeast Asia Agent (Thailand, Vietnam, Indonesia, Philippines)
- Central/West Asia Agent (Central Asia, Middle East, Caucasus)
