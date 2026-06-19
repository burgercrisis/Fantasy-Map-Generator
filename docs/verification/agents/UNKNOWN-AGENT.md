# Unknown Agent — Language Namebase Verification

## Your Assignment

You are responsible for verifying ALL 75 language entries in `modules/namebases-unknown.js`
and ALL 10 entries in `modules/namebases-fantasy.js`.

**Critical principle**: Names are defined by the LANGUAGE that coined them, not by the region they're in. Your job is to ensure every name in each entry is authentically from that language.

## Your Workspace

- **Source files**: `modules/namebases-unknown.js`, `modules/namebases-fantasy.js`
- **Progress log**: `docs/verification/reports/unknown-progress.md`
- **Checkpoint**: `docs/verification/checkpoints/unknown-checkpoint.json`
- **Research notes**: `docs/verification/research/by-language/<name>.md`
- **Continent findings**: `docs/verification/research/by-continent/unknown-findings.md`

## Unknown File (75 entries)

The unknown file contains languages that don't fit neatly into continent categories.
These may be:
- Languages spanning multiple continents
- Languages with unclear classification
- Creoles and pidgins
- Constructed languages (non-fantasy)
- Historical/extinct languages

### Verification Approach

For each entry:
1. Research the language to determine what it actually is
2. Verify it's a real language (not a placeholder or error)
3. Verify all names are authentic place names from the correct language
4. If the language belongs in a specific file, FLAG it for cross-file
   resolution (don't move it yourself — let the coordinator decide)
5. Verify name count (minimum 25, target 50+)

### Special Cases

#### Creoles and Pidgins
- These often span multiple continents
- Use place names from the creole's specific region
- Examples: Haitian Creole (Haiti), Tok Pisin (PNG), etc.

#### Historical/Extinct Languages
- Use historical place names from the language's era and region
- Latin: use Roman-era place names (Roma, Carthago, Alexandria, etc.)
- Ancient Greek: use ancient Greek place names (Athina, Sparti, Korinthos, etc.)
- Old English: use Anglo-Saxon place names

#### Constructed Languages (non-fantasy)
- If a constructed language has associated place names, verify them
- If not, flag for coordinator review

## Fantasy File (10 entries)

The fantasy file contains fictional languages. These are intentionally not real-world
languages, but they should still:
1. Have internally consistent naming patterns
2. Have sufficient name counts (25+)
3. Not accidentally contain real-world place names (unless intentional)

### Verification Approach for Fantasy

For each fantasy entry:
1. Verify the name is a recognized fantasy language/conlang
2. Check if the names follow consistent fictional patterns
3. If the entry accidentally contains real-world names, decide:
   - If intentional (e.g., a fantasy world based on real cultures) → keep
   - If accidental contamination → remove and replace with fictional names
4. Ensure minimum 25 names

## Quality Checklist Per Language

- [ ] Language name is real (or intentionally fictional for fantasy)
- [ ] All names are authentic from the language (or intentionally fictional for fantasy)
- [ ] All names use Latin/Romanized script
- [ ] Minimum 25 names (target 50+)
- [ ] `min`/`max` are reasonable
- [ ] No encoding issues
