# Oceania Agent — Language Namebase Verification

## Your Assignment

You are responsible for verifying ALL 581 language entries in `modules/namebases-oceania.js`.

This file contains languages from the Pacific region: Polynesian, Micronesian, Melanesian,
Australian Aboriginal, and Papuan languages.

**Critical principle**: Names are defined by the LANGUAGE that coined them, not by the region they're in. Your job is to ensure every name in each entry is authentically from that language.

## Your Workspace

- **Source file**: `modules/namebases-oceania.js`
- **Progress log**: `docs/verification/reports/oceania-progress.md`
- **Checkpoint**: `docs/verification/checkpoints/oceania-checkpoint.json`
- **Research notes**: `docs/verification/research/by-language/<name>.md`
- **Continent findings**: `docs/verification/research/by-continent/oceania-findings.md`

## Processing Order

Process entries **strictly in file order** (sequential, from top to bottom). Do NOT skip around or reorder by language size. This ensures predictable progress and makes resumption from checkpoints straightforward.

## Common Issues to Watch For

### 1. English Names in Bases
Many language bases may be contaminated with English names. Prefer names from the indigenous language. The test is: "Was this name coined by speakers of this language?"

### 2. Romanization
Polynesian and other languages have specific romanization (macrons, ʻokina, etc.). Keep diacritics that are part of standard orthography.

### 3. Very Small Name Sets
Many languages have very few documented place names. Include island names, atoll names, village names, river names, and mountain names.

### 4. Cross-File Issues
Some languages span multiple regions. Ensure each entry has names from the relevant language variety.

## Verification Workflow

Same as the general workflow in MASTER-PLAN.md.

### Step 1: Research the Language
1. Search Wikipedia: `"<Language>" language`
2. Note: islands/regions where spoken, speaker count, language family
3. Note: typical place name patterns and romanization

### Step 2: Verify Each Name
1. Extract all names from the `b:` field
2. Count them — if <25, flag for expansion
3. Spot-check at least 20% of names (minimum 10)
4. For each checked name:
   - Verify it's a real place
   - Verify the name is authentically from the correct language
   - Verify it's in Romanized form
   - Prefer indigenous-language names over colonial names

### Step 3: Expand if Needed
If fewer than 30 names (50 preferred):
1. Search for place names from the language itself
2. Use Wikipedia lists of islands, villages, and geographic features
3. Include island names and atoll names
4. For Papuan languages, use river names and mountain names

### Step 4-6: Same as general workflow

## Quality Checklist Per Language

- [ ] Language name is a real language
- [ ] All names in `b:` are real places
- [ ] All names are from the correct LANGUAGE (language determines name origin, not geography)
- [ ] All names use Latin/Romanized script
- [ ] Minimum 25 names (target 50+)
- [ ] Prefer indigenous-language place names over colonial names
- [ ] `min`/`max` are reasonable
- [ ] `d` value matches language phonotactics
- [ ] No encoding issues

