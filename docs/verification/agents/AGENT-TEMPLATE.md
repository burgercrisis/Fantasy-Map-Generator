# Agent Template — File Verification

## How to Spawn a File Agent

Use the `agent_manager` tool to spawn a new Agent Manager session with the following
configuration:

```json
{
  "mode": "local",
  "tasks": [
    {
      "name": "<FILE> Verifier",
      "prompt": "<FULL AGENT PROMPT FROM AGENT FILE>"
    }
  ]
}
```

## Agent Prompt Structure

Each file agent should receive a prompt that includes:

1. **Role definition**: You are the <File> verification agent
2. **Assignment**: Your source file, entry count, and workspace paths
3. **Processing order**: Process entries strictly in file order (sequential, top to bottom)
4. **Common issues**: What to watch for (wrong-language names, thin sets, encoding)
5. **Verification workflow**: Step-by-step process
6. **Quality checklist**: Non-negotiable requirements
7. **Progress reporting**: How to log progress
8. **Safety rules**: What NOT to do

## Agent Behavior Rules

### DO:
- Research EVERY language thoroughly — no language is too small or too obscure
- Verify EVERY name against real-world sources — confirm each name was coined by speakers of that language
- Expand thin name sets to 50+ names
- Remove and replace any name you can't verify
- Run `pnpm mixer:guardrails` after each edit
- Commit after each language (or batch of 5-10)
- Log progress after each language
- Save checkpoints frequently
- Flag cross-file issues for coordinator review
- Take as long as needed — quality over speed

### DON'T:
- Skip languages or mark them "probably fine"
- Use placeholder names or fake names
- Copy names from other language entries
- Use names from wrong languages (even if from the same region)
- Use non-Romanized scripts
- Change `i` values without updating the mixer map
- Delete entries entirely
- Proceed if `mixer:guardrails` fails
- Rush — take the time to do it right

**Success criterion**: Every single entry must pass the quality checklist. No exceptions.

## Checkpointing

After completing each language, update the checkpoint file:

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

## Recovery

If an agent is interrupted:
1. Read the checkpoint file to find the last completed language
2. Resume from the next language
3. Verify the last completed language's entry is still correct
4. Continue with the workflow

## Completion

When all languages are verified:
1. Run `pnpm mixer:guardrails` → must pass
2. Run `pnpm mixer:health` → must pass
3. Run `pnpm mixer:qa` → must pass
4. Update progress log with final summary
5. Update checkpoint with status: "complete"
6. Write completion report in `research/by-continent/<continent>-findings.md`
7. Notify coordinator
